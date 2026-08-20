export type Role = 'SUPER_ADMIN' | 'CUSTOMER';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';
export type CampaignStatus = 'DRAFT' | 'PUBLISHED' | 'PAUSED';
export type ElementType = 'PHOTO' | 'TEXT' | 'SHAPE';
export type FieldType = 'text' | 'textarea' | 'number' | 'phone' | 'email' | 'date' | 'select' | 'photo';

export interface User {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt?: string;
  profile?: CustomerProfile;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  fullName: string;
  businessName: string;
  phone?: string | null;
  logoUrl?: string | null;
  brandColor?: string | null;
  address?: string | null;
  website?: string | null;
  whatsappNumber?: string | null;
  createdAt?: string;
}

export interface FileAsset {
  id: string;
  customerId?: string | null;
  type: 'POSTER' | 'THUMBNAIL' | 'USER_PHOTO' | 'LOGO' | 'GENERATED_POSTER';
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  url: string;
  createdAt: string;
}

export interface TemplateElementStyles {
  shape?: 'rectangle' | 'circle' | 'rounded';
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  shadow?: boolean;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: string;
  color?: string;
  fill?: string;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
  backgroundColor?: string;
  [key: string]: any;
}

export interface TemplateElement {
  id: string;
  templateId?: string;
  type: ElementType;
  fieldId?: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
  visible?: boolean;
  locked?: boolean;
  stylesJson?: string;
  styles?: TemplateElementStyles;
}

export interface CampaignField {
  id?: string;
  campaignId?: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string | null;
  maxLength?: number | null;
  optionsJson?: string | null;
  orderIndex?: number;
}

export interface CampaignTemplate {
  id: string;
  campaignId: string;
  width: number;
  height: number;
  backgroundFileId?: string | null;
  backgroundFile?: FileAsset | null;
  version: number;
  createdAt?: string;
  updatedAt?: string;
  elements: TemplateElement[];
}

export interface Campaign {
  id: string;
  customerId: string;
  title: string;
  slug: string;
  description?: string | null;
  category: string;
  status: CampaignStatus;
  posterFileId?: string | null;
  posterFile?: FileAsset | null;
  viewsCount: number;
  generationsCount: number;
  downloadsCount: number;
  sharesCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  template?: CampaignTemplate | null;
  fields?: CampaignField[];
  customer?: {
    profile?: CustomerProfile;
  };
}

export interface Generation {
  id: string;
  campaignId: string;
  campaign?: Campaign;
  anonymousSessionId?: string | null;
  metadataJson?: string;
  outputUrl: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  totals: {
    views: number;
    generations: number;
    downloads: number;
    shares: number;
    campaigns: number;
    published: number;
    drafts: number;
  };
  timeSeries: {
    date: string;
    views: number;
    generations: number;
    downloads: number;
    shares: number;
  }[];
  campaignPerformance: Campaign[];
}
