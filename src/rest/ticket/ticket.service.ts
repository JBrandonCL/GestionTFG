import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Ticket, TicketDocument } from './schema/ticket';
import { UsersService } from '../users/users.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { TicketMapper } from './mapper/ticket.mapper';
import { FinesService } from '../users/fines.service';
import { Police } from '../police/entities/police.entity';
import { FilterQuery, PaginateOptions, PaginateModel } from 'mongoose';
const PDFDocument = require('pdfkit');
@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    @InjectModel(Ticket.name)
    private readonly ticketRepositoy: PaginateModel<TicketDocument>,
    private usersService: UsersService,
    private vehicleService: VehiclesService,
    private readonly ticketMapper: TicketMapper,
    private readonly finesService: FinesService,
  ) {}

  /**
   * Metodo que crea un ticket en la base de datos a partir de la matricula del vehiculo
   * @param createTicketDto Matricula y rason de la multa
   * @param police Datos del policia que crea la multa
   * @returns Ticket creado
   * @throws NotFoundException  no se encuentra el vehiculo o el usuario asociado al vehiculo
   * @throws BadRequestException si no se pudo crear el ticket
   */
  async create(
    createTicketDto: CreateTicketDto,
    police: Police,
  ): Promise<TicketDocument> {
    this.logger.log('Creating a ticket for ' + JSON.stringify(createTicketDto));
    //Se busca el vehiculo a traves de la placa, en caso de que no exista lanza una excepcion
    const vehicle = await this.vehicleService.findOne(createTicketDto.vehicle);
    //Se busca al usuario asociado al vehiculo, en caso de que no exista lanza una excepcion
    const user = await this.vehicleService.findPersonVehicles(vehicle.user.dni);
    //Se indica que el usuario tiene una multa
    await this.usersService.updateFineStatus(user.dni, true);
    //Se parsean los datos a los esquemas de la base de datos del usuario
    const userSchema = this.ticketMapper.toUserSchema(user);
    //Se parsean los datos a los esquemas de la base de datos del vehiculo
    const vehicleSchema = this.ticketMapper.toVehicleSchema(vehicle);
    //Se crea el policia en la base de datos
    const policeSchema = this.ticketMapper.toPoliceSchema(police);
    const ticket = this.ticketMapper.toEntitySchema(
      vehicleSchema,
      userSchema,
      policeSchema,
      createTicketDto,
    );
    const ticketCreated = await this.ticketRepositoy.create(ticket);
    const fines = this.ticketMapper.toFines(ticketCreated);
    this.logger.log('Creating a fine for the ticket ' + JSON.stringify(fines));
    await this.finesService.create(fines);
    return ticketCreated.save();
  }

  /**
   * Metodo que retorna todos los tickets de un usuario a partir de su dni
   * @param dni Dni del usuario
   * @returns Tickets[] del usuario , en caso de que no tenga multas retorna null
   */
  async findAll(dni: string): Promise<TicketDocument[]> {
    this.logger.log('Finding all tickets of the user with dni ' + dni);
    const user = await this.usersService.getUserByDni(dni);
    if (user.hasFines === false) {
      return null;
    }
    return this.ticketRepositoy.find({ 'usuario.dni': dni });
  }

  /**
   * Metodo que retorna un ticket a partir de su numero de referencia
   * @param referenceNumber Numero de referencia del ticket
   * @returns UserTicketDto
   * @throws NotFoundException si no se encuentra el ticket
   */
  async findOne(referenceNumber: string) {
    this.logger.log('Finding ticket with reference ' + referenceNumber);
    const exist = await this.ticketRepositoy.findOne({
      referenceNumber: referenceNumber,
    });
    this.logger.log('Ticket found ' + JSON.stringify(exist));
    if (!exist) {
      throw new NotFoundException('La multa no fue encontrada');
    }
    return this.ticketMapper.toResponseUserTicketDto(exist);
  }
  /*
   * Metodo que retorna un ticket a partir de su numero de referencia para el policia o administracion
   * @param referenceNumber Numero de referencia del ticket
   * @returns Ticket entity
   * @throws NotFoundException si no se encuentra el ticket
   */
  async findOneGestion(referenceNumber: string) {
    this.logger.log('Finding ticket with reference ' + referenceNumber);
    const exist = await this.ticketRepositoy.findOne({
      referenceNumber: referenceNumber,
    });
    this.logger.log('Ticket found ' + JSON.stringify(exist));
    if (!exist) {
      throw new NotFoundException('La multa no fue encontrada');
    }
    return this.ticketMapper.toResponseAdministrationDetailsTicketDto(exist);
  }
  /**
   * Metodo que retorna un ticket a partir de su numero de referencia con datos del policia y usuario
   * @param referenceNumber Numero de referencia del ticket
   * @returns Ticket entity
   * @throws NotFoundException si no se encuentra el ticket
   */
  async findOneAdmin(referenceNumber: string): Promise<TicketDocument> {
    this.logger.log('Finding ticket with reference ' + referenceNumber);
    const exist = await this.ticketRepositoy.findOne({
      referenceNumber: referenceNumber,
    });
    this.logger.log('Ticket found ' + JSON.stringify(exist));
    if (!exist) {
      throw new NotFoundException('La multa no fue encontrada');
    }
    return exist;
  }

  /**
   * Metodo que actualiza un ticket a partir de su numero de referencia
   * @param referenceNumber Numero de referencia del ticket
   * @param updateTicketDto Datos a actualizar
   * @param agent Datos del policia que actualiza la multa
   * @returns Ticket actualizado
   * @throws NotFoundException si no se encuentra el ticket
   * @throws BadRequestException si no se pudo actualizar el ticket
   * @throws HttpException si la multa fue eliminada correctamente
   * @throws NotFoundException si no se encuentra el vehiculo o el usuario asociado al vehiculo
   */
  async update(
    referenceNumber: string,
    updateTicketDto: UpdateTicketDto,
    agent: Police,
  ): Promise<TicketDocument> {
    this.logger.log('Updating ticket with reference ' + referenceNumber);
    //Se busca la multa
    const ticket = await this.ticketRepositoy.findOne({
      referenceNumber: referenceNumber,
    });
    if (!ticket) {
      throw new NotFoundException('La multa no fue encontrada');
    }
    //Se verifica si la multa ya paso el tiempo limite para modificarla y es policia
    if (
      agent.roleNames.includes('POLICE') &&
      !agent.roleNames.includes('ADMIN') &&
      !agent.roleNames.includes('ADMINISTRACION')
    ) {
      if (ticket.limitModTime <= new Date()) {
        throw new BadRequestException(
          'La multa ya no puede ser modificada, ha pasado el tiempo limite',
        );
      }
    }
    //Si se decide borrar la multa de manera fisica dado que aun no ha pasado el tiempo limite
    if (
      updateTicketDto.deleteTicker &&
      (agent.roleNames.includes('ADMIN') ||
        agent.roleNames.includes('ADMINISTRACION') ||
        ticket.limitModTime <= new Date())
    ) {
      //Busco todas los tickets que en las que el usuario tenga multas
      const user = await this.findAll(ticket.usuario.dni);
      //Si solo tiene una multa se le indica que no tiene multas, en caso solo se elimina la multa
      if (user.length === 1) {
        //Se le indica al usuario que no tiene multas
        await this.usersService.updateFineStatus(ticket.usuario.dni, false);
      }
      //Se indica que la multa ha sido eliminada
      await this.removePermanently(ticket.referenceNumber);
    }
    //Si se decide modificar el vehiculo
    if (updateTicketDto.vehicle) {
      //Se busca el vehiculo a traves de la placa, en caso de que no exista lanza una excepcion
      const vehicle = await this.vehicleService.findOne(
        updateTicketDto.vehicle,
      );
      //Se busca al usuario asociado al vehiculo, en caso de que no exista lanza una excepcion
      const user = await this.vehicleService.findPersonVehicles(
        vehicle.user.dni,
      );
      //Se indica que el usuario tiene una multa
      await this.usersService.updateFineStatus(user.dni, true);
      //Se parsean los datos a los esquemas de la base de datos del usuario
      const userSchema = this.ticketMapper.toUserSchema(user);
      //Se parsean los datos a los esquemas de la base de datos del vehiculo
      const vehicleSchema = this.ticketMapper.toVehicleSchema(vehicle);
      ticket.usuario = userSchema;
      ticket.vehicle = vehicleSchema;
    }
    //La razon del ticket es obligatoria
    ticket.reason = updateTicketDto.reason ?? ticket.reason;
    //La descripcion del ticket es opcional y si que puede estar vacia
    ticket.description = updateTicketDto.description;
    ticket.finesImport = updateTicketDto.finesImport ?? ticket.finesImport;
    //Se actualiza el ticket en el historial de multas
    const fines = this.ticketMapper.toFines(ticket);
    this.logger.log('Updating a fine for the ticket ' + JSON.stringify(fines));
    await this.finesService.updatefine(ticket.referenceNumber, fines);

    return ticket.save();
  }

  /**
   * Metodo que elimina un ticket de manera fisica y definitiva
   * @param id Numero de referencia del ticket
   * @throws NotFoundException si no se encuentra el ticket
   * @throws NotFoundException si no se encuentra el vehiculo o el usuario asociado al vehiculo
   */
  async removePermanently(id: string) {
    this.logger.log('Deleting ticket with id ' + id);
    const ticket = await this.ticketRepositoy.findOne({ referenceNumber: id });
    if (!ticket) {
      throw new NotFoundException('La multa no fue encontrada');
    }
    await this.finesService.deltefine(ticket.referenceNumber);
    await this.ticketRepositoy.deleteOne({ referenceNumber: id });
  }
  /**
   * Metodo que genera un pdf en el servidor con la informacion de la multa
   * @param id Numero de referencia de la multa
   * @returns Buffer con el pdf
   */
  async generarPDF(id: string): Promise<Buffer> {
    const fineDetails = await this.findOneAdmin(id);

    const pdfBuffer: Buffer = await new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'LETTER',
        bufferPages: true,
        margin: 50,
      });
      doc.font('Helvetica');
      // Configuración de estilos
      doc
        .fontSize(18)
        .fillColor('#0000FF')
        .text('Detalles de la multa', { align: 'center' });
      doc.moveDown();

      // Sección Dirección de envío
      doc.fontSize(14).fillColor('#0000FF').text('Dirección de envío');
      doc
        .fontSize(12)
        .fillColor('#000000')
        .text(`Dirección: ${fineDetails?.usuario?.direction}`)
        .text(`Código postal: ${fineDetails?.usuario?.zipcode}`);
      doc.moveDown();

      // Sección Detalles del vehículo
      doc.fontSize(14).fillColor('#0000FF').text('Detalles del vehículo');
      doc
        .fontSize(12)
        .fillColor('#000000')
        .text(`Placa: ${fineDetails?.vehicle?.linces_plate}`)
        .text(`Chasis: ${fineDetails?.vehicle?.chassis}`)
        .text(`Marca: ${fineDetails?.vehicle?.mark}`)
        .text(`Modelo: ${fineDetails?.vehicle?.model}`)
        .text(`Año: ${fineDetails?.vehicle?.year}`)
        .text(`Color: ${fineDetails?.vehicle?.colour}`)
        .text(`Tipo de vehículo: ${fineDetails?.vehicle?.type_Vehicle}`)
        .text(
          `Registro: ${fineDetails?.vehicle?.registration_document ? 'Registrado' : 'No registrado'}`,
        )
        .text(
          `Seguro: ${fineDetails?.vehicle?.insurance ? 'Con seguro' : 'Sin seguro'}`,
        );
      doc.moveDown();

      // Sección Detalles de la multa
      doc.fontSize(14).fillColor('#0000FF').text('Detalles de la multa');
      doc
        .fontSize(12)
        .fillColor('#000000')
        .text(
          `Número de identificación del policía: ${fineDetails?.police.identification}`,
        )
        .text(`Razón: ${fineDetails?.reason}`)
        .text(`Fecha: ${fineDetails?.createdAt}`)
        .text(`Número de referencia: ${fineDetails?.referenceNumber}`)
        .text(`Estado: ${fineDetails?.paid ? 'Pagada' : 'Sin pagar'}`)
        .text(`Importe: ${fineDetails?.finesImport}`);
      if (fineDetails?.description) {
        doc.text(`Descripción: ${fineDetails?.description}`);
      } else {
        doc.text(`Descripción: No hay descripción`);
      }
      doc.moveDown();
      // Sección Detalles al Usuario
      doc.fontSize(14).fillColor('#0000FF').text('Detalles del Infractor');
      doc
        .fontSize(12)
        .fillColor('#000000')
        .text(`DNI: ${fineDetails?.usuario?.dni}`)
        .text(`Nombre: ${fineDetails?.usuario?.name}`)
        .text(`Primero apellido: ${fineDetails?.usuario?.lastname1}`)
        .text(`Segundo apellido: ${fineDetails?.usuario?.lastname2}`)
        .text(`Ciudad: ${fineDetails?.usuario?.town}`)
        .text(`Dirrecion: ${fineDetails?.usuario?.direction}`)
        .text(`Codigo Postal: ${fineDetails?.usuario?.zipcode}`);
      doc.moveDown();
      // Finalizando el documento
      const buffer = [];
      doc.on('data', buffer.push.bind(buffer));
      doc.on('end', () => {
        const data = Buffer.concat(buffer);
        resolve(data);
      });
      doc.end();
    });

    return pdfBuffer;
  }
  /**
   * Metodo que devuelve todas las multas que ha hecho un policia
   * @param identification Numero de identificacion del policia
   * @returns Tickets[] del policia , en caso de que no tenga multas retorna null
   */
  async findAllTicketPolice(identification: string) {
    this.logger.log(
      'Finding all tickets of the police with identification ' + identification,
    );
    const fines = await this.ticketRepositoy
      .find({ 'police.identification': identification })
      .sort({ createdAt: 'desc' });
    if (fines.length > 0) {
      return fines.map((fine) =>
        this.ticketMapper.toResponseAdministrationTicketDto(fine),
      );
    } else {
      return null;
    }
  }
  /**
   * Metodo que devuelve todas las multas que ha hecho un policia 
   * @param linces_plate Matricula del vehiculo 
   * @param query Filtros de busqueda 
   * @param requestUrl Url de la peticion 
   * @returns PaginatedResult<TicketDocument> 
   */
  async findAllTicketOfVehicle(
    linces_plate: string,
    query: any,
    requestUrl: string,
  ) {
    this.logger.log(
      'Finding all tickets of the vehicle with identification ' + linces_plate,
    );

    // Crear el filtro base
    const filter: FilterQuery<TicketDocument> = {
      'vehicle.linces_plate': linces_plate,
    };

    // Añadir filtros adicionales si están presentes en la consulta
    if ('paid' in query) {
      filter.paid = query.paid;
    }
    if ('reason' in query) {
      filter.reason = new RegExp(query.reason, 'i'); // Filtrado por razón usando regex (case-insensitive)
    }

    // Configuración de paginación
    const options: PaginateOptions = {
      page: query.page || 1,
      limit: query.limit || 10,
      sort: { createdAt: 'desc' },
    };
    // Realizar la consulta paginada
    const result = await this.ticketRepositoy.paginate(filter, options);

    // Función auxiliar para limpiar y construir URLs de paginación
    const buildPageUrl = (url: string, page: number, limit: number): string => {
      const [baseUrl, queryString] = url.split('?');
      let queryParams = queryString ? queryString.split('&') : [];

      // Filtrar fuera los parámetros de página y límite antiguos
      queryParams = queryParams.filter(
        (param) => !param.startsWith('page=') && !param.startsWith('limit='),
      );

      // Añadir los nuevos parámetros de página y límite
      queryParams.push(`page=${page}`);
      queryParams.push(`limit=${limit}`);

      // Reconstruir la URL
      return `${baseUrl}?${queryParams.join('&')}`;
    };

    // Construir la URL de la siguiente página
    let nextPageUrl = null;
    if (result.hasNextPage) {
      nextPageUrl = buildPageUrl(requestUrl, result.nextPage, options.limit);
      this.logger.log('La url de la siguiente página es: ' + nextPageUrl);
    }

    // Construir la URL de la página anterior
    let prevPageUrl = null;
    if (result.hasPrevPage) {
      prevPageUrl = buildPageUrl(requestUrl, result.prevPage, options.limit);
      this.logger.log('La url de la página anterior es: ' + prevPageUrl);
    }
    const finesResponse = result.docs.map((fine) =>
      this.ticketMapper.toResponseAdministrationTicketDto(fine),
    );
    // Agregar las URLs de las páginas a los resultados
    const paginatedResult = {
      ...result,
      docs: finesResponse,
      nextPageUrl,
      prevPageUrl,
    };

    return paginatedResult;
  }
  /**
   * Metodo que devuelve los detalles de una multa para el usuario
   * @param referenceNumber Numero de referencia de la multa
   * @returns DetailsTicketDto
   */
  async detailsTicket(referenceNumber: string) {
    this.logger.log('Finding ticket with reference ' + referenceNumber);
    const exist = await this.ticketRepositoy.findOne({
      referenceNumber: referenceNumber,
    });
    this.logger.log('Ticket found ' + JSON.stringify(exist));
    if (!exist) {
      throw new NotFoundException('La multa no fue encontrada');
    }
    return this.ticketMapper.toDetailsTicket(exist);
  }
  /**
   * Metodo que devuelve todas las multas de un policia 
   * @param identificacion identificacion del policia 
   * @param query parametros de busqueda 
   * @param requestUrl url de la peticion 
   * @returns PaginatedResult<TicketDocument> 
   */
  async findAllTicketOfPolice(
    identificacion: string,
    query: any,
    requestUrl: string,
  ) {
    this.logger.log(
      'Finding all tickets of the identificacion with identification ' +
        identificacion,
    );

    // Crear el filtro base
    const filter: FilterQuery<TicketDocument> = {
      'police.identification': identificacion,
    };

    // Añadir filtros adicionales si están presentes en la consulta
    if ('paid' in query) {
      filter.paid = query.paid;
    }
    if ('reason' in query) {
      filter.reason = new RegExp(query.reason, 'i'); // Filtrado por razón usando regex (case-insensitive)
    }

    // Configuración de paginación
    const options: PaginateOptions = {
      page: query.page || 1,
      limit: query.limit || 10,
      sort: { createdAt: 'desc' },
    };

    // Realizar la consulta paginada
    const result = await this.ticketRepositoy.paginate(filter, options);

    // Función auxiliar para limpiar y construir URLs de paginación
    const buildPageUrl = (url: string, page: number, limit: number): string => {
      const [baseUrl, queryString] = url.split('?');
      let queryParams = queryString ? queryString.split('&') : [];

      // Filtrar fuera los parámetros de página y límite antiguos
      queryParams = queryParams.filter(
        (param) => !param.startsWith('page=') && !param.startsWith('limit='),
      );

      // Añadir los nuevos parámetros de página y límite
      queryParams.push(`page=${page}`);
      queryParams.push(`limit=${limit}`);

      // Reconstruir la URL
      return `${baseUrl}?${queryParams.join('&')}`;
    };

    // Construir la URL de la siguiente página
    let nextPageUrl = null;
    if (result.hasNextPage) {
      nextPageUrl = buildPageUrl(requestUrl, result.nextPage, options.limit);
      this.logger.log('La url de la siguiente página es: ' + nextPageUrl);
    }

    // Construir la URL de la página anterior
    let prevPageUrl = null;
    if (result.hasPrevPage) {
      prevPageUrl = buildPageUrl(requestUrl, result.prevPage, options.limit);
      this.logger.log('La url de la página anterior es: ' + prevPageUrl);
    }

    const finesResponse = result.docs.map((fine) =>
      this.ticketMapper.toResponseAdministrationTicketDto(fine),
    );

    // Agregar las URLs de las páginas a los resultados
    const paginatedResult = {
      ...result,
      docs: finesResponse,
      nextPageUrl,
      prevPageUrl,
    };

    return paginatedResult;
  }
  /**
   * Metodo que devuelve todas las multas de un usuario 
   * @returns Tickets[] del usuario , en caso de que no tenga multas retorna null 
   */
  async findAllFines(){
    this.logger.log('Finding all fines');
    var fines= this.ticketRepositoy.find();
    return (await fines).map((fine) =>
      this.ticketMapper.toResponseAdministrationTicketDto(fine),
    );
  }
}
