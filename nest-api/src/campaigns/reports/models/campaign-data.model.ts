import { Field, ObjectType } from '@nestjs/graphql';
import { Campaign } from '@src/campaigns/models/campaign.model';
import { CampaignTableRowData } from './campaign-table-row-data.model';

@ObjectType({ description: 'Ad campaign report.' })
export class IndividualCampaignReportData {
  @Field(() => String)
  currency: string;

  @Field(() => Number)
  budget: number;

  @Field(() => Number)
  budgetSpent: number;

  @Field(() => Campaign)
  campaign: Campaign;

  @Field(() => [CampaignTableRowData])
  tableData: CampaignTableRowData[];
}
