import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global() evita tener que importar PrismaModule en cada módulo
// de la aplicación (users, groups, matches, predictions, sync, auth).
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
