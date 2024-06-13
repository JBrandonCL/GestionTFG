import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { PoliceService } from './police.service';
import { CreatePoliceDto } from './dto/create-police.dto';
import { Roles, RolesAuthGuard } from '../auth/guards/roles-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTicketDto } from '../ticket/dto/create-ticket.dto';
import { TicketService } from '../ticket/ticket.service';
import { Request } from 'express';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { UpdateTicketDto } from '../ticket/dto/update-ticket.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { UpdatePoliceDto } from './dto/update-police.dto';

@UseGuards(JwtAuthGuard, RolesAuthGuard)
@Controller('police')
export class PoliceController {
  constructor(
    private readonly policeService: PoliceService,
    private readonly ticketService: TicketService,
  ) {}
  @Post()
  async create(@Body() createPoliceDto: CreatePoliceDto) {
    return await this.policeService.create(createPoliceDto);
  }
  /**
   * Metodo que se encarga de crear un ticket
   * @param createTicketDto   Datos del ticket a crear
   * @param request  Usuario que crea el ticket
   * @returns  El ticket creado o un error si no se pudo crear
   */
  @Roles('ADMIN', 'POLICE')
  @Post('ticket')
  async createTicket(
    @Body() createTicketDto: CreateTicketDto,
    @Req() request: any,
  ) {
    return await this.policeService.createATicket(
      createTicketDto,
      request.user,
    );
  }
  /**
   *  Metodo que se encarga de obtener un ticket por su numero de referencia
   * @param id  Numero de referencia del ticket creado
   * @returns El ticket creado o un error si no se pudo encontrar
   */
  @Roles('ADMIN', 'POLICE')
  @Get('ticket/:id')
  async getTicket(@Param('id') id: string) {
    return await this.ticketService.findOne(id);
  }
  /**
   * Metodo que se encarga de obtener todos los tickets del policia en sesion
   * @param request  Usuario que realiza la peticion
   * @returns Lista de tickets del policia
   */
  @Roles('POLICE')
  @Get('me/ticket')
  async getTickets(@Req() request: any) {
    return await this.ticketService.findAllTicketPolice(
      request.user.identification,
    );
  }
  /**
   * Metodo que se encarga de obtener todos los tickets de un policia como administrador
   * @param id Id del policia
   * @returns Lista de tickets del policia
   */
  @Roles('ADMIN')
  @Get('me/ticket/:id')
  async getTicketsAdmin(@Param('id') id: string) {
    return await this.ticketService.findAll(id);
  }
  @Roles('ADMIN')
  @Get('validate/admin')
  async validAdmin(@Req() request: any) {
    return true;
  }
  @Get('validate/rol')
  async validateRol(@Req() request: any) {
    return request.user;
  }
  @Roles('ADMIN', 'POLICE')
  @Get('user/info/:id')
  async findUserInfo(
    @Param('id') id: string,
    @Paginate() query: PaginateQuery,
  ) {
    return await this.policeService.getUserInfo(id, query);
  }
  @Roles('ADMIN', 'POLICE')
  @Get('vehicle/info/:id')
  async findVehicleInfo(
    @Param('id') id: string,
    @Query() query: any,
    @Req() request: Request,
  ) {
    const requestUrl = `${request.protocol}://${request.get('host')}${request.originalUrl}`;
    return await this.policeService.getVehicleInfo(id, query, requestUrl);
  }
  @Roles('ADMIN', 'POLICE')
  @Get('police/info/:id')
  async findPoliceInfo(
    @Param('id') id: string,
    @Query() query: any,
    @Req() request: Request,
  ) {
    const requestUrl = `${request.protocol}://${request.get('host')}${request.originalUrl}`;
    return await this.policeService.getPoliceInfo(id, query, requestUrl);
  }

  @Roles('ADMIN', 'POLICE')
  @Get('fine/info/admin/:id')
  async findFineInfo(@Param('id') id: string) {
    return await this.ticketService.findOneAdmin(id);
  }
  @Roles('ADMIN', 'POLICE')
  @Get('fine/info/:id')
  async findFineInfoAgent(@Param('id') id: string) {
    return await this.ticketService.findOneGestion(id);
  }
  @Roles('ADMIN', 'POLICE', 'ADMINISTRACION')
  @Get('fine/update/:id')
  async detailsTicket(@Param('id') id: string) {
    return await this.ticketService.detailsTicket(id);
  }
  @Roles('ADMIN', 'POLICE')
  @Patch('fine/update/:id')
  async updateFine(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Req() request: any,
  ) {
    return await this.ticketService.update(id, updateTicketDto, request.user);
  }
  @Roles('ADMIN', 'POLICE')
  @Get('pruebas')
  async pruebas(@Req() request: any) {
    return request.user.roles[0].role;
  }
  @Roles('ADMIN')
  @Get('allUsers')
  async allUsers() {
    return await this.policeService.getAllUser();
  }
  @Roles('ADMIN')
  @Get('allPolice')
  async allPolice() {
    return await this.policeService.getAllPolice();
  }
  @Roles('ADMIN')
  @Get('allAdministration')
  async allAdministration() {
    return await this.policeService.getAllAdministration();
  }
  @Roles('ADMIN')
  @Get('removeAgent/:id')
  async removeAgent(@Param('id') id: string) {
    return await this.policeService.logicalDeletePolice(id);
  }
  @Roles('ADMIN')
  @Get('upAgent/:id')
  async changeDelete(@Param('id') id: string) {
    return await this.policeService.logicalRevertDeletePolice(id);
  }
  @Roles('ADMIN')
  @Get('removeUser/:id')
  async removeUser(@Param('id') id: string) {
    return await this.policeService.logicalDeleteUser(id);
  }
  @Roles('ADMIN')
  @Get('upUser/:id')
  async changeDeleteUser(@Param('id') id: string) {
    return await this.policeService.logicalRevertDeleteUser(id);
  }
  @Roles('ADMIN')
  @Get('update/user/:id')
  async detailsUser(@Param('id') id: string) {
    return await this.policeService.updateDetailsUser(id);
  }
  @Roles('ADMIN')
  @Patch('update/user/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.policeService.updateUser(id, updateUserDto);
  }
  @Roles('ADMIN')
  @Get('removeFine/:id')
  async removeFine(@Param('id') id: string) {
    return await this.policeService.removeFineFisicalTicket(id);
  }
  @Roles('ADMIN')
  @Get('update/police/:id')
  async detailsPolice(@Param('id') id: string) {
    return await this.policeService.getPoliceDetails(id);
  }
  @Roles('ADMIN')
  @Patch('update/police/:id')
  async updatePolice(
    @Param('id') id: string,
    @Body() updatePoliceDto: UpdatePoliceDto,
  ) {
    return await this.policeService.updatePolice(id, updatePoliceDto);
  }
  @Roles('ADMIN')
  @Get('admin/allFines')
  async allFines() {
    return await this.policeService.allFines();
  }
}
