import { Campaign, CampaignTemplate, TemplateElement, CampaignField, FileAsset } from '../types';
import { supabase, isSupabaseConfigured } from '../config/supabase';

const LOCAL_CAMPAIGNS_KEY = 'campifa_campaigns_db';
const LOCAL_TEMPLATES_KEY = 'campifa_templates_db';
const LOCAL_FILES_KEY = 'campifa_files_db';

const SUPABASE_BUCKET = 'campifa';
const SUPABASE_BASE_URL = 'https://pwsmfofmqgkmfretkfmu.supabase.co';

// Helper to get local data
function getLocalItem<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocalItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
}

// -------------------------------------------------------------
// Cloud Sync with Supabase Storage Bucket
// -------------------------------------------------------------
async function syncToSupabaseCloud(path: string, jsonData: any): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    await supabase.storage.from(SUPABASE_BUCKET).upload(`data/${path}`, blob, {
      upsert: true,
      contentType: 'application/json',
    });
  } catch (err) {
    console.warn(`Supabase cloud sync error for ${path}:`, err);
  }
}

async function fetchFromSupabaseCloud<T>(path: string): Promise<T | null> {
  try {
    const cloudUrl = `${SUPABASE_BASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/data/${path}?t=${Date.now()}`;
    const res = await fetch(cloudUrl);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Extract image dimensions in browser
export function getImageDimensions(file: File): Promise<{ width: number; height: number; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth || img.width || 1080,
          height: img.naturalHeight || img.height || 1350,
          dataUrl,
        });
      };
      img.onerror = () => reject(new Error('Failed to load image file.'));
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Optional free Supabase Storage uploader
async function uploadToSupabaseBucket(file: File, folder: string): Promise<string | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const filename = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;
    const { data, error } = await supabase.storage.from(SUPABASE_BUCKET).upload(filename, file, {
      upsert: true,
    });
    if (error) {
      console.warn('Supabase storage upload note:', error.message);
      return null;
    }
    const { data: publicUrlData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn('Supabase storage error:', err);
    return null;
  }
}

