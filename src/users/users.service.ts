import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Usado por AuthService al registrar un nuevo usuario.
  // Recibe el password ya hasheado (bcrypt se aplica en AuthService).
  async create(createUserDto: CreateUserDto & { password: string }) {
    const existing = await this.findByEmail(createUserDto.email);
    if (existing) {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }

    return this.prisma.user.create({ data: createUserDto });
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map(User.fromPrisma);
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? User.fromPrisma(user) : null;
  }

  // Devuelve el usuario completo (incluye password) para uso interno de AuthService.
  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    return User.fromPrisma(user);
  }

  async getDashboardSummary(userId: string) {
    const memberships = await this.prisma.groupMembership.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            memberships: {
              orderBy: { scoreAcumulado: 'desc' },
            },
          },
        },
      },
    });

    const groupsCount = memberships.length;

    let totalScore = 0;
    const groupPositions = memberships.map((m) => {
      totalScore += m.scoreAcumulado;
      const index = m.group.memberships.findIndex((participant) => participant.userId === userId);
      return {
        groupId: m.groupId,
        groupName: m.group.name,
        position: index + 1,
        score: m.scoreAcumulado,
      };
    });

    const upcomingMatches = await this.prisma.match.findMany({
      where: {
        status: 'SCHEDULED',
        matchDate: { gt: new Date() },
        predictions: { none: { userId } },
      },
      orderBy: { matchDate: 'asc' },
      take: 5,
    });

    return {
      groupsCount,
      totalScore,
      groupPositions,
      upcomingPendingMatches: upcomingMatches,
    };
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
