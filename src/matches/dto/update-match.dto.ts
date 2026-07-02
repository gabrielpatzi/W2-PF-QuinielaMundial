import { PartialType } from '@nestjs/mapped-types';
import { CreateMatchDto } from './create-match.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { MatchStatus } from '@prisma/client';

export class UpdateMatchDto extends PartialType(CreateMatchDto) {
  @IsEnum(MatchStatus)
  @IsOptional()
  status?: MatchStatus;
}
