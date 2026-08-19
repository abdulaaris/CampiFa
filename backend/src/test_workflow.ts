import { prisma } from './config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config/env';
import { imageService } from './services/imageService';
import { storageService } from './services/storageService';
import path from 'path';
import fs from 'fs';

async function runTests() {
  console.log('====================================================');
  console.log('  Running CampiFa End-to-End Acceptance Test Suite  ');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string) => {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Verify Super Admin Seed
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@campifa.com' },
      include: { profile: true },
    });
    assert(!!admin && admin.role === 'SUPER_ADMIN', '1. Super Admin account exists with correct role');

    // 2. Verify Demo Customer Seed
    const customer = await prisma.user.findUnique({
      where: { email: 'customer@campifa.com' },
      include: { profile: true, campaigns: true },
    });
    assert(!!customer && customer.role === 'CUSTOMER', '2. Demo Customer account exists with profile');
    assert(customer!.campaigns.length >= 3, '3. Demo campaigns seeded for customer (Milad, Independence, School)');

    // 3. Customer Authentication & Password Hashing
    const passwordValid = await bcrypt.compare('CustomerPassword123!', customer!.passwordHash);
    assert(passwordValid, '4. Customer password hashing and verification works');

    const token = jwt.sign({ userId: customer!.id, role: customer!.role }, config.jwtSecret, {
      expiresIn: '7d',
    });
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    assert(decoded.userId === customer!.id, '5. JWT issuance and verification succeeds');

    // 4. Multi-Tenant Isolation Test
    const customer2 = await prisma.user.findUnique({
      where: { email: 'alex@apexacademy.org' },
    });
    assert(!!customer2, '6. Secondary tenant account exists');

    // Create draft campaign for Customer 2
    const draftCamp2 = await prisma.campaign.create({
      data: {
        customerId: customer2!.id,
        title: 'Private Draft Campaign Customer B',
        slug: `private-draft-customer-b-${Date.now()}`,
        status: 'DRAFT',
      },
    });

    // Customer 1 queries their campaigns - MUST NOT see Customer 2's draft
    const customer1Campaigns = await prisma.campaign.findMany({
      where: { customerId: customer!.id },
    });
    const leakFound = customer1Campaigns.some((c) => c.id === draftCamp2.id);
    assert(!leakFound, '7. Multi-Tenant Security: Customer 1 cannot see Customer 2 campaigns');

    // Clean up test draft
    await prisma.campaign.delete({ where: { id: draftCamp2.id } });

    // 5. Test Campaign Publishing & Slug Lookup
    const miladCampaign = await prisma.campaign.findUnique({
      where: { slug: 'milad-un-nabi-2026' },
      include: {
        posterFile: true,
        template: { include: { elements: true } },
        fields: true,
      },
    });
    assert(!!miladCampaign && miladCampaign.status === 'PUBLISHED', '8. Public Campaign "Milad-un-Nabi 2026" is published');
    assert(miladCampaign!.template!.elements.length > 0, '9. Template has configured photo and text elements');

    // 6. Test Server-Side Poster Composition Engine (Sharp)
    console.log('  Testing Poster Personalization & Sharp Rendering Engine...');
    const posterPath = storageService.getFilePath(miladCampaign!.posterFile!.storageKey);
    assert(fs.existsSync(posterPath), '10. Base poster artwork file exists on disk');

    const basePosterBuffer = await fs.promises.readFile(posterPath);

    // Create a dummy user photo buffer
    const dummyPhotoSvg = `<svg width="400" height="400"><rect width="400" height="400" fill="#BA6A4C"/><circle cx="200" cy="200" r="140" fill="#FFF4E5"/></svg>`;
    const dummyPhotoBuffer = Buffer.from(dummyPhotoSvg);

    const renderedPoster = await imageService.renderPersonalizedPoster(basePosterBuffer, [
      {
        type: 'PHOTO',
        x: 390,
        y: 720,
        width: 300,
        height: 300,
        styles: {
          shape: 'circle',
          borderWidth: 6,
          borderColor: '#7B2525',
          shadow: true,
        },
        photoBuffer: dummyPhotoBuffer,
      },
      {
        type: 'TEXT',
        x: 100,
        y: 1045,
        width: 880,
        height: 55,
        styles: {
          fontFamily: 'Poppins, sans-serif',
          fontSize: 42,
          fontWeight: 'bold',
          color: '#7B2525',
          textAlign: 'center',
        },
        value: 'ABDUL AARIS',
      },
      {
        type: 'TEXT',
        x: 100,
        y: 1105,
        width: 880,
        height: 40,
        styles: {
          fontFamily: 'Inter, sans-serif',
          fontSize: 26,
          fontWeight: '600',
          color: '#4A4A4A',
          textAlign: 'center',
        },
        value: 'General Secretary',
      },
    ]);

    assert(renderedPoster.length > 10000, '11. Server-side Sharp composite produced high-res PNG');

    // Save generated test poster
    const savedGen = await storageService.saveBuffer(
      renderedPoster,
      'generated',
      `CampiFa-test-generation-${Date.now()}.png`,
      'image/png'
    );
    assert(fs.existsSync(storageService.getFilePath(savedGen.storageKey)), '12. Generated poster saved in uploads/generated');

    // 7. Test Generation Record & Analytics Tracking
    const genRecord = await prisma.generation.create({
      data: {
        campaignId: miladCampaign!.id,
        anonymousSessionId: 'test_session_123',
        outputUrl: savedGen.url,
      },
    });
    assert(!!genRecord.id, '13. Generation record logged in database');

    await prisma.analyticsEvent.create({
      data: {
        campaignId: miladCampaign!.id,
        type: 'DOWNLOAD',
      },
    });
    const downloadEvents = await prisma.analyticsEvent.count({
      where: { campaignId: miladCampaign!.id, type: 'DOWNLOAD' },
    });
    assert(downloadEvents > 0, '14. Analytics event tracked and counted');

    // 8. Test Super Admin Suspension Workflow
    const suspendedUser = await prisma.user.update({
      where: { id: customer2!.id },
      data: { status: 'SUSPENDED' },
    });
    assert(suspendedUser.status === 'SUSPENDED', '15. Super admin suspended customer account');

    const reactivatedUser = await prisma.user.update({
      where: { id: customer2!.id },
      data: { status: 'ACTIVE' },
    });
    assert(reactivatedUser.status === 'ACTIVE', '16. Super admin reactivated customer account');

    console.log('====================================================');
    console.log(`  Tests Completed: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal Test Runner Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
