import { creativeFactory } from 'test/creatives/creative.factory';
import { campaignFactory } from '../campaign.factory';
import {
  addDays,
  differenceInCalendarDays,
  isFriday,
  isMonday,
  isSaturday,
  isSunday,
  isThursday,
  isTuesday,
  isWednesday,
} from 'date-fns';
import { CreativeStatus } from '@prisma/client';
import { PrismaService } from '@src/database/prisma.service';

// TOTAL PER WEEK: 7
// 100x200: 3 [1 ACTIVE, 1 PAUSED, 1 NEW]
// 200x300: 2 [1 PAUSED, 1 ACTIVE]
// 300x400: 2 [1 NEW, 1 PAUSED]
// BY STATUS:
// 2 ACTIVE
// 2 PAUSED
// 3 NEW

const mockDataBasedOnDate = (date: Date) => {
  if (isMonday(date)) {
    return creativeFactory({
      size: '100x200',
      status: CreativeStatus.ACTIVE,
      addedDate: date,
    });
  }
  if (isTuesday(date)) {
    return creativeFactory({
      size: '200x300',
      status: CreativeStatus.PAUSED,
      addedDate: date,
      changedDate: date,
    });
  }
  if (isWednesday(date)) {
    return creativeFactory({
      size: '300x400',
      status: CreativeStatus.NEW,
      addedDate: date,
      changedDate: date,
    });
  }
  if (isThursday(date)) {
    return creativeFactory({
      size: '100x200',
      status: CreativeStatus.NEW,
      addedDate: date,
      changedDate: date,
    });
  }
  if (isFriday(date)) {
    return creativeFactory({
      size: '200x300',
      status: CreativeStatus.ACTIVE,
      addedDate: date,
      changedDate: date,
    });
  }
  if (isSaturday(date)) {
    return creativeFactory({
      size: '300x400',
      status: CreativeStatus.PAUSED,
      addedDate: date,
      changedDate: date,
    });
  }
  if (isSunday(date)) {
    return creativeFactory({
      size: '100x200',
      status: CreativeStatus.NEW,
      addedDate: date,
      changedDate: date,
    });
  }
};

// currentCampaignId: 1
// futureCampaignId: 2
// pastCampaignId: 3
export const generateMockReportData = async (
  prismaService: PrismaService,
  currentDate: Date,
) => {
  const currentCampaignCreatives = [];
  const pastCampaignCreatives = [];

  let daysInCampaign;

  const { creatives: _cC, ...currentCampaign } = campaignFactory({
    id: 1,
    budget: '600PLN',
    startDate: new Date(2024, 7, 1), //60 days, campaign starts on thursday
    endDate: new Date(2024, 8, 29), //campaign ends on sunday
  });

  const { creatives: _cF, ...futureCampaign } = campaignFactory({
    id: 2,
    budget: '210PLN',
    startDate: new Date(2024, 10, 1),
    endDate: new Date(2024, 10, 21),
  });

  const { creatives: _cP, ...pastCampaign } = campaignFactory({
    id: 3,
    budget: '90PLN',
    startDate: new Date(2024, 7, 5),
    endDate: new Date(2024, 7, 11),
  });

  daysInCampaign =
    differenceInCalendarDays(currentDate, currentCampaign.startDate) + 1;

  for (let i = 0; i < daysInCampaign; i++) {
    const tmpDate = addDays(currentCampaign.startDate, i);
    const creativeData = mockDataBasedOnDate(tmpDate);

    currentCampaignCreatives.push(creativeData);
  }

  daysInCampaign =
    differenceInCalendarDays(pastCampaign.endDate, pastCampaign.startDate) + 1;

  for (let i = 0; i < daysInCampaign; i++) {
    const tmpDate = addDays(pastCampaign.startDate, i);
    const creativeData = mockDataBasedOnDate(tmpDate);

    pastCampaignCreatives.push(creativeData);
  }

  await prismaService.creative.createMany({
    data: [...currentCampaignCreatives, ...pastCampaignCreatives],
  });

  await prismaService.campaign.create({
    data: {
      ...currentCampaign,
      creatives: {
        connect: currentCampaignCreatives.map((creative) => ({
          id: creative.id,
        })),
      },
    },
  });

  await prismaService.campaign.create({
    data: {
      ...pastCampaign,
      creatives: {
        connect: pastCampaignCreatives.map((creative) => ({
          id: creative.id,
        })),
      },
    },
  });

  await prismaService.campaign.create({
    data: futureCampaign,
  });
};
