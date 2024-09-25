import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Creative } from './models/creative.model';
import { CreativesService } from './creatives.service';
import { AddCreativeInput } from './dto/add-creative.input';
import { UpdateCreativeInput } from './dto/update-creative.input';
import { BatchActivateArgs } from '@src/common/dto/batch-activate.args';
import { validateOrReject } from 'class-validator';

@Resolver(() => Creative)
export class CreativesResolver {
  constructor(private readonly creativesService: CreativesService) {}

  @Mutation(() => Creative)
  async addCreative(
    @Args('creativeData') creativeData: AddCreativeInput,
  ): Promise<Creative> {
    await validateOrReject(creativeData);

    return await this.creativesService.create(creativeData);
  }

  @Mutation(() => Creative)
  async updateCreative(
    @Args('id') id: number,
    @Args('creativeData') creativeData: UpdateCreativeInput,
  ) {
    await validateOrReject(creativeData);
    return this.creativesService.update(id, creativeData);
  }

  @Mutation(() => Boolean)
  async batchActivate(@Args() { ids }: BatchActivateArgs) {
    return this.creativesService.batchActivate(ids);
  }
}
