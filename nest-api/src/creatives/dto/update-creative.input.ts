import { Field, InputType } from '@nestjs/graphql';
import { CreativeStatus } from '@prisma/client';
import { Length } from 'class-validator';

@InputType()
export class UpdateCreativeInput {
  @Field(() => CreativeStatus)
  @Length(30, 255)
  status: CreativeStatus;
}
