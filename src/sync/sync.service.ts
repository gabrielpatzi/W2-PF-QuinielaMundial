import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { PredictionsService } from '../predictions/predictions.service';
import { MatchStatus } from '@prisma/client';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly predictionsService: PredictionsService,
  ) {}

  @Cron('*/20 * * * *')
  async handleCron() {
    this.logger.log('Iniciando sincronización de marcadores desde thesportsdb.com...');
    await this.syncMatches();
  }

  async syncMatches() {
    try {
    
      const url = 'https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=2026-06-11&l=4328';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error en API thesportsdb.com: ${response.statusText}`);
      }
      
      const data = await response.json();
      const events = data.events || [];

      for (const event of events) {
        const externalId = event.idEvent;
        const intHomeScore = parseInt(event.intHomeScore);
        const intAwayScore = parseInt(event.intAwayScore);
        
        if (isNaN(intHomeScore) || isNaN(intAwayScore)) continue;

        const match = await this.prisma.match.findUnique({
          where: { externalId },
          include: { predictions: true },
        });

        if (match && (match.homeScore !== intHomeScore || match.awayScore !== intAwayScore)) {
          await this.prisma.match.update({
            where: { id: match.id },
            data: {
              homeScore: intHomeScore,
              awayScore: intAwayScore,
              status: MatchStatus.FINISHED, 
            },
          });

          for (const prediction of match.predictions) {
            const points = this.predictionsService.calculatePoints(
              prediction.homeScoreBet,
              prediction.awayScoreBet,
              intHomeScore,
              intAwayScore,
            );


            await this.prisma.prediction.update({
              where: { id: prediction.id },
              data: { points },
            });

            const memberships = await this.prisma.groupMembership.findMany({
              where: { userId: prediction.userId },
            });

            for (const membership of memberships) {
              await this.prisma.groupMembership.update({
                where: { id: membership.id },
                data: {
                  scoreAcumulado: { increment: points },
                },
              });
            }
          }
          
          this.logger.log(`Partido ${match.homeTeam} vs ${match.awayTeam} actualizado.`);
        }
      }

      this.logger.log('Sincronización finalizada correctamente.');
    } catch (error: any) {
      this.logger.error('Error al sincronizar marcadores', error.stack);
    }
  }
}
