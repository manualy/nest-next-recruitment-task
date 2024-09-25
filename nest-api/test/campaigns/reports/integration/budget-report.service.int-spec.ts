import { Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { BudgetReportsService } from '@src/campaigns/reports/budget-reports.service';
import { ReportDimension } from '@src/campaigns/reports/enums/report-dimensions.enum';
import { PrismaService } from '@src/database/prisma.service';
import { generateMockReportData } from '../report-data.helper';
import { creativeFactory } from 'test/creatives/creative.factory';
import { CreativeStatus } from '@prisma/client';

describe('BudgetReportService Integration', () => {
  const currentMockDate = new Date(2024, 8, 1);
  let prismaService: PrismaService;
  let budgetReportService: BudgetReportsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('CURRENT_DATE')
      .useValue(() => currentMockDate)
      .compile();

    prismaService = moduleRef.get(PrismaService);
    budgetReportService = moduleRef.get(BudgetReportsService);
    await prismaService.cleanDatabase();
    await generateMockReportData(prismaService, currentMockDate);
  });

  describe('Generate report based on Campaigns and Dates', () => {
    it('Should show totalBudgetUsed based on today for an ongoing campaign', async () => {
      const result = await budgetReportService.generateReport({
        dimension: ReportDimension.SIZE,
        startDate: new Date(2024, 7, 1),
        endDate: new Date(2024, 8, 30),
        campaignIds: [1],
      });
      // 60 days total - 600 USD - total
      // 32nd day of the campaign today - 320 USD - expected

      if (result.campaignsData.length === 0) {
        throw new Error('Something went completely wrong.');
      }

      const data = result.campaignsData[0];

      expect(data.budget).toBe(600);
      expect(data.budgetSpent).toBe(320);
      expect(data.campaign.id).toBe(1);
    });
  });

  it('Should process only a portion of the budget used, based on the "Status" filter', async () => {
    const result = await budgetReportService.generateReport({
      dimension: ReportDimension.SIZE,
      startDate: new Date(2024, 7, 1),
      endDate: new Date(2024, 8, 30),
      creativeStatus: CreativeStatus.NEW,
      campaignIds: [1],
    });
    // 60 days total - 600 USD - total
    // 32nd day of the campaign today - 320 USD total

    // First week - 2 NEW - thursday & sunday (Total 4 creatives)
    // Additional four weeks - 28 total, 12 matching NEW filter
    // In total - 32 creatives, 10 matching
    // budget used -> 320 * 14/32 = 140 USD

    if (result.campaignsData.length === 0) {
      throw new Error('Something went completely wrong.');
    }

    const data = result.campaignsData[0];

    expect(data.budget).toBe(600);
    expect(data.budgetSpent).toBe(140);
    expect(data.campaign.id).toBe(1);
  });

  it('Should process only a portion of the budget used, based on the the "creative_sizes" filter', async () => {
    const result = await budgetReportService.generateReport({
      dimension: ReportDimension.SIZE,
      startDate: new Date(2024, 7, 1),
      endDate: new Date(2024, 8, 30),
      creativeSizes: ['100x200', '200x300'],
      campaignIds: [1],
    });
    // 60 days total - 600 USD - total
    // 32nd day of the campaign today - 320 USD total

    // First week - 2 100x200, 1 200x300 - thursday & sunday - selected 3, total: 4
    // Additional four weeks - 28 total, 20 matching
    // In total - 32 creatives, 23 matching
    // budget used -> 320 * 23/32 = 230 USD

    if (result.campaignsData.length === 0) {
      throw new Error('Something went completely wrong.');
    }

    const data = result.campaignsData[0];

    expect(data.budget).toBe(600);
    expect(data.budgetSpent).toBe(230);
    expect(data.campaign.id).toBe(1);
  });

  it('Should return empty if wrong "creative_size" was selected', async () => {
    const result = await budgetReportService.generateReport({
      dimension: ReportDimension.SIZE,
      startDate: new Date(2024, 7, 1),
      endDate: new Date(2024, 8, 30),
      creativeSizes: ['Non-existentxNon-existent'],
      campaignIds: [1],
    });

    if (result.campaignsData.length === 0) {
      throw new Error('Something went completely wrong.');
    }

    const data = result.campaignsData[0];

    expect(data.budget).toBe(600);
    expect(data.budgetSpent).toBe(0);
    expect(data.campaign.id).toBe(1);
    expect(data.tableData.length).toBe(0);
  });

  it('Should properly group by "Size" dimension', async () => {
    const result = await budgetReportService.generateReport({
      dimension: ReportDimension.SIZE,
      startDate: new Date(2024, 7, 5),
      endDate: new Date(2024, 8, 1),
      campaignIds: [1],
    });
    // 60 days total - 600 USD - total
    // selected 28 days of the campaign - 280 USD total
    // 100x200: 12 - 120 USD
    // 200x300: 8 - 80USD
    // 300x400: 8 - 80USD

    if (result.campaignsData.length === 0) {
      throw new Error('Something went completely wrong.');
    }

    const data = result.campaignsData[0];

    expect(data.budget).toBe(600);
    expect(data.budgetSpent).toBe(280);
    expect(data.campaign.id).toBe(1);
    expect(data.tableData).toEqual([
      { label: '100x200', amount: 120 },
      { label: '200x300', amount: 80 },
      { label: '300x400', amount: 80 },
    ]);
  });

  it('Should properly group by "Day" dimension', async () => {
    const result = await budgetReportService.generateReport({
      dimension: ReportDimension.DAY,
      startDate: new Date(2024, 7, 5),
      endDate: new Date(2024, 7, 11),
      campaignIds: [1],
    });
    // 7 days total - 70 USD, distributed evenly

    if (result.campaignsData.length === 0) {
      throw new Error('Something went completely wrong.');
    }

    const data = result.campaignsData[0];

    expect(data.budget).toBe(600);
    expect(data.budgetSpent).toBe(70);
    expect(data.campaign.id).toBe(1);
    expect(data.tableData).toEqual([
      { label: '2024-08-05', amount: 10 },
      { label: '2024-08-06', amount: 10 },
      { label: '2024-08-07', amount: 10 },
      { label: '2024-08-08', amount: 10 },
      { label: '2024-08-09', amount: 10 },
      { label: '2024-08-10', amount: 10 },
      { label: '2024-08-11', amount: 10 },
    ]);
  });

  it('Should properly group by "Week" dimension', async () => {
    const result = await budgetReportService.generateReport({
      dimension: ReportDimension.WEEK_NUMBER,
      startDate: new Date(2024, 7, 1),
      endDate: new Date(2024, 7, 25),
      campaignIds: [1],
    });
    // 60 days total - 600 USD - total
    // selected 25 days of the campaign - 250 USD total
    // Week #1: 40
    // Week #2: 70
    // Week #3: 70
    // Week #4: 70

    if (result.campaignsData.length === 0) {
      throw new Error('Something went completely wrong.');
    }

    const data = result.campaignsData[0];

    expect(data.budget).toBe(600);
    expect(data.budgetSpent).toBe(250);
    expect(data.campaign.id).toBe(1);
    expect(data.tableData).toEqual([
      { label: 'Week #1', amount: 40 },
      { label: 'Week #2', amount: 70 },
      { label: 'Week #3', amount: 70 },
      { label: 'Week #4', amount: 70 },
    ]);
  });

  it('Should properly group by "Month" dimension', async () => {
    const result = await budgetReportService.generateReport({
      dimension: ReportDimension.MONTH,
      startDate: new Date(2024, 7, 1),
      endDate: new Date(2024, 8, 30),
      campaignIds: [1],
    });

    // 60 days total - 320 USD total so far
    // 310 last month
    // 10 this month

    if (result.campaignsData.length === 0) {
      throw new Error('Something went completely wrong.');
    }

    const data = result.campaignsData[0];

    expect(data.budget).toBe(600);
    expect(data.budgetSpent).toBe(320);
    expect(data.campaign.id).toBe(1);
    expect(data.tableData).toEqual([
      { label: '2024-08', amount: 310 },
      { label: '2024-09', amount: 10 },
    ]);
  });

  it('Should be empty for a future campaign', async () => {
    const result = await budgetReportService.generateReport({
      dimension: ReportDimension.SIZE,
      startDate: new Date(2024, 10, 1),
      endDate: new Date(2024, 10, 21),
      campaignIds: [2],
    });

    if (result.campaignsData.length === 0) {
      throw new Error('Something went completely wrong.');
    }

    const data = result.campaignsData[0];

    expect(data.budget).toBe(210);
    expect(data.budgetSpent).toBe(0);
    expect(data.campaign.id).toBe(2);
    expect(data.tableData.length).toBe(0);
  });

  it('Should handle endge-case, of creatives out of campaign bounds', async () => {
    const twoOutOfBondsCreatives =
      await prismaService.creative.createManyAndReturn({
        data: [
          creativeFactory({ addedDate: new Date(2024, 7, 1) }),
          creativeFactory({ addedDate: new Date(2024, 7, 20) }),
        ],
      });

    await prismaService.campaign.update({
      where: { id: 3 },
      data: {
        creatives: {
          connect: twoOutOfBondsCreatives.map((creative) => ({
            id: creative.id,
          })),
        },
      },
    });

    const result = await budgetReportService.generateReport({
      dimension: ReportDimension.DAY,
      startDate: new Date(2024, 7, 3),
      endDate: new Date(2024, 7, 14),
      campaignIds: [3],
    });

    if (result.campaignsData.length === 0) {
      throw new Error('Something went completely wrong.');
    }

    const data = result.campaignsData[0];

    expect(data.budget).toBe(90);
    expect(data.budgetSpent).toBe(90);
    expect(data.campaign.id).toBe(3);
    expect(data.tableData).toEqual([
      { label: '2024-08-05', amount: 20 },
      { label: '2024-08-06', amount: 10 },
      { label: '2024-08-07', amount: 10 },
      { label: '2024-08-08', amount: 10 },
      { label: '2024-08-09', amount: 10 },
      { label: '2024-08-10', amount: 10 },
      { label: '2024-08-11', amount: 20 },
    ]);
  });

  it('Should be empty for a future campaign with creatives present', async () => {
    const newCreativeForTomorrowsCampaign = await prismaService.creative.create(
      { data: creativeFactory({ addedDate: currentMockDate }) },
    );
    await prismaService.campaign.update({
      where: { id: 2 },
      data: {
        creatives: {
          connect: { id: newCreativeForTomorrowsCampaign.id },
        },
      },
    });

    const result = await budgetReportService.generateReport({
      dimension: ReportDimension.SIZE,
      startDate: new Date(2024, 10, 1),
      endDate: new Date(2024, 10, 21),
      campaignIds: [2],
    });

    if (result.campaignsData.length === 0) {
      throw new Error('Something went completely wrong.');
    }

    const data = result.campaignsData[0];

    expect(data.budget).toBe(210);
    expect(data.budgetSpent).toBe(0);
    expect(data.campaign.id).toBe(2);
    expect(data.tableData.length).toBe(0);
  });
});
