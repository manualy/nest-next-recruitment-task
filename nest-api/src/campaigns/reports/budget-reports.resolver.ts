import { Args, Query, Resolver } from '@nestjs/graphql';

import { BudgetReport } from './models/budget-report.model';
import { BudgetReportsService } from './budget-reports.service';
import { BudgetReportFiltersInput } from './dto/budget-report-filters.input';

@Resolver(() => BudgetReport)
export class BudgetReportsResolver {
  constructor(private readonly budgetReportsService: BudgetReportsService) {}

  @Query(() => BudgetReport)
  async generateReport(
    @Args('filters') filters: BudgetReportFiltersInput,
  ): Promise<BudgetReport> {
    return this.budgetReportsService.generateReport(filters);
  }
}
