import { CreativeStatus } from '@prisma/client';
import { Creative } from '@src/creatives/models/creative.model';

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

export function creativeFactory({
  id,
  size,
  status,
  addedDate,
  changedDate,
}: Partial<Creative> = {}): Creative {
  const creative = new Creative();
  creative.id = id ?? Math.floor(Math.random() * 1000000) + 1;
  creative.size =
    size ??
    `${Math.floor(Math.random() * 1200) + 1}x${Math.floor(Math.random() * 1200) + 1}`;
  creative.status = status ?? getRandomEnumValue(CreativeStatus);
  creative.addedDate = addedDate ?? getRandomDateWithinPastThreeMonths();
  creative.changedDate = changedDate ?? getRandomDateWithinPastThreeMonths();

  return creative;
}
