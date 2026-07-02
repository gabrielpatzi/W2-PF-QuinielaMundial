import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@Body() createGroupDto: CreateGroupDto, @CurrentUser() user: JwtPayload) {
    return this.groupsService.create(createGroupDto, user.sub);
  }

  @Post('join')
  join(@Body() joinGroupDto: JoinGroupDto, @CurrentUser() user: JwtPayload) {
    return this.groupsService.joinByCode(joinGroupDto, user.sub);
  }

  @Get()
  findAllMyGroups(@CurrentUser() user: JwtPayload) {
    return this.groupsService.findMyGroups(user.sub);
  }

  @Get(':id/participants')
  findParticipants(@Param('id') id: string) {
    return this.groupsService.findParticipants(id);
  }

  @Get(':id/leaderboard')
  getLeaderboard(@Param('id') id: string) {
    return this.groupsService.getLeaderboard(id);
  }
}
