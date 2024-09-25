import { Field, InputType, Int } from '@nestjs/graphql';
import { MaxLength, Matches, IsArray, ArrayMaxSize } from 'class-validator';
import { CampaignStatus } from '@prisma/client';

@InputType()
export class AddCampaignInput {
  @Field()
  @MaxLength(255)
  name: string;

  @Field()
  @Matches(/^\d+(\.\d{1,2})?[A-Z]{1,3}$/, {
    message: 'Budget must be a valid number followed by a currency symbol',
  })
  @MaxLength(255)
  budget: string;

  @Field(() => [Int])
  @IsArray()
  @ArrayMaxSize(1000)
  creatives: number[];

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date)
  endDate: Date;

  @Field(() => CampaignStatus)
  status: CampaignStatus;
}
