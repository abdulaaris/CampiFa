import { prisma } from './config/prisma';

async function clearDemoCampaigns() {
  console.log('🧹 Cleaning up all demo campaigns...');

  // Delete all generations
  const deletedGens = await prisma.generation.deleteMany({});
  console.log(`Deleted ${deletedGens.count} generations.`);

  // Delete all analytics events
  const deletedEvents = await prisma.analyticsEvent.deleteMany({});
  console.log(`Deleted ${deletedEvents.count} analytics events.`);

  // Delete all template elements
  const deletedElements = await prisma.templateElement.deleteMany({});
  console.log(`Deleted ${deletedElements.count} template elements.`);

  // Delete all campaign templates
  const deletedTemplates = await prisma.campaignTemplate.deleteMany({});
  console.log(`Deleted ${deletedTemplates.count} campaign templates.`);

  // Delete all campaign dynamic fields
  const deletedFields = await prisma.campaignField.deleteMany({});
  console.log(`Deleted ${deletedFields.count} campaign fields.`);

  // Delete all campaigns
  const deletedCampaigns = await prisma.campaign.deleteMany({});
  console.log(`Deleted ${deletedCampaigns.count} campaigns.`);

  console.log('✅ All demo campaigns removed successfully! Clean slate ready.');
  process.exit(0);
}

clearDemoCampaigns().catch((err) => {
  console.error('Error cleaning demo campaigns:', err);
  process.exit(1);
});
