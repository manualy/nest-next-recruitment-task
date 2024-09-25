import { Injectable, NotFoundException } from '@nestjs/common';
import { Creative } from './models/creative.model';
import { PrismaService } from '@src/database/prisma.service';
import { AddCreativeInput } from './dto/add-creative.input';
import { UpdateCreativeInput } from './dto/update-creative.input';
import { CreativeStatus } from '@prisma/client';

@Injectable()
export class CreativesService {
  constructor(private prisma: PrismaService) {}

  async create(data: AddCreativeInput): Promise<Creative> {
    return await this.prisma.creative.create({
      data: data,
    });
  }

  async update(
    id: number,
    campaignData: UpdateCreativeInput,
  ): Promise<Creative> {
    return await this.prisma.creative.update({
      where: { id },
      data: campaignData,
    });
  }

  async batchActivate(ids: number[]): Promise<boolean> {
    if (ids.length === 0) {
      throw new Error('No campaign IDs provided');
    }

    const updateResult = await this.prisma.creative.updateMany({
      where: { id: { in: ids } },
      data: {
        status: CreativeStatus.ACTIVE,
      },
    });

    if (updateResult.count === 0) {
      throw new NotFoundException('No campaigns were found to update');
    }

    return true;
  }
}
