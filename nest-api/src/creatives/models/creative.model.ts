import { Field, Int, ObjectType } from '@nestjs/graphql';
import { CreativeStatus } from '@prisma/client';

@ObjectType({ description: "Campaign's creative" })
export class Creative {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  size: string;

  @Field(() => CreativeStatus)
  status: CreativeStatus;

  @Field(() => Date)
  addedDate: Date;

  @Field(() => Date)
  changedDate: Date;
}
