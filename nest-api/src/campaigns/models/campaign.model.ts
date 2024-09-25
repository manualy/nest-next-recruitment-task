import { Field, Int, ObjectType } from '@nestjs/graphql';
import { CampaignStatus } from '@prisma/client';
import { Creative } from '@src/creatives/models/creative.model';

@ObjectType({ description: 'Ad campaign.' })
export class Campaign {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => String)
  budget: string;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date)
  endDate: Date;

  @Field(() => CampaignStatus)
  status: CampaignStatus;

  @Field(() => [Creative])
  creatives?: Creative[];

  @Field(() => Date)
  addedDate: Date;

  @Field(() => Date)
  changedDate: Date;
}
