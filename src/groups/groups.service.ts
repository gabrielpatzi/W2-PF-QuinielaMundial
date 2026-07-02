import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async create(createGroupDto: CreateGroupDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Create the group
      const group = await tx.group.create({
        data: {
          name: createGroupDto.name,
          ownerId: userId,
        },
      });

      // Automatically add the creator as a member
      await tx.groupMembership.create({
        data: {
          userId,
          groupId: group.id,
        },
      });

      return group;
    });
  }

  async joinByCode(joinGroupDto: JoinGroupDto, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { invitationCode: joinGroupDto.invitationCode },
    });

    if (!group) {
      throw new NotFoundException('Código de invitación no válido');
    }

    const existingMembership = await this.prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: group.id,
        },
      },
    });

    if (existingMembership) {
      throw new ConflictException('Ya perteneces a este grupo');
    }

    await this.prisma.groupMembership.create({
      data: {
        userId,
        groupId: group.id,
      },
    });

    return { message: `Te has unido al grupo ${group.name} exitosamente`, groupId: group.id };
  }

  async findMyGroups(userId: string) {
    const memberships = await this.prisma.groupMembership.findMany({
      where: { userId },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            invitationCode: true,
            ownerId: true,
            _count: {
              select: { memberships: true },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships.map((m) => ({
      ...m.group,
      myScore: m.scoreAcumulado,
    }));
  }

  async findParticipants(groupId: string) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Grupo no encontrado');

    const participants = await this.prisma.groupMembership.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return participants.map((p) => ({
      userId: p.user.id,
      name: p.user.name,
      joinedAt: p.joinedAt,
    }));
  }

  async getLeaderboard(groupId: string) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Grupo no encontrado');

    const participants = await this.prisma.groupMembership.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        scoreAcumulado: 'desc',
      },
    });

    return participants.map((p, index) => ({
      position: index + 1,
      userId: p.user.id,
      name: p.user.name,
      score: p.scoreAcumulado,
    }));
  }
}
