import { Field, InputType } from '@nestjs/graphql';
import { CreativeStatus } from '@prisma/client';
import { Length, MaxLength } from 'class-validator';

@InputType()
export class AddCreativeInput {
  @Field()
  @MaxLength(16)
  size: string;

  @Field(() => CreativeStatus)
  @Length(30, 255)
  status: CreativeStatus;
}
