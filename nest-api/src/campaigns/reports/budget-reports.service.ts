import { Inject, Injectable } from '@nestjs/common';
import { Campaign } from '@src/campaigns/models/campaign.model';
import { BudgetReport } from './models/budget-report.model';
import { PrismaService } from '@src/database/prisma.service';
import { IndividualCampaignReportData } from './models/campaign-data.model';
import {
  differenceInCalendarDays,
  differenceInWeeks,
  endOfDay,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { BudgetReportFiltersInput } from './dto/budget-report-filters.input';
import { ReportDimension } from './enums/report-dimensions.enum';
import { Creative } from '@prisma/client';
import { CampaignTableRowData } from './models/campaign-table-row-data.model';

@Injectable()
export class BudgetReportsService {
  private getCurrentDate: () => Date;

  constructor(
    private prisma: PrismaService,
    @Inject('CURRENT_DATE') getCurrentDate: () => Date,
  ) {
    this.getCurrentDate = getCurrentDate;
  }

  async generateReport(
    filters: BudgetReportFiltersInput,
  ): Promise<BudgetReport> {
    const { campaignIds } = filters;

    const campaignsWithAllCreatives = await this.prisma.campaign.findMany({
      where: {
        id: { in: campaignIds },
      },
      orderBy: { startDate: 'desc' },
      include: { creatives: true },
    });

    const campaignsData = await Promise.all(
      campaignsWithAllCreatives.map(
        async (campaign) => await this.processCampaignData(campaign, filters),
      ),
    );

    return {
      campaignsData,
    };
  }

  private async processCampaignData(
    campaign: Campaign,
    {
      dimension,
      startDate,
      endDate,
      creativeSizes,
      creativeStatus,
    }: BudgetReportFiltersInput,
  ) {
    const { amount: budget, currency } = this.parseBudgetString(
      campaign.budget,
    );

    if (this.getCurrentDate() < startOfDay(startDate)) {
      return {
        campaign,
        currency,
        budget,
        budgetSpent: 0,
        tableData: [],
      };
    }

    const where = {
      AND: [
        {
          campaigns: {
            some: {
              id: campaign.id,
            },
          },
        },
        creativeStatus ? { status: creativeStatus } : undefined,
        startDate <= endOfDay(campaign.startDate)
          ? undefined
          : { addedDate: { gte: startOfDay(startDate) } },
        endDate >= startOfDay(campaign.endDate)
          ? undefined
          : { addedDate: { lte: endOfDay(endDate) } },
        creativeSizes && creativeSizes.length > 0
          ? { size: { in: creativeSizes } }
          : undefined,
      ].filter(Boolean),
    };

    const matchingCreatives = await this.prisma.creative.findMany({
      where,
    });

    if (matchingCreatives.length === 0) {
      return {
        campaign,
        currency,
        budget,
        budgetSpent: 0,
        tableData: [],
      };
    }

    const totalBudgetSpent = this.calculateTotalBudgetSpent(
      campaign.startDate,
      campaign.endDate,
      budget,
    );

    const proportionalBudgetSpentPerCreative =
      totalBudgetSpent / campaign.creatives.length;

    const normalizedCreatives = await Promise.all(
      matchingCreatives.map(async (creative) => {
        let addedDate = creative.addedDate;

        if (addedDate > endOfDay(campaign.endDate)) {
          addedDate = campaign.endDate;
        }

        if (addedDate < startOfDay(campaign.startDate)) {
          addedDate = campaign.startDate;
        }

        return {
          ...creative,
          addedDate,
        };
      }),
    );

    const tableData = this.generateTableDataForCampaign(
      campaign,
      dimension,
      normalizedCreatives,
      proportionalBudgetSpentPerCreative,
    );

    return <IndividualCampaignReportData>{
      campaign,
      currency,
      budget,
      budgetSpent:
        totalBudgetSpent *
        (matchingCreatives.length / campaign.creatives.length),
      tableData,
    };
  }

  private generateTableDataForCampaign(
    campaign: Campaign,
    dimension: ReportDimension,
    matchingCreatives: Creative[],
    creativeCost: number,
  ): CampaignTableRowData[] {
    const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');
    const getMonth = (date: Date) => format(startOfMonth(date), 'yyyy-MM');

    if (matchingCreatives.length === 0) {
      return [];
    }

    const groupedData: { [key: string]: number } = {};

    matchingCreatives.forEach((creative) => {
      const { addedDate, size } = creative;

      let key: string;
      switch (dimension) {
        case ReportDimension.DAY:
          key = formatDate(addedDate);
          break;
        case ReportDimension.WEEK_NUMBER:
          key = this.getWeekNumberRelativeToCampaign(
            campaign.startDate,
            addedDate,
          );
          break;
        case ReportDimension.MONTH:
          key = getMonth(addedDate);
          break;
        case ReportDimension.SIZE:
          key = size;
          break;
        default:
          throw new Error('Unsupported dimension');
      }

      if (!groupedData[key]) {
        groupedData[key] = 0;
      }

      groupedData[key] += creativeCost;
    });

    return Object.entries(groupedData).map(([label, amount]) => ({
      label,
      amount,
    }));
  }

  private parseBudgetString(budget: string): {
    amount: number;
    currency: string;
  } {
    const match = budget.match(/^(\d+(\.\d{1,2})?)([A-Z]{1,3})$/);

    if (!match) {
      throw new Error('Invalid budget string format');
    }

    const amountString = match[1];
    const currency = match[3];

    const amount = amountString ? parseFloat(amountString) : 0;

    return {
      amount,
      currency,
    };
  }

  private getWeekNumberRelativeToCampaign(campaignStartDate: Date, date: Date) {
    const campaignWeekStart = startOfWeek(campaignStartDate, {
      weekStartsOn: 1,
    });
    const dateWeekStart = startOfWeek(date, { weekStartsOn: 1 });

    const weekDifference = differenceInWeeks(dateWeekStart, campaignWeekStart);

    return `Week #${weekDifference + 1}`;
  }

  private calculateTotalBudgetSpent(
    startDate: Date,
    endDate: Date,
    budget: number,
  ): number {
    const today = this.getCurrentDate();
    const campaignDuration = differenceInCalendarDays(endDate, startDate) + 1;
    const todayDuration = differenceInCalendarDays(today, startDate) + 1;

    if (todayDuration >= campaignDuration) {
      return budget;
    }

    return (budget * todayDuration) / campaignDuration;
  }
}
