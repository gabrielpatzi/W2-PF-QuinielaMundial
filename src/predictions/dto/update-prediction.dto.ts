import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePredictionDto } from './create-prediction.dto';

// Para el update, no deberíamos poder cambiar el partido, solo el pronóstico
export class UpdatePredictionDto extends PartialType(OmitType(CreatePredictionDto, ['matchId'] as const)) {}
