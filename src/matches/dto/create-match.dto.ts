import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MatchPhase } from '@prisma/client';

export class CreateMatchDto {
  @IsString()
  @IsOptional()
  externalId?: string;

  @IsString()
  @IsNotEmpty()
  homeTeam: string;

  @IsString()
  @IsNotEmpty()
  awayTeam: string;

  @IsString()
  @IsNotEmpty()
  stadiumCity: string;

  @IsString()
  @IsOptional()
  stadiumName?: string;

  @IsEnum(MatchPhase)
  @IsNotEmpty()
  phase: MatchPhase;

  @IsDateString()
  @IsNotEmpty()
  matchDate: string;
}
