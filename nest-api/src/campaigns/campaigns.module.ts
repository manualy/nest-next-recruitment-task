import { Module } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
import { CampaignsResolver } from './campaigns.resolver';
import { CampaignsService } from './campaigns.service';
import { CampaignStatus } from '@prisma/client';
import { PrismaModule } from '@src/database/prisma.module';
import { ReportDimension } from './reports/enums/report-dimensions.enum';

@Module({
  imports: [PrismaModule],
  providers: [CampaignsResolver, CampaignsService],
})
export class CampaignsModule {
  constructor() {
    registerEnumType(CampaignStatus, {
      name: 'CampaignStatus',
      description: 'The status of the creative',
    });
    registerEnumType(ReportDimension, {
      name: 'ReportDimension',
      description:
        'Represents different budget report dimensions that are available upon selection',
    });
  }
}
