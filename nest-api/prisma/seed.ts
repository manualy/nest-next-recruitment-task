import { PrismaClient } from '@prisma/client';
import { createReadStream } from 'fs';
import { resolve } from 'path';
import * as csv from 'csv-parser';
import { BatchPoolHelper } from './BatchHelper';

const prisma = new PrismaClient();

const BATCH_SIZE = 100;
const CONCURRENT_JOB_LIMIT = 8; /* 
The default postgres database connection limit is 10 (I think), 
each job conencts to the database to feed the data based on a single batch, 
so this number can't exceed that connection pool.
*/
const CAMPAIGNS_FILE_PATH = resolve(__dirname, '../../data/campaigns.csv');
const CREATIVES_FILE_PATH = resolve(__dirname, '../../data/creatives.csv');

const creativesValueMapping = ({ header, _index, value }) => {
  if (header === 'id') {
    return parseInt(value, 10);
  }
  if (header === 'addedDate') {
    return new Date(parseInt(value, 10));
  }
  if (header === 'changedDate') {
    return new Date(parseInt(value, 10));
  }
  return value;
};

const campaignsValueMapping = ({ header, _index, value }) => {
  if (header === 'id') {
    return parseInt(value, 10);
  }
  if (header === 'startDate') {
    return new Date(parseInt(value, 10));
  }
  if (header === 'endDate') {
    return new Date(parseInt(value, 10));
  }
  if (header === 'addedDate') {
    return new Date(parseInt(value, 10));
  }
  if (header === 'changedDate') {
    return new Date(parseInt(value, 10));
  }
  if (header === 'creatives') {
    return value.split(',').map((item) => parseInt(item.trim(), 10));
  }

  return value;
};

async function seed() {
  console.log('Grab a coffee, this will take a while... :)');
  console.log('Increase pool size to reduce the seeding time.');
  try {
    await processCsvFile(
      CREATIVES_FILE_PATH,
      creativesValueMapping,
      'creative',
    );
    console.log('processed creatives');
    await processCsvFile(
      CAMPAIGNS_FILE_PATH,
      campaignsValueMapping,
      'campaign',
    );
    console.log('processed campaigns');
  } catch (error) {
    console.error('Error during seed process:', error);
  }
}

async function processCsvFile(
  filePath: string,
  valueMapping: (args: any) => any,
  prismaModel: 'creative' | 'campaign',
) {
  const batchQueuePool = new BatchPoolHelper(CONCURRENT_JOB_LIMIT);
  let batch: any[] = [];
  let entry = 0;

  createReadStream(filePath)
    .pipe(
      csv({
        separator: ';',
        mapValues: valueMapping,
      }),
    )
    .on('data', (row) => {
      batch.push(row);
      entry += 1;

      if (entry % BATCH_SIZE === 0) {
        const batchCopy = [...batch];
        batchQueuePool.enqueue(() => processBatch(batchCopy, prismaModel));
        batch = [];
      }
    })
    .on('end', () => {
      if (batch.length > 0) {
        const batchCopy = [...batch];
        batchQueuePool.enqueue(() => processBatch(batchCopy, prismaModel));
      }
      batchQueuePool.finalize();
    })
    .on('error', (err) => {
      console.error('Error reading the CSV file:', err);
    });

  return await batchQueuePool.queueProcessed();
}

async function processBatch(batch: any[], model: 'campaign' | 'creative') {
  if (model === 'campaign') {
    return await prisma.$transaction(async (prisma) => {
      for (const campaign of batch) {
        const { creatives, ...data } = campaign;

        await prisma.campaign.create({
          data: {
            ...data,
            creatives: {
              connect: creatives.map((id) => ({ id })),
            },
          },
        });
      }
    });
  }

  return await prisma.$transaction(async (prisma) => {
    return await prisma.creative.createMany({
      data: batch,
      skipDuplicates: true,
    });
  });
}

seed();
