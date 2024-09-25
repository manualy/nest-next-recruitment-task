import { Field, InputType, Int } from '@nestjs/graphql';
import { CreativeStatus } from '@prisma/client';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { ReportDimension } from '../enums/report-dimensions.enum';

@InputType()
export class BudgetReportFiltersInput {
  @Field(() => [Int])
  @IsArray()
  @ArrayUnique()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  campaignIds: number[];

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayNotEmpty()
  @IsString({ each: true })
  creativeSizes?: string[];

  @Field(() => ReportDimension)
  @IsEnum(ReportDimension)
  dimension: ReportDimension;

  @Field(() => CreativeStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CreativeStatus)
  creativeStatus?: CreativeStatus;

  @Field(() => Date)
  @IsDate()
  startDate: Date;

  @Field(() => Date)
  @IsDate()
  endDate: Date;
}
