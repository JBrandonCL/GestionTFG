import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Roles, RolesAuthGuard } from '../auth/guards/roles-auth.guard';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, RolesAuthGuard)
@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) { }

  @Get("pdf/download/:id")
  async downloadPDF(@Res() res, @Param('id') id: string): Promise<void> {
    const buffer = await this.ticketService.generarPDF(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=example.pdf',
      'Content-Length': buffer.length,
    })

    res.end(buffer);
  }
  @Get('pruebas/ticket')
  findAllTicketsOfVehicle(@Query('linces_plate') linces_plate: string, @Query() query: any, @Req() request: Request) {
    const requestUrl = `${request.protocol}://${request.get('host')}${request.originalUrl}`;
    return this.ticketService.findAllTicketOfVehicle(linces_plate, query, requestUrl);
  }

  @Roles('ADMIN', 'POLICE')
  @Get('fine/gestion/:id')
  async findOneGestion(@Param('id') id: string) {
    return await this.ticketService.findOneGestion(id);
  }
  @Roles('ADMIN')
  @Get('fine/gestion/:id')
  async findOneAdmin(@Param('id') id: string) { 
    return await this.ticketService.findOneAdmin(id);
  }
  @Roles('USER')
  @Get('fine/:id')
  async findOne(@Param('id') id: string) {
    return await this.ticketService.findOne(id);
  }
}
