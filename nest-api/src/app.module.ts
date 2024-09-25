import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import config from '@src/config/config';
import { join } from 'path';
import { CreativesModule } from './creatives/creatives.module';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { CampaignsModule } from './campaigns/campaigns.module';
import { DateScalar } from './common/scalars/date.scalar';
import { BudgetReportModule } from './campaigns/reports/budget-report.module';

@Module({
  providers: [DateScalar],
  imports: [
    CreativesModule,
    CampaignsModule,
    BudgetReportModule,
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [config],
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ApolloDriverConfig => {
        return {
          autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
          playground: false,
          plugins: [
            ...(configService.get<string>('environment') === 'development'
              ? [ApolloServerPluginLandingPageLocalDefault()]
              : []),
          ],
        };
      },
    }),
  ],
})
export class AppModule {}
