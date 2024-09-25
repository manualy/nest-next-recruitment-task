import { Field, InputType, Int } from '@nestjs/graphql';
import {
  MaxLength,
  Matches,
  IsArray,
  ArrayMaxSize,
  IsOptional,
  IsDate,
  IsEnum,
} from 'class-validator';
import { CampaignStatus } from '@prisma/client';

@InputType()
export class UpdateCampaignInput {
  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Matches(/^\d+(\.\d{1,2})?[A-Z]{1,3}$/, {
    message: 'Budget must be a valid number followed by a currency symbol',
  })
  @MaxLength(255)
  budget?: string;

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1000)
  creatives?: number[];

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @Field(() => CampaignStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;
}
