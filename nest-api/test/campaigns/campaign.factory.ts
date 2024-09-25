import { CampaignStatus } from '@prisma/client';
import { Campaign } from '@src/campaigns/models/campaign.model';

const getRandomEnumValue = <T>(enumObj: T): T[keyof T] => {
  const values = Object.values(enumObj);
  return values[Math.floor(Math.random() * values.length)] as T[keyof T];
};

const getRandomDateWithinPastThreeMonths = (): Date => {
  const now = new Date();
  const threeMonthsAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 3,
    now.getDate(),
  );
  return new Date(
    threeMonthsAgo.getTime() +
      Math.random() * (now.getTime() - threeMonthsAgo.getTime()),
  );
};

function getRandomDateWithinNextThreeMonths(): Date {
  const now = new Date();
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(now.getMonth() + 3);

  const randomTime =
    now.getTime() +
    Math.random() * (threeMonthsFromNow.getTime() - now.getTime());
  return new Date(randomTime);
}

export function campaignFactory({
  id,
  name,
  budget,
  status,
  startDate = getRandomDateWithinPastThreeMonths(),
  endDate = getRandomDateWithinNextThreeMonths(),
  creatives,
  addedDate,
  changedDate,
}: Partial<Campaign> = {}): Campaign {
  const campaign = new Campaign();

  campaign.id = id ?? Math.floor(Math.random() * 1000000) + 1;
  campaign.name = name ?? `Campaign ${Math.floor(Math.random() * 1000000)}`;
  campaign.budget = budget ?? `${Math.floor(Math.random() * 1000000) + 1}USD`;
  campaign.status = status ?? getRandomEnumValue(CampaignStatus);
  campaign.creatives = creatives ?? [];
  campaign.addedDate = addedDate ?? startDate;
  campaign.changedDate = changedDate ?? startDate;
  campaign.startDate = startDate;
  campaign.endDate = endDate;

  return campaign;
}
