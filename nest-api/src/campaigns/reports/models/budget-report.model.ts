import { Field, ObjectType } from '@nestjs/graphql';
import { IndividualCampaignReportData } from './campaign-data.model';

@ObjectType({ description: 'Budget report.' })
export class BudgetReport {
  @Field(() => [IndividualCampaignReportData])
  campaignsData: IndividualCampaignReportData[];
}
