import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Post()
  create(@Body() createPredictionDto: CreatePredictionDto, @CurrentUser() user: JwtPayload) {
    return this.predictionsService.create(createPredictionDto, user.sub);
  }

  @Get('me')
  findAll(@CurrentUser() user: JwtPayload) {
    return this.predictionsService.findAllMyPredictions(user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.predictionsService.findOne(id, user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePredictionDto: UpdatePredictionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.predictionsService.update(id, updatePredictionDto, user.sub);
  }
}
