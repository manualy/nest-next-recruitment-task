import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class BatchActivateArgs {
  @Field(() => [Int])
  ids: number[];
}
