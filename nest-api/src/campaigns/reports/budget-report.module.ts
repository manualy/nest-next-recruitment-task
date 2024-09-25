import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/database/prisma.module';
import { BudgetReportsService } from './budget-reports.service';
import { BudgetReportsResolver } from './budget-reports.resolver';

const currentDateProvider = {
  provide: 'CURRENT_DATE',
  useFactory: () => () => new Date(),
};

@Module({
  imports: [PrismaModule],
  providers: [BudgetReportsResolver, BudgetReportsService, currentDateProvider],
})
export class BudgetReportModule {}
