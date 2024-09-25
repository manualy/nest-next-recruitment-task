import { Test } from '@nestjs/testing';
import { CreativeStatus } from '@prisma/client';
import { AppModule } from '@src/app.module';
import { CreativesService } from '@src/creatives/creatives.service';
import { AddCreativeInput } from '@src/creatives/dto/add-creative.input';
import { UpdateCreativeInput } from '@src/creatives/dto/update-creative.input';
import { PrismaService } from '@src/database/prisma.service';
import { creativeFactory } from '../creative.factory';

describe('CreativesService Integration', () => {
  let prismaService: PrismaService;
  let creativesService: CreativesService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prismaService = moduleRef.get(PrismaService);
    creativesService = moduleRef.get(CreativesService);
    await prismaService.cleanDatabase();
  });

  describe('create()', () => {
    const dto: AddCreativeInput = {
      size: '120x300',
      status: CreativeStatus.NEW,
    };

    it('Should create a new creative', async () => {
      const creative = await creativesService.create(dto);
      expect(creative.size).toBe(dto.size);
      expect(creative.status).toBe(dto.status);
    });
  });

  describe('update()', () => {
    const dto: AddCreativeInput = {
      size: '120x300',
      status: CreativeStatus.NEW,
    };

    it('Should update an existing creative', async () => {
      const creativeInstance = await prismaService.creative.create({
        data: dto,
      });

      const updateDTO: UpdateCreativeInput = {
        status: CreativeStatus.ACTIVE,
      };

      const result = await creativesService.update(
        creativeInstance.id,
        updateDTO,
      );

      expect(result.id).toBe(creativeInstance.id);
      expect(result.status).toBe(updateDTO.status);
    });
  });

  describe('batchActivate()', () => {
    it('Should activate all creatives', async () => {
      const creatives = [
        creativeFactory({ status: CreativeStatus.PAUSED }),
        creativeFactory({ status: CreativeStatus.PAUSED }),
        creativeFactory({ status: CreativeStatus.PAUSED }),
      ];

      await prismaService.creative.createMany({
        data: creatives,
      });

      await creativesService.batchActivate(creatives.map(({ id }) => id));

      const activeCount = await prismaService.creative.count({
        where: { status: CreativeStatus.ACTIVE },
      });

      expect(activeCount).toBe(3);
    });
  });
});
