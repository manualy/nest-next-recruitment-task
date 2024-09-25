import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType({ description: 'Campaign table data.' })
export class CampaignTableRowData {
  @Field(() => String)
  label: string;

  @Field(() => Float)
  amount: number;
}