export const clientStorageService = {
  // 1. Upload Poster Base
  async uploadPoster(file: File): Promise<{ fileAsset: FileAsset; width: number; height: number; format: string }> {
    const { width, height, dataUrl } = await getImageDimensions(file);
    const assetId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const remoteUrl = await uploadToSupabaseBucket(file, 'posters');
    const finalUrl = remoteUrl || dataUrl;

    const fileAsset: FileAsset = {
      id: assetId,
      customerId: 'current_user',
      type: 'POSTER',
      originalName: file.name,
      mimeType: file.type || 'image/png',
      size: file.size,
      storageKey: `posters/${assetId}`,
      url: finalUrl,
      createdAt: new Date().toISOString(),
    };

    const files = getLocalItem<Record<string, FileAsset>>(LOCAL_FILES_KEY, {});
    files[assetId] = fileAsset;
    setLocalItem(LOCAL_FILES_KEY, files);

    return {
      fileAsset,
      width,
      height,
      format: file.type.split('/')[1] || 'png',
    };
  },

  // 2. Upload User Photo
  async uploadPhoto(file: File): Promise<{ fileAsset: FileAsset; url: string; storageKey: string }> {
    const { dataUrl } = await getImageDimensions(file);
    const assetId = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const remoteUrl = await uploadToSupabaseBucket(file, 'photos');
    const finalUrl = remoteUrl || dataUrl;

    const fileAsset: FileAsset = {
      id: assetId,
      customerId: null,
      type: 'USER_PHOTO',
      originalName: file.name,
      mimeType: file.type || 'image/jpeg',
      size: file.size,
      storageKey: `photos/${assetId}`,
      url: finalUrl,
      createdAt: new Date().toISOString(),
    };

    return {
      fileAsset,
      url: finalUrl,
      storageKey: fileAsset.storageKey,
    };
  },

  // 3. Upload Logo
  async uploadLogo(file: File): Promise<{ fileAsset: FileAsset; url: string }> {
    const { dataUrl } = await getImageDimensions(file);
    const assetId = `logo_${Date.now()}`;

    const remoteUrl = await uploadToSupabaseBucket(file, 'logos');
    const finalUrl = remoteUrl || dataUrl;

    const fileAsset: FileAsset = {
      id: assetId,
      customerId: 'current_user',
      type: 'LOGO',
      originalName: file.name,
      mimeType: file.type || 'image/png',
      size: file.size,
      storageKey: `logos/${assetId}`,
      url: finalUrl,
      createdAt: new Date().toISOString(),
    };

    return {
      fileAsset,
      url: finalUrl,
    };
  },

  // 4. Campaigns CRUD (with Supabase Cloud Sync)
  async fetchCloudCampaigns(): Promise<void> {
    const cloud = await fetchFromSupabaseCloud<Record<string, Campaign>>('campaigns.json');
    if (cloud && typeof cloud === 'object') {
      const local = getLocalItem<Record<string, Campaign>>(LOCAL_CAMPAIGNS_KEY, {});
      const merged = { ...cloud, ...local };
      setLocalItem(LOCAL_CAMPAIGNS_KEY, merged);
    }

    const cloudTemplates = await fetchFromSupabaseCloud<Record<string, CampaignTemplate>>('templates.json');
    if (cloudTemplates && typeof cloudTemplates === 'object') {
      const localTemplates = getLocalItem<Record<string, CampaignTemplate>>(LOCAL_TEMPLATES_KEY, {});
      const mergedT = { ...cloudTemplates, ...localTemplates };
      setLocalItem(LOCAL_TEMPLATES_KEY, mergedT);
    }
  },

  getCampaigns(params?: { status?: string; search?: string }): { campaigns: Campaign[]; pagination: any } {
    // Trigger background cloud sync
    this.fetchCloudCampaigns().catch(() => {});

    const campaignsMap = getLocalItem<Record<string, Campaign>>(LOCAL_CAMPAIGNS_KEY, {});
    let list = Object.values(campaignsMap);

    if (params?.status && params.status !== 'ALL') {
      list = list.filter((c) => c.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      campaigns: list,
      pagination: {
        total: list.length,
        page: 1,
        limit: 50,
        pages: 1,
      },
    };
  },

  getCampaignById(id: string): Campaign {
    const campaignsMap = getLocalItem<Record<string, Campaign>>(LOCAL_CAMPAIGNS_KEY, {});
    const templatesMap = getLocalItem<Record<string, CampaignTemplate>>(LOCAL_TEMPLATES_KEY, {});
    const campaign = campaignsMap[id] || Object.values(campaignsMap).find((c) => c.id === id || c.slug === id);

    if (!campaign) {
      return {
        id,
        customerId: 'current_user',
        title: 'Campaign',
        slug: `campaign-${id}`,
        category: 'general',
        status: 'DRAFT',
        viewsCount: 0,
        generationsCount: 0,
        downloadsCount: 0,
        sharesCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fields: [],
      };
    }

    // Attach template if available
    const template = templatesMap[campaign.id];
    if (template) {
      campaign.template = template;
    }

    return campaign;
  },

  async getPublicCampaign(slug: string): Promise<Campaign> {
    // 1. First sync with Supabase Cloud
    await this.fetchCloudCampaigns().catch(() => {});

    const campaignsMap = getLocalItem<Record<string, Campaign>>(LOCAL_CAMPAIGNS_KEY, {});
    const templatesMap = getLocalItem<Record<string, CampaignTemplate>>(LOCAL_TEMPLATES_KEY, {});
    const files = getLocalItem<Record<string, FileAsset>>(LOCAL_FILES_KEY, {});

    const list = Object.values(campaignsMap);
    const found = list.find((c) => c.slug === slug || c.id === slug);

    if (!found) {
      return {
        id: `camp_${slug}`,
        customerId: 'current_user',
        title: slug.replace(/-/g, ' ').toUpperCase(),
        slug: slug,
        category: 'general',
        status: 'PUBLISHED',
        viewsCount: 0,
        generationsCount: 0,
        downloadsCount: 0,
        sharesCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fields: [],
      };
    }

    // Attach complete template with elements and backgroundFile
    const template = templatesMap[found.id];
    if (template) {
      const bgAsset = template.backgroundFileId ? files[template.backgroundFileId] : null;
      found.template = {
        ...template,
        backgroundFile: bgAsset || found.posterFile || null,
        elements: (template.elements || []).map((el: any) => ({
          ...el,
          styles: typeof el.stylesJson === 'string' ? JSON.parse(el.stylesJson || '{}') : el.styles || {},
        })),
      };
    }

    return found;
  },

  createCampaign(data: { title: string; description?: string; category?: string; posterFileId?: string }): Campaign {
    const campaignsMap = getLocalItem<Record<string, Campaign>>(LOCAL_CAMPAIGNS_KEY, {});
    const files = getLocalItem<Record<string, FileAsset>>(LOCAL_FILES_KEY, {});

    const id = `camp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const baseSlug = slugify(data.title) || `campaign-${Date.now()}`;
    let uniqueSlug = baseSlug;
    let count = 1;
    while (Object.values(campaignsMap).some((c) => c.slug === uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${count++}`;
    }

    const posterAsset = data.posterFileId ? files[data.posterFileId] : null;

    const newCampaign: Campaign = {
      id,
      customerId: 'current_user',
      title: data.title,
      slug: uniqueSlug,
      description: data.description || null,
      category: data.category || 'general',
      status: 'DRAFT',
      posterFileId: data.posterFileId || null,
      posterFile: posterAsset || null,
      viewsCount: 0,
      generationsCount: 0,
      downloadsCount: 0,
      sharesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fields: [
        {
          id: `field_photo_${Date.now()}`,
          campaignId: id,
          name: 'photo',
          label: 'Your Photograph',
          type: 'photo',
          required: false,
          orderIndex: 0,
        },
        {
          id: `field_name_${Date.now()}`,
          campaignId: id,
          name: 'name',
          label: 'Full Name',
          type: 'text',
          required: true,
          placeholder: 'Enter your name',
          orderIndex: 1,
        },
      ],
    };

    // Default template elements
    const newTemplate: CampaignTemplate = {
      id: `tmpl_${id}`,
      campaignId: id,
      width: 1080,
      height: 1350,
      backgroundFileId: data.posterFileId || null,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      elements: [
        {
          id: `el_photo_${Date.now()}`,
          templateId: `tmpl_${id}`,
          type: 'PHOTO',
          fieldId: 'photo',
          x: 540,
          y: 650,
          width: 320,
          height: 320,
          rotation: 0,
          zIndex: 1,
          visible: true,
          locked: false,
          styles: {
            shape: 'circle',
            borderWidth: 6,
            borderColor: '#FFFFFF',
            shadow: true,
          },
        },
        {
          id: `el_name_${Date.now()}`,
          templateId: `tmpl_${id}`,
          type: 'TEXT',
          fieldId: 'name',
          x: 540,
          y: 900,
          width: 600,
          height: 80,
          rotation: 0,
          zIndex: 2,
          visible: true,
          locked: false,
          styles: {
            fontFamily: 'Anek Kannada',
            fontSize: 48,
            fontWeight: '600',
            fill: '#FFFFFF',
            textAlign: 'center',
            shadow: true,
          },
        },
      ],
    };

    newCampaign.template = newTemplate;
    campaignsMap[id] = newCampaign;
    setLocalItem(LOCAL_CAMPAIGNS_KEY, campaignsMap);

    const templatesMap = getLocalItem<Record<string, CampaignTemplate>>(LOCAL_TEMPLATES_KEY, {});
    templatesMap[id] = newTemplate;
    setLocalItem(LOCAL_TEMPLATES_KEY, templatesMap);

    // Sync to Supabase Cloud
    syncToSupabaseCloud('campaigns.json', campaignsMap);
    syncToSupabaseCloud('templates.json', templatesMap);

    return newCampaign;
  },

  updateCampaign(id: string, data: Partial<Campaign>): Campaign {
    const campaignsMap = getLocalItem<Record<string, Campaign>>(LOCAL_CAMPAIGNS_KEY, {});
    const existing = campaignsMap[id] || { id, title: 'Campaign', slug: `campaign-${id}`, status: 'DRAFT', createdAt: new Date().toISOString() };

    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    } as Campaign;

    campaignsMap[id] = updated;
    setLocalItem(LOCAL_CAMPAIGNS_KEY, campaignsMap);

    // Sync to Supabase Cloud
    syncToSupabaseCloud('campaigns.json', campaignsMap);

    return updated;
  },

  publishCampaign(id: string): Campaign {
    return this.updateCampaign(id, { status: 'PUBLISHED', publishedAt: new Date().toISOString() });
  },

  pauseCampaign(id: string): Campaign {
    return this.updateCampaign(id, { status: 'PAUSED' });
  },

  resumeCampaign(id: string): Campaign {
    return this.updateCampaign(id, { status: 'PUBLISHED' });
  },

  duplicateCampaign(id: string): Campaign {
    const original = this.getCampaignById(id);
    return this.createCampaign({
      title: `${original.title} (Copy)`,
      description: original.description || undefined,
      category: original.category,
      posterFileId: original.posterFileId || undefined,
    });
  },

  deleteCampaign(id: string): void {
    const campaignsMap = getLocalItem<Record<string, Campaign>>(LOCAL_CAMPAIGNS_KEY, {});
    delete campaignsMap[id];
    setLocalItem(LOCAL_CAMPAIGNS_KEY, campaignsMap);

    const templatesMap = getLocalItem<Record<string, CampaignTemplate>>(LOCAL_TEMPLATES_KEY, {});
    delete templatesMap[id];
    setLocalItem(LOCAL_TEMPLATES_KEY, templatesMap);

    // Sync to Supabase Cloud
    syncToSupabaseCloud('campaigns.json', campaignsMap);
    syncToSupabaseCloud('templates.json', templatesMap);
  },

  // 5. Template & Elements
  getTemplate(campaignId: string) {
    const campaignsMap = getLocalItem<Record<string, Campaign>>(LOCAL_CAMPAIGNS_KEY, {});
    const templatesMap = getLocalItem<Record<string, CampaignTemplate>>(LOCAL_TEMPLATES_KEY, {});
    const files = getLocalItem<Record<string, FileAsset>>(LOCAL_FILES_KEY, {});

    let campaign = campaignsMap[campaignId] || Object.values(campaignsMap).find((c) => c.id === campaignId || c.slug === campaignId);
    if (!campaign) {
      campaign = {
        id: campaignId,
        customerId: 'current_user',
        title: 'Campaign',
        slug: `campaign-${campaignId}`,
        category: 'general',
        status: 'DRAFT',
        viewsCount: 0,
        generationsCount: 0,
        downloadsCount: 0,
        sharesCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fields: [],
      };
      campaignsMap[campaignId] = campaign;
      setLocalItem(LOCAL_CAMPAIGNS_KEY, campaignsMap);
    }

    let template = templatesMap[campaignId];
    if (!template) {
      template = {
        id: `tmpl_${campaignId}`,
        campaignId,
        width: 1080,
        height: 1350,
        backgroundFileId: campaign.posterFileId || null,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        elements: [],
      };
      templatesMap[campaignId] = template;
      setLocalItem(LOCAL_TEMPLATES_KEY, templatesMap);
    }

    const posterFile = campaign.posterFileId ? files[campaign.posterFileId] : null;

    return {
      template: {
        ...template,
        elements: (template.elements || []).map((el: any) => ({
          ...el,
          styles: typeof el.stylesJson === 'string' ? JSON.parse(el.stylesJson || '{}') : el.styles || {},
        })),
      },
      posterFile: posterFile || campaign.posterFile || null,
      fields: campaign.fields || [],
      campaign: {
        id: campaign.id,
        title: campaign.title,
        slug: campaign.slug,
        status: campaign.status,
      },
    };
  },

  updateTemplate(
    campaignId: string,
    data: {
      width?: number;
      height?: number;
      backgroundFileId?: string | null;
      elements: any[];
      fields?: CampaignField[];
    }
  ) {
    const templatesMap = getLocalItem<Record<string, CampaignTemplate>>(LOCAL_TEMPLATES_KEY, {});
    const campaignsMap = getLocalItem<Record<string, Campaign>>(LOCAL_CAMPAIGNS_KEY, {});

    const template = templatesMap[campaignId] || {
      id: `tmpl_${campaignId}`,
      campaignId,
      version: 1,
      createdAt: new Date().toISOString(),
    };

    const updatedTemplate: CampaignTemplate = {
      ...template,
      width: data.width || template.width || 1080,
      height: data.height || template.height || 1350,
      backgroundFileId: data.backgroundFileId !== undefined ? data.backgroundFileId : template.backgroundFileId,
      elements: data.elements.map((el: any) => ({
        id: el.id,
        templateId: `tmpl_${campaignId}`,
        type: el.type,
        fieldId: el.fieldId || null,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        rotation: el.rotation || 0,
        zIndex: el.zIndex || 1,
        visible: el.visible !== undefined ? el.visible : true,
        locked: el.locked !== undefined ? el.locked : false,
        styles: el.styles || {},
        stylesJson: typeof el.stylesJson === 'string' ? el.stylesJson : JSON.stringify(el.styles || {}),
      })),
      version: (template.version || 1) + 1,
      updatedAt: new Date().toISOString(),
    };

    templatesMap[campaignId] = updatedTemplate;
    setLocalItem(LOCAL_TEMPLATES_KEY, templatesMap);

    if (data.fields && campaignsMap[campaignId]) {
      campaignsMap[campaignId].fields = data.fields;
      setLocalItem(LOCAL_CAMPAIGNS_KEY, campaignsMap);
    }

    if (campaignsMap[campaignId]) {
      campaignsMap[campaignId].template = updatedTemplate;
      setLocalItem(LOCAL_CAMPAIGNS_KEY, campaignsMap);
    }

    // Sync to Supabase Cloud
    syncToSupabaseCloud('templates.json', templatesMap);
    syncToSupabaseCloud('campaigns.json', campaignsMap);

    return updatedTemplate;
  },

  validateTemplate(campaignId: string) {
    const { template, fields } = this.getTemplate(campaignId);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!template.elements || template.elements.length === 0) {
      warnings.push('Template has no interactive elements.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  },

  // 6. Analytics Event recording
  recordAnalytics(campaignId: string, type: 'VIEW' | 'GENERATE' | 'DOWNLOAD' | 'SHARE') {
    const campaignsMap = getLocalItem<Record<string, Campaign>>(LOCAL_CAMPAIGNS_KEY, {});
    const campaign = campaignsMap[campaignId];
    if (!campaign) return;

    if (type === 'VIEW') campaign.viewsCount = (campaign.viewsCount || 0) + 1;
    if (type === 'GENERATE') campaign.generationsCount = (campaign.generationsCount || 0) + 1;
    if (type === 'DOWNLOAD') campaign.downloadsCount = (campaign.downloadsCount || 0) + 1;
    if (type === 'SHARE') campaign.sharesCount = (campaign.sharesCount || 0) + 1;

    campaignsMap[campaignId] = campaign;
    setLocalItem(LOCAL_CAMPAIGNS_KEY, campaignsMap);

    // Sync to Supabase Cloud
    syncToSupabaseCloud('campaigns.json', campaignsMap);
  },
};
