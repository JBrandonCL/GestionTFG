import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesAuthGuard } from '../auth/guards/roles-auth.guard';

@UseGuards(JwtAuthGuard,RolesAuthGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Roles('POLICE','ADMIN')
  @Post()
  async create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }
  @Roles('POLICE','ADMIN')
  @Get(':id')
  findAll(@Param('id') id: string) {
    return this.vehiclesService.findAll(id);
  }
  @Roles('POLICE','USER')
  @Get('/details/:id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOneDetails(id);
  }
}
 