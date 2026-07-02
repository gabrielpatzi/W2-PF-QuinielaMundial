import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchPhase, MatchStatus, Prisma } from '@prisma/client';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  create(createMatchDto: CreateMatchDto) {
    return this.prisma.match.create({
      data: createMatchDto,
    });
  }

  findAll(filters?: { phase?: MatchPhase; date?: string; status?: MatchStatus }) {
    const where: Prisma.MatchWhereInput = {};

    if (filters?.phase) {
      where.phase = filters.phase;
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      
      const endOfDay = new Date(filters.date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      where.matchDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return this.prisma.match.findMany({
      where,
      orderBy: { matchDate: 'asc' },
    });
  }

  async findOne(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
    });
    
    if (!match) {
      throw new NotFoundException('Partido no encontrado');
    }
    
    return match;
  }

  async update(id: string, updateMatchDto: UpdateMatchDto) {
    await this.findOne(id);
    
    return this.prisma.match.update({
      where: { id },
      data: updateMatchDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.match.delete({
      where: { id },
    });
  }
}
