import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';

@Injectable()
export class PredictionsService {
  constructor(private prisma: PrismaService) {}

  async create(createPredictionDto: CreatePredictionDto, userId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: createPredictionDto.matchId },
    });

    if (!match) throw new NotFoundException('Partido no encontrado');

    if (new Date() >= match.matchDate) {
      throw new BadRequestException('El partido ya ha comenzado, no puedes pronosticar');
    }

    const existing = await this.prisma.prediction.findUnique({
      where: {
        userId_matchId: {
          userId,
          matchId: match.id,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Ya hiciste un pronóstico para este partido. Puedes modificarlo.');
    }

    return this.prisma.prediction.create({
      data: {
        userId,
        matchId: match.id,
        homeScoreBet: createPredictionDto.homeScoreBet,
        awayScoreBet: createPredictionDto.awayScoreBet,
      },
    });
  }

  findAllMyPredictions(userId: string) {
    return this.prisma.prediction.findMany({
      where: { userId },
      include: {
        match: true,
      },
      orderBy: { match: { matchDate: 'asc' } },
    });
  }

  async findOne(id: string, userId: string) {
    const prediction = await this.prisma.prediction.findUnique({
      where: { id },
    });

    if (!prediction || prediction.userId !== userId) {
      throw new NotFoundException('Pronóstico no encontrado');
    }

    return prediction;
  }

  async update(id: string, updatePredictionDto: UpdatePredictionDto, userId: string) {
    const prediction = await this.findOne(id, userId);

    const match = await this.prisma.match.findUnique({
      where: { id: prediction.matchId },
    });

    if (!match) throw new NotFoundException('Partido no encontrado');

    if (new Date() >= match.matchDate) {
      throw new BadRequestException('El partido ya ha comenzado, no puedes modificar el pronóstico');
    }

    return this.prisma.prediction.update({
      where: { id },
      data: {
        homeScoreBet: updatePredictionDto.homeScoreBet,
        awayScoreBet: updatePredictionDto.awayScoreBet,
      },
    });
  }

  // Utilidad para calcular puntos que se llamará desde el SyncService
  calculatePoints(homeScoreBet: number, awayScoreBet: number, realHomeScore: number, realAwayScore: number): number {
    if (homeScoreBet === realHomeScore && awayScoreBet === realAwayScore) {
      return 3;
    }
    
    const betResult = Math.sign(homeScoreBet - awayScoreBet);
    const realResult = Math.sign(realHomeScore - realAwayScore);
    
    if (betResult === realResult) {
      return 1;
    }
    
    return 0;
  }
}
