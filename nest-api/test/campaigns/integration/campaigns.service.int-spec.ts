import { Test } from '@nestjs/testing';
import { CampaignStatus } from '@prisma/client';
import { AppModule } from '@src/app.module';
import { CampaignsService } from '@src/campaigns/campaigns.service';
import { PrismaService } from '@src/database/prisma.service';
import { creativeFactory } from 'test/creatives/creative.factory';
import { campaignFactory } from '../campaign.factory';
import { AddCampaignInput } from '@src/campaigns/dto/add-campaign.input';
import { UpdateCampaignInput } from '@src/campaigns/dto/update-campaign.input';
import { NotFoundException } from '@nestjs/common';

describe('CampaignsService Integration', () => {
  let prismaService: PrismaService;
  let campaignsService: CampaignsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prismaService = moduleRef.get(PrismaService);
    campaignsService = moduleRef.get(CampaignsService);
    await prismaService.cleanDatabase();
  });

  describe('create()', () => {
    const emptyDto: AddCampaignInput = {
      name: 'First Campaign',
      budget: '1000PLN',
      status: CampaignStatus.NEW,
      startDate: new Date('2024-10-26T09:00:00Z'),
      endDate: new Date('2024-07-18T09:00:00Z'),
      creatives: [],
    };

    it('Should create a new campaign', async () => {
      const campaign = await campaignsService.create(emptyDto);
      expect(campaign.name).toBe(emptyDto.name);
      expect(campaign.budget).toBe(emptyDto.budget);
      expect(campaign.status).toBe(emptyDto.status);
      expect(campaign.startDate.getDate()).toBe(emptyDto.startDate.getDate());
      expect(campaign.endDate.getDate()).toBe(emptyDto.endDate.getDate());
    });

    it('Should create a new campaign & associate it with exisiting creatives', async () => {
      const creatives = await prismaService.creative.createManyAndReturn({
        data: [creativeFactory(), creativeFactory(), creativeFactory()],
      });

      const connectedDto: AddCampaignInput = {
        name: 'Second Campaign',
        budget: '1000PLN',
        status: CampaignStatus.NEW,
        startDate: new Date('2024-10-26T09:00:00Z'),
        endDate: new Date('2024-07-18T09:00:00Z'),
        creatives: creatives.map((creative) => creative.id),
      };

      const campaign = await campaignsService.create(connectedDto);
      expect(campaign.name).toBe(connectedDto.name);
      expect(campaign.budget).toBe(connectedDto.budget);
      expect(campaign.status).toBe(connectedDto.status);
      expect(campaign.startDate.getDate()).toBe(
        connectedDto.startDate.getDate(),
      );

      const connectedCreativesCount = await prismaService.creative.count({
        where: {
          campaigns: {
            some: { id: campaign.id },
          },
        },
      });

      expect(connectedCreativesCount).toBe(3);
    });

    it('Should throw with wrong creatives', async () => {
      const dto: AddCampaignInput = {
        name: 'First Campaign',
        budget: '1000PLN',
        status: CampaignStatus.NEW,
        startDate: new Date('2024-10-26T09:00:00Z'),
        endDate: new Date('2024-07-18T09:00:00Z'),
        creatives: [1, 123, 1234, 55555],
      };

      await expect(campaignsService.create(dto)).rejects.toThrow(
        expect.objectContaining({
          code: 'P2025',
        }),
      );
    });
  });

  describe('update()', () => {
    it('Should update an existing campaign', async () => {
      const { creatives: _creatives, ...initialCampaignData } = campaignFactory(
        {
          name: 'First Campaign',
          budget: '1000PLN',
          status: CampaignStatus.NEW,
          startDate: new Date('2024-10-26T09:00:00Z'),
          endDate: new Date('2024-07-18T09:00:00Z'),
        },
      );

      const campaignInstance = await prismaService.campaign.create({
        data: initialCampaignData,
      });

      const dto: UpdateCampaignInput = {
        name: 'Second Campaign',
        budget: '2000PLN',
        status: CampaignStatus.ACTIVE,
        startDate: new Date('2024-10-26T09:00:00Z'),
        endDate: new Date('2024-07-18T09:00:00Z'),
      };

      const result = await campaignsService.update(campaignInstance.id, dto);

      expect(result.id).toBe(initialCampaignData.id);
      expect(result.name).toBe(dto.name);
      expect(result.budget).toBe(dto.budget);
      expect(result.status).toBe(dto.status);
      expect(result.startDate.getDate()).toBe(dto.startDate.getDate());
      expect(result.endDate.getDate()).toBe(dto.endDate.getDate());
    });

    it('Should disconnect unwanted creatives', async () => {
      const { creatives: _creatives, ...initialCampaignData } = campaignFactory(
        {
          name: 'First Campaign',
          budget: '1000PLN',
          status: CampaignStatus.NEW,
          startDate: new Date('2024-10-26T09:00:00Z'),
          endDate: new Date('2024-07-18T09:00:00Z'),
        },
      );

      const campaignInstance = await prismaService.campaign.create({
        data: initialCampaignData,
      });

      const [creative1, ...__creatives] =
        await prismaService.creative.createManyAndReturn({
          data: [creativeFactory(), creativeFactory(), creativeFactory()],
        });

      const result = await campaignsService.update(campaignInstance.id, {
        ...initialCampaignData,
        creatives: [creative1.id],
      });

      expect(result.id).toBe(initialCampaignData.id);

      const connectedCreativesCount = await prismaService.creative.count({
        where: {
          campaigns: {
            some: { id: initialCampaignData.id },
          },
        },
      });

      expect(connectedCreativesCount).toBe(1);
    });

    it('Should throw with wrong creatives', async () => {
      const { creatives: _creatives, ...initialCampaignData } = campaignFactory(
        {
          name: 'First Campaign',
          budget: '1000PLN',
          status: CampaignStatus.NEW,
          startDate: new Date('2024-10-26T09:00:00Z'),
          endDate: new Date('2024-07-18T09:00:00Z'),
        },
      );

      const campaignInstance = await prismaService.campaign.create({
        data: initialCampaignData,
      });

      await expect(
        campaignsService.update(campaignInstance.id, {
          ...initialCampaignData,
          creatives: [123, 12311, 1111],
        }),
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'P2025',
        }),
      );
    });
  });

  describe('addCreative()', () => {
    it('Should connect an existing creative', async () => {
      const { creatives: _creatives, ...initialCampaignData } = campaignFactory(
        {
          name: 'First Campaign',
          budget: '1000PLN',
          status: CampaignStatus.NEW,
          startDate: new Date('2024-10-26T09:00:00Z'),
          endDate: new Date('2024-07-18T09:00:00Z'),
        },
      );

      const [creative1, ...creatives] =
        await prismaService.creative.createManyAndReturn({
          data: [
            creativeFactory(),
            creativeFactory(),
            creativeFactory(),
            creativeFactory(),
          ],
        });

      const campaign = await prismaService.campaign.create({
        data: {
          ...initialCampaignData,
          creatives: {
            connect: creatives.map((creative) => ({ id: creative.id })),
          },
        },
      });

      await campaignsService.addCreative(initialCampaignData.id, creative1.id);

      const connectedCreativesCount = await prismaService.creative.count({
        where: {
          campaigns: {
            some: { id: campaign.id },
          },
        },
      });

      expect(connectedCreativesCount).toBe(4);
    });

    it('Should throw with unexistent creative', async () => {
      const { creatives: _creatives, ...initialCampaignData } = campaignFactory(
        {
          name: 'First Campaign',
          budget: '1000PLN',
          status: CampaignStatus.NEW,
          startDate: new Date('2024-10-26T09:00:00Z'),
          endDate: new Date('2024-07-18T09:00:00Z'),
        },
      );

      await prismaService.campaign.create({
        data: initialCampaignData,
      });

      await expect(
        campaignsService.addCreative(initialCampaignData.id, 1235132),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteCreative()', () => {
    it('Should disconnect an existing creative', async () => {
      const { creatives: _creatives, ...initialCampaignData } = campaignFactory(
        {
          name: 'First Campaign',
          budget: '1000PLN',
          status: CampaignStatus.NEW,
          startDate: new Date('2024-10-26T09:00:00Z'),
          endDate: new Date('2024-07-18T09:00:00Z'),
        },
      );

      const creatives = await prismaService.creative.createManyAndReturn({
        data: [
          creativeFactory(),
          creativeFactory(),
          creativeFactory(),
          creativeFactory(),
        ],
      });

      const campaign = await prismaService.campaign.create({
        data: {
          ...initialCampaignData,
          creatives: {
            connect: creatives.map((creative) => ({ id: creative.id })),
          },
        },
      });

      await campaignsService.removeCreative(
        initialCampaignData.id,
        creatives[0].id,
      );

      const connectedCreativesCount = await prismaService.creative.count({
        where: {
          campaigns: {
            some: { id: campaign.id },
          },
        },
      });

      expect(connectedCreativesCount).toBe(3);
    });

    it('Should throw with wrong creative', async () => {
      const { creatives: _creatives, ...initialCampaignData } = campaignFactory(
        {
          name: 'First Campaign',
          budget: '1000PLN',
          status: CampaignStatus.NEW,
          startDate: new Date('2024-10-26T09:00:00Z'),
          endDate: new Date('2024-07-18T09:00:00Z'),
        },
      );

      await prismaService.campaign.create({
        data: initialCampaignData,
      });

      await expect(
        campaignsService.removeCreative(initialCampaignData.id, 1235132),
      ).rejects.toThrow(NotFoundException);
    });

    it('Should throw with inexistent creative', async () => {
      const { creatives: _creatives, ...initialCampaignData } = campaignFactory(
        {
          name: 'First Campaign',
          budget: '1000PLN',
          status: CampaignStatus.NEW,
          startDate: new Date('2024-10-26T09:00:00Z'),
          endDate: new Date('2024-07-18T09:00:00Z'),
        },
      );

      const creative = await prismaService.creative.create({
        data: creativeFactory(),
      });

      await prismaService.campaign.create({
        data: initialCampaignData,
      });

      await expect(
        campaignsService.removeCreative(initialCampaignData.id, creative.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('batchActivate()', () => {
    it('Should activate all campaigns', async () => {
      const campaigns = [
        campaignFactory({ status: CampaignStatus.PAUSED }),
        campaignFactory({ status: CampaignStatus.PAUSED }),
        campaignFactory({ status: CampaignStatus.PAUSED }),
      ];

      await prismaService.campaign.createMany({
        data: campaigns.map(({ creatives: _, ...campaign }) => campaign),
      });

      await campaignsService.batchActivate(campaigns.map(({ id }) => id));

      const activeCount = await prismaService.campaign.count({
        where: { status: CampaignStatus.ACTIVE },
      });

      expect(activeCount).toBe(3);
    });
  });
});
