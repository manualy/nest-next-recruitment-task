import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CampaignsService } from './campaigns.service';
import { Campaign } from './models/campaign.model';
import { BatchActivateArgs } from '@src/common/dto/batch-activate.args';
import { UpdateCampaignInput } from './dto/update-campaign.input';
import { AddCampaignInput } from './dto/add-campaign.input';
import { validateOrReject } from 'class-validator';

@Resolver(() => Campaign)
export class CampaignsResolver {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Mutation(() => Campaign)
  async addCampaign(
    @Args('campaignData') campaignData: AddCampaignInput,
  ): Promise<Campaign> {
    await validateOrReject(campaignData);
    return await this.campaignsService.create(campaignData);
  }

  @Mutation(() => Campaign)
  async updateCampaign(
    @Args('id') id: number,
    @Args('campaignData') campaignData: UpdateCampaignInput,
  ) {
    await validateOrReject(campaignData);
    return this.campaignsService.update(id, campaignData);
  }

  @Mutation(() => Campaign)
  async addCreative(
    @Args('campaignId') id: number,
    @Args('creativeId') creativeId: number,
  ) {
    return this.campaignsService.addCreative(id, creativeId);
  }

  @Mutation(() => Campaign)
  async removeCreative(
    @Args('campaignId') id: number,
    @Args('creativeId') creativeId: number,
  ) {
    return this.campaignsService.removeCreative(id, creativeId);
  }

  @Mutation(() => Boolean)
  async batchActivate(@Args() { ids }: BatchActivateArgs) {
    return this.campaignsService.batchActivate(ids);
  }
}
