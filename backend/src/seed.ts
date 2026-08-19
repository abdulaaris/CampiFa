import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

function escapeXml(unsafe: string): string {
  return (unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

async function createSamplePoster(
  title: string,
  themeColor: string,
  accentColor: string,
  subtitle: string,
  footerNote: string,
  width = 1080,
  height = 1350
): Promise<Buffer> {
  const safeTitle = escapeXml(title.toUpperCase());
  const safeSubtitle = escapeXml(subtitle);
  const safeFooter = escapeXml(footerNote);

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${themeColor}" />
          <stop offset="60%" stop-color="#1A1110" />
          <stop offset="100%" stop-color="#0D0908" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FCD34D" />
          <stop offset="50%" stop-color="#F59E0B" />
          <stop offset="100%" stop-color="#D97706" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="15" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" blend="over" />
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

      <!-- Decorative Ornaments / Frames -->
      <circle cx="${width / 2}" cy="320" r="380" fill="${accentColor}" opacity="0.08" />
      <circle cx="${width / 2}" cy="320" r="280" fill="none" stroke="${accentColor}" stroke-width="1.5" opacity="0.2" stroke-dasharray="8,8" />
      <circle cx="${width / 2}" cy="320" r="240" fill="none" stroke="${accentColor}" stroke-width="1" opacity="0.3" />

      <!-- Top Header Badge -->
      <rect x="${width / 2 - 180}" y="70" width="360" height="44" rx="22" fill="#FFFFFF" fill-opacity="0.1" stroke="${accentColor}" stroke-opacity="0.4" />
      <text x="${width / 2}" y="98" font-family="Montserrat, sans-serif" font-size="16" font-weight="700" fill="#FFF4E5" text-anchor="middle" letter-spacing="4">OFFICIAL CAMPAIGN</text>

      <!-- Main Title -->
      <text x="${width / 2}" y="220" font-family="Cinzel, Georgia, serif" font-size="64" font-weight="bold" fill="url(#goldGrad)" text-anchor="middle" filter="url(#glow)">${safeTitle}</text>
      
      <!-- Subtitle -->
      <text x="${width / 2}" y="280" font-family="Montserrat, sans-serif" font-size="28" font-weight="600" fill="#FFF4E5" text-anchor="middle" letter-spacing="2">${safeSubtitle}</text>

      <!-- Decorative divider line -->
      <line x1="${width / 2 - 160}" y1="320" x2="${width / 2 + 160}" y2="320" stroke="${accentColor}" stroke-width="2" opacity="0.6" />
      <polygon points="${width / 2},314 ${width / 2 + 8},320 ${width / 2},326 ${width / 2 - 8},320" fill="${accentColor}" />

      <!-- Middle Message Box -->
      <rect x="100" y="380" width="${width - 200}" height="140" rx="16" fill="#FFFFFF" fill-opacity="0.05" stroke="#FFFFFF" stroke-opacity="0.1" />
      <text x="${width / 2}" y="440" font-family="Inter, sans-serif" font-size="22" fill="#E2D9D2" text-anchor="middle">Join us in commemorating this historic milestone with pride and unity.</text>
      <text x="${width / 2}" y="480" font-family="Inter, sans-serif" font-size="18" font-style="italic" fill="${accentColor}" text-anchor="middle">&quot;Together building a brighter future&quot;</text>

      <!-- Personalization Section Placeholder Frame (Customer Design) -->
      <!-- Lower Card Area where user details will sit -->
      <rect x="70" y="650" width="${width - 140}" height="560" rx="28" fill="#FFFFFF" fill-opacity="0.95" />
      <rect x="70" y="650" width="${width - 140}" height="560" rx="28" fill="none" stroke="${accentColor}" stroke-width="2" opacity="0.3" />

      <!-- Subtle pattern in card -->
      <circle cx="${width / 2}" cy="850" r="170" fill="${accentColor}" opacity="0.03" />

      <!-- Footer -->
      <text x="${width / 2}" y="1270" font-family="Inter, sans-serif" font-size="16" font-weight="500" fill="#FFF4E5" opacity="0.7" text-anchor="middle" letter-spacing="1">${safeFooter}</text>
      <text x="${width / 2}" y="1305" font-family="Inter, sans-serif" font-size="13" fill="#BA6A4C" text-anchor="middle" letter-spacing="2">POWERED BY CAMPIFA • I-FA DESIGN</text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function main() {
  console.log('Seeding CampiFa Database...');

  const uploadsDir = path.resolve(__dirname, '../../uploads');
  const postersDir = path.join(uploadsDir, 'posters');
  const thumbnailsDir = path.join(uploadsDir, 'thumbnails');
  fs.mkdirSync(postersDir, { recursive: true });
  fs.mkdirSync(thumbnailsDir, { recursive: true });

  const salt = await bcrypt.genSalt(10);

  // 1. Super Admin Account
  const superAdminPasswordHash = await bcrypt.hash('AdminPassword123!', salt);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@campifa.com' },
    update: {
      passwordHash: superAdminPasswordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
    create: {
      email: 'admin@campifa.com',
      passwordHash: superAdminPasswordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      profile: {
        create: {
          fullName: 'Super Administrator',
          businessName: 'i-Fa Design Global',
          phone: '+1 (800) 555-0199',
          brandColor: '#7B2525',
          website: 'https://campifa.com',
        },
      },
    },
  });
  console.log('Super Admin ready: admin@campifa.com / AdminPassword123!');

  // 2. Demo Customer Account
  const customerPasswordHash = await bcrypt.hash('CustomerPassword123!', salt);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@campifa.com' },
    update: {
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
    create: {
      email: 'customer@campifa.com',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      profile: {
        create: {
          fullName: 'Demo Customer',
          businessName: 'Demo Events & Celebrations',
          phone: '+1 (555) 234-5678',
          brandColor: '#7B2525',
          website: 'https://demoevents.org',
          whatsappNumber: '+15552345678',
          address: '450 Innovation Blvd, Silicon Square',
        },
      },
    },
    include: { profile: true },
  });
  console.log('Demo Customer ready: customer@campifa.com / CustomerPassword123!');

  // 3. Second Customer (for tenant isolation demonstration)
  const customer2 = await prisma.user.upsert({
    where: { email: 'alex@apexacademy.org' },
    update: {
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
    create: {
      email: 'alex@apexacademy.org',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      profile: {
        create: {
          fullName: 'Alex Johnson',
          businessName: 'Apex International Academy',
          phone: '+1 (555) 987-6543',
          brandColor: '#1E3A8A',
          website: 'https://apexacademy.org',
        },
      },
    },
  });
  console.log('Secondary Customer ready: alex@apexacademy.org / CustomerPassword123!');

  // 4. Demo Campaigns Data
  const sampleCampaigns = [
    {
      title: 'Milad-un-Nabi 2026',
      slug: 'milad-un-nabi-2026',
      description: 'Grand Celebration Poster - Share your warm wishes with custom photo and name personalization.',
      category: 'religious',
      themeColor: '#7B2525',
      accentColor: '#D97706',
      subtitle: 'PEACE • COMPASSION • BLESSINGS',
      footerNote: 'Official Community Organizing Committee',
    },
    {
      title: 'Independence Day 2026',
      slug: 'independence-day-2026',
      description: 'Celebrating Freedom and National Pride - Generate your commemorative national day poster.',
      category: 'national',
      themeColor: '#1E3A8A',
      accentColor: '#F59E0B',
      subtitle: 'HONORING OUR HEROES AND HERITAGE',
      footerNote: 'National Youth Council & Heritage Society',
    },
    {
      title: 'School Achievement 2026',
      slug: 'school-achievement-2026',
      description: 'Annual Academic Honors & Valedictorian Recognition Ceremony.',
      category: 'education',
      themeColor: '#065F46',
      accentColor: '#10B981',
      subtitle: 'EXCELLENCE • LEADERSHIP • SUCCESS',
      footerNote: 'Board of Education & Academic Excellence Foundation',
    },
  ];

  for (const c of sampleCampaigns) {
    // Generate Ready-made Poster Image
    const posterBuffer = await createSamplePoster(
      c.title,
      c.themeColor,
      c.accentColor,
      c.subtitle,
      c.footerNote
    );

    const filename = `${c.slug}-poster.png`;
    const posterStorageKey = `posters/${filename}`;
    const posterPath = path.join(uploadsDir, posterStorageKey);
    await fs.promises.writeFile(posterPath, posterBuffer);

    // Generate Thumbnail
    const thumbBuffer = await sharp(posterBuffer).resize(400).webp({ quality: 80 }).toBuffer();
    const thumbStorageKey = `thumbnails/thumb_${c.slug}.webp`;
    const thumbPath = path.join(uploadsDir, thumbStorageKey);
    await fs.promises.writeFile(thumbPath, thumbBuffer);

    // Create FileAsset records
    const posterAsset = await prisma.fileAsset.upsert({
      where: { storageKey: posterStorageKey },
      update: {},
      create: {
        customerId: customer.id,
        type: 'POSTER',
        originalName: `${c.title} Poster.png`,
        mimeType: 'image/png',
        size: posterBuffer.length,
        storageKey: posterStorageKey,
        url: `/uploads/${posterStorageKey}`,
      },
    });

    await prisma.fileAsset.upsert({
      where: { storageKey: thumbStorageKey },
      update: {},
      create: {
        customerId: customer.id,
        type: 'THUMBNAIL',
        originalName: `thumb_${c.title}.webp`,
        mimeType: 'image/webp',
        size: thumbBuffer.length,
        storageKey: thumbStorageKey,
        url: `/uploads/${thumbStorageKey}`,
      },
    });

    // Create or update campaign
    const campaign = await prisma.campaign.upsert({
      where: { slug: c.slug },
      update: {
        title: c.title,
        description: c.description,
        category: c.category,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        posterFileId: posterAsset.id,
        viewsCount: 142,
        generationsCount: 48,
        downloadsCount: 39,
        sharesCount: 24,
      },
      create: {
        customerId: customer.id,
        title: c.title,
        slug: c.slug,
        description: c.description,
        category: c.category,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        posterFileId: posterAsset.id,
        viewsCount: 142,
        generationsCount: 48,
        downloadsCount: 39,
        sharesCount: 24,
      },
    });

    // Create Template and Elements
    const template = await prisma.campaignTemplate.upsert({
      where: { campaignId: campaign.id },
      update: {
        width: 1080,
        height: 1350,
        backgroundFileId: posterAsset.id,
      },
      create: {
        campaignId: campaign.id,
        width: 1080,
        height: 1350,
        backgroundFileId: posterAsset.id,
      },
    });

    // Clean up elements and fields for idempotence
    await prisma.templateElement.deleteMany({ where: { templateId: template.id } });
    await prisma.campaignField.deleteMany({ where: { campaignId: campaign.id } });

    // Create Fields
    await prisma.campaignField.createMany({
      data: [
        {
          campaignId: campaign.id,
          name: 'photo',
          label: 'Your Photograph',
          type: 'photo',
          required: true,
          orderIndex: 0,
        },
        {
          campaignId: campaign.id,
          name: 'name',
          label: 'Full Name',
          type: 'text',
          placeholder: 'e.g. ABDUL AARIS',
          required: true,
          maxLength: 60,
          orderIndex: 1,
        },
        {
          campaignId: campaign.id,
          name: 'designation',
          label: 'Designation / Title',
          type: 'text',
          placeholder: 'e.g. General Secretary / Student Member',
          required: false,
          maxLength: 80,
          orderIndex: 2,
        },
        {
          campaignId: campaign.id,
          name: 'organization',
          label: 'Organization / Institution',
          type: 'text',
          placeholder: 'e.g. i-Fa Design Arts Foundation',
          required: false,
          maxLength: 100,
          orderIndex: 3,
        },
      ],
    });

    // Create Template Elements
    await prisma.templateElement.createMany({
      data: [
        {
          templateId: template.id,
          type: 'PHOTO',
          fieldId: 'photo',
          x: 390,
          y: 720,
          width: 300,
          height: 300,
          rotation: 0,
          zIndex: 1,
          visible: true,
          locked: false,
          stylesJson: JSON.stringify({
            shape: 'circle',
            borderWidth: 6,
            borderColor: c.themeColor,
            shadow: true,
          }),
        },
        {
          templateId: template.id,
          type: 'TEXT',
          fieldId: 'name',
          x: 100,
          y: 1045,
          width: 880,
          height: 55,
          rotation: 0,
          zIndex: 2,
          visible: true,
          locked: false,
          stylesJson: JSON.stringify({
            fontFamily: 'Poppins, sans-serif',
            fontSize: 42,
            fontWeight: 'bold',
            color: c.themeColor,
            textAlign: 'center',
          }),
        },
        {
          templateId: template.id,
          type: 'TEXT',
          fieldId: 'designation',
          x: 100,
          y: 1105,
          width: 880,
          height: 40,
          rotation: 0,
          zIndex: 3,
          visible: true,
          locked: false,
          stylesJson: JSON.stringify({
            fontFamily: 'Inter, sans-serif',
            fontSize: 26,
            fontWeight: '600',
            color: '#4A4A4A',
            textAlign: 'center',
          }),
        },
        {
          templateId: template.id,
          type: 'TEXT',
          fieldId: 'organization',
          x: 100,
          y: 1150,
          width: 880,
          height: 35,
          rotation: 0,
          zIndex: 4,
          visible: true,
          locked: false,
          stylesJson: JSON.stringify({
            fontFamily: 'Inter, sans-serif',
            fontSize: 20,
            fontWeight: 'normal',
            color: '#71717A',
            textAlign: 'center',
          }),
        },
      ],
    });

    console.log(`Campaign seeded: "${c.title}" -> /c/${c.slug}`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
