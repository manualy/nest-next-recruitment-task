import { Injectable, NotFoundException } from '@nestjs/common';
import { Campaign } from './models/campaign.model';
import { PrismaService } from '@src/database/prisma.service';
import { CampaignStatus } from '@prisma/client';
import { AddCampaignInput } from './dto/add-campaign.input';
import { UpdateCampaignInput } from './dto/update-campaign.input';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async create(campaignData: AddCampaignInput): Promise<Campaign> {
    const { creatives, ...data } = campaignData;

    return await this.prisma.campaign.create({
      data: {
        ...data,
        creatives: {
          connect: creatives.map((id) => ({ id })),
        },
      },
    });
  }

  async update(
    id: number,
    campaignData: UpdateCampaignInput,
  ): Promise<Campaign> {
    const { creatives = [], ...data } = campaignData;

    const existingCampaign = await this.prisma.campaign.findUnique({
      where: { id },
      select: { creatives: { select: { id: true } } },
    });

    if (!existingCampaign) {
      throw new NotFoundException(`Campaign not found`);
    }

    const existingCreativeIds = existingCampaign.creatives.map(
      (creative) => creative.id,
    );

    const creativesToConnect = creatives.filter(
      (creativeId) => !existingCreativeIds.includes(creativeId),
    );

    const creativesToDisconnect = existingCreativeIds.filter(
      (creativeId) => !creatives.includes(creativeId),
    );

    return await this.prisma.campaign.update({
      where: { id },
      data: {
        ...data,
        creatives: {
          connect: creativesToConnect.map((id) => ({ id })),
          disconnect: creativesToDisconnect.map((id) => ({ id })),
        },
      },
    });
  }

  async addCreative(campaignId: number, creativeId: number): Promise<Campaign> {
    const creative = await this.prisma.creative.findUnique({
      where: { id: creativeId },
    });

    if (!creative) {
      throw new NotFoundException(`Creative with ID ${creativeId} not found`);
    }

    const campaign = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        creatives: {
          connect: { id: creativeId },
        },
      },
      include: { creatives: true },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    return campaign;
  }

  async removeCreative(
    campaignId: number,
    creativeId: number,
  ): Promise<Campaign> {
    const creative = await this.prisma.creative.findFirst({
      where: {
        campaigns: {
          some: {
            id: campaignId,
          },
        },
      },
      include: {
        campaigns: true,
      },
    });

    if (!creative) {
      throw new NotFoundException(`Creative with ID ${creativeId} not found`);
    }

    const campaign = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        creatives: {
          disconnect: { id: creativeId },
        },
      },
      include: { creatives: true },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    return campaign;
  }

  async batchActivate(ids: number[]): Promise<boolean> {
    if (ids.length === 0) {
      throw new Error('No campaign IDs provided');
    }

    const updateResult = await this.prisma.campaign.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        status: CampaignStatus.ACTIVE,
      },
    });

    if (updateResult.count === 0) {
      throw new NotFoundException('No campaigns were found to update');
    }

    return true;
  }
}
