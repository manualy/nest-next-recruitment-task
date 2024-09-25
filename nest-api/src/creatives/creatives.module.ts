import { Module } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
import { CreativesResolver } from './creatives.resolver';
import { CreativesService } from './creatives.service';
import { CreativeStatus } from '@prisma/client';
import { PrismaModule } from '@src/database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CreativesResolver, CreativesService],
})
export class CreativesModule {
  constructor() {
    registerEnumType(CreativeStatus, {
      name: 'CreativeStatuss',
      description: 'The status of the creative',
    });
  }
}
