import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreatePredictionDto {
  @IsString()
  @IsNotEmpty()
  matchId: string;

  @IsInt()
  @Min(0)
  homeScoreBet: number;

  @IsInt()
  @Min(0)
  awayScoreBet: number;
}
