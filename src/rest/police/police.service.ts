import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreatePoliceDto } from './dto/create-police.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Police } from './entities/police.entity';
import { Repository } from 'typeorm';
import { BcryptServices } from '../users/bcrypt.services';
import { Role, UserRole } from '../users/entities/user-role.entity';
import { plainToClass } from 'class-transformer';
import { TicketService } from '../ticket/ticket.service';
import { CreateTicketDto } from '../ticket/dto/create-ticket.dto';
import { FinesService } from '../users/fines.service';
import { UsersService } from '../users/users.service';
import { PoliceMapper } from './mapper/police.mapper';
import { VehiclesService } from '../vehicles/vehicles.service';
import { ResponsePoliceDto } from './dto/response-police.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { isUUID } from 'class-validator';
import { MailerService } from '@nestjs-modules/mailer';
import { UpdatePoliceDto } from './dto/update-police.dto';

@Injectable()
export class PoliceService {
  private readonly logger = new Logger(PoliceService.name);
  constructor(
    @InjectRepository(Police)
    private policeRepository: Repository<Police>,
    private readonly bcryptService: BcryptServices,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    private readonly ticketService: TicketService,
    private readonly fineService: FinesService,
    private readonly userService: UsersService,
    private readonly policeMapper: PoliceMapper,
    private readonly vehiclesService: VehiclesService,
    private readonly mailService: MailerService,
  ) {}

  /**
   *  Se encarga de crear un nuevo policia en la base de datos
   * @param createPoliceDto  Datos del policia a crear
   * @returns  El policia creado o un error si ya existe un usuario con el mismo dni, username o correo
   */
  async create(createPoliceDto: CreatePoliceDto) {
    this.logger.log('Creating police');
    const errors = [];
    //Se busca si ya existe un usuario con el mismo dni , username o correo registrado en la base de datos
    if(await this.userService.findOne(createPoliceDto.dni)==null)
    {
      this.logger.log('PASA EL IF ');    
    const exist = await this.searchingByUserEmailDni(
      createPoliceDto.username,
      createPoliceDto.email,
      createPoliceDto.dni,
    );
    //Validaciones de los datos
    if (exist.username) {
      this.logger.error(
        `The username ${createPoliceDto.username} already exists`,
      );
      errors.push(`El nombre de usuario ${createPoliceDto.username} ya existe`);
    }
    if (exist.email) {
      this.logger.error(`The email ${createPoliceDto.email} already exists`);
      errors.push(`El correo ${createPoliceDto.email} ya esta registrado`);
    }
    if (exist.dni) {
      this.logger.error(`The dni ${createPoliceDto.dni} already exists`);
      errors.push(`El dni ${createPoliceDto.dni} ya esta registrado`);
    }
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
    const encryptedPassword = await this.bcryptService.hash(
      createPoliceDto.password,
    );
    const police = plainToClass(Police, createPoliceDto);
    police.password = encryptedPassword;
    const policeCreate = await this.policeRepository.save(police);

    //Se le asigna por defectoel rol de usuario
    const userRole = policeCreate.roles || [Role.POLICE];
    const userRoles = userRole.map((role) => ({
      police: policeCreate,
      role: Role[role],
    }));
    await this.userRoleRepository.save(userRoles);
    return policeCreate;
  }else{
    throw new BadRequestException('El dni ya esta registrado');

  }
  }
  /**
   * Metodo que devuelve un policia por su identificacion
   * @param identification Identificacion del policia formato UUID
   * @returns El policia encontrado o un error
   * @throws Excepcion BadRequest si la identificacion no es valida o si el policia no existe
   */
  async findOne(identification: string) {
    if (!isUUID(identification)) {
      throw new BadRequestException('Identificacion invalida');
    }
    const police = await this.policeRepository.findOne({
      where: { identification: identification },
    });
    if (police) {
      return police;
    } else {
      throw new BadRequestException(
        'El policia no fue encontrado, intentelo de nuevo',
      );
    }
  }
  /**
   *  Se encarga de crear un nuevo ticket en la base de datos y asignarle usuario ,vehiculo y policia ademas de enviar un correo al usuario
   * @param createTicket  Datos del ticket a crear
   * @param police  Policia que crea el ticket
   * @returns  El ticket creado o un error si no se puede crear el ticket
   */
  async createATicket(createTicket: CreateTicketDto, police: Police) {
    this.logger.log('Creating ticket');
    const ans = await this.ticketService.create(createTicket, police);
    this.mailService.sendMail({
      to: '23jbcl@gmail.com',
      from: 'madmotorlaravel@gmail.com',
      subject: 'Ticket de Multa Creado con Éxito',
      text: `
        Estimado/a ${ans.usuario.name},
    
        Nos complace informarle que su ha recibido una multa. A continuación, encontrará los detalles de su multa:
    
        Número de Referencia: ${ans.referenceNumber}
        Fecha de Emisión: ${ans.createdAt}
        Razón de la Multa: ${ans.reason}
        Importe de la Multa: ${ans.finesImport}
    
        Para más detalles, por favor consulte en la pagina web.
    
        Si tiene alguna pregunta o necesita más información, no dude en ponerse en contacto con nosotros.
    
        Atentamente,
        Gestion de Multas
        Joe Brandon
      `,
      html: `
        <p>Estimado/a <strong>${ans.usuario.name}</strong>,</p>
        <p>Nos complace informarle que su ha recibido una multa. A continuación, encontrará los detalles de su multa:</p>
        <ul>
          <li><strong>Número de Referencia:</strong> ${ans.referenceNumber}</li>
          <li><strong>Fecha de Emisión:</strong> ${ans.createdAt}</li>
          <li><strong>Razón de la Multa:</strong> ${ans.reason}</li>
          <li><strong>Importe de la Multa:</strong> ${ans.finesImport}</li>
        </ul>
        <p>Para más detalles, por favor consulte en la pagina web.</p>
        <p>Si tiene alguna pregunta o necesita más información, no dude en ponerse en contacto con nosotros.</p>
        <p>Atentamente,</p>
        <p><strong>Gestion de Multas</strong></p>
        <p>Joe Brandon</p>
      `,
    });
    return ans;
  }
  /**
   * Metodo para login de policia por nombre de usuario
   * @param userName Nombre de usuario del policia
   * @returns El policia encontrado o un error
   * @throws Excepcion BadRequest si el policia no existe
   */
  async findByUsername(userName: string) {
    const person = await this.policeRepository.findOne({
      where: { username: userName },
    });
    if (!person) {
      throw new BadRequestException('El policia no ha sido encontrado');
    }
    return person;
  }
  /**
   * Metodo para login de policia por correo 
   * @param username usuario del policia 
   * @param email Correo del policia 
   * @param dni Dni del policia 
   * @returns El policia encontrado o los campos con null si no se encuentran
   */
  async searchingByUserEmailDni(
    username?: string,
    email?: string,
    dni?: string,
  ) {
    this.logger.log(
      `Searching the user name : ${username} , with the email : ${email} if exists`,
    );
    const result: { username?: Police; email?: Police; dni?: Police } = {};

    const user = await this.policeRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .orWhere('user.email = :email', { email })
      .orWhere('user.dni = :dni', { dni })
      .getOne();

    if (user) {
      if (user.username === username) {
        this.logger.log(`The user name : ${username} was found`);
        result.username = user;
      }
      if (user.email === email) {
        this.logger.log(`The email : ${email} was found`);
        result.email = user;
      }
      if (user.dni === dni) {
        this.logger.log(`The dni : ${dni} was found`);
        result.dni = user;
      }
    }
    return result;
  }
  /**
   * Metodo para buscar un policia por su dni 
   * @param dni Dni del policia 
   * @returns El policia encontrado o null
   */
  async findByDNI(dni: string) {
    const person = await this.policeRepository.findOne({
      where: { dni: dni },
    });
    if (!person) {
      return null;
    }
    return person;
  }
  /**
   * Metodo para buscar un policia por su correo 
   * @param dni Dni del policia 
   * @param query Query de busqueda 
   * @returns El policia encontrado o un error
   * @throws Excepcion BadRequest si el policia no existe 
   */
  async getUserInfo(dni: string, query: any) {
    const user = await this.userService.findOne(dni);
    if (user != null) {
      const userResponse = this.policeMapper.toUserInfoResponse(user);
      const fines = await this.fineService.findAllByAgent(dni, query);
      if (fines) {
        return { userResponse, fines };
      } else {
        return { userResponse, null: null };
      }
    } else {
      throw new BadRequestException(
        'El usuario con el dni:' + dni + ' no ha sido encontrado',
      );
    }
  }
  /**
   * Metodo para buscar un vehiculo por su matricula 
   * @param plate Matricula del vehiculo 
   * @param query Query de busqueda 
   * @param requestUrl Url de la peticion 
   * @returns El vehiculo encontrado junto con sus multas que pueden ser o no null o un error
   * @throws Excepcion BadRequest si el vehiculo no existe 
   */
  async getVehicleInfo(plate: string, query: any, requestUrl: string) {
    const vehicle = await this.vehiclesService.findOne(plate);
    if (vehicle != null) {
      const vehicleResponse =
        this.policeMapper.toResponseVehicleInfoDetails(vehicle);
      const fines = await this.ticketService.findAllTicketOfVehicle(
        plate,
        query,
        requestUrl,
      );
      if (fines.docs.length > 0) {
        return { vehicleResponse, fines };
      } else {
        return { vehicleResponse, fines: null };
      }
    } else {
      throw new BadRequestException(
        'El vehiculo con la matricula:' + plate + ' no ha sido encontrado',
      );
    }
  }
  /**
   * Metodo para buscar un policia por su identificacion 
   * @param identificacion Identificacion del policia 
   * @param query parametros de busqueda 
   * @param requestUrl Url de la peticion 
   * @returns El policia encontrado junto con sus multas que pueden ser o no null o un error 
   */
  async getPoliceInfo(identificacion: string, query: any, requestUrl: string) {
    const police = await this.findOne(identificacion);
    const responsePolice = this.policeMapper.toResponsePolice(police);
    const fines = await this.ticketService.findAllTicketOfPolice(
      identificacion,
      query,
      requestUrl,
    );
    return { responsePolice, fines };
  }
  /**
   * Metodo para buscar todos los usuarios de la aplicacion 
   * @returns Lista de usuarios 
   */
  async getAllUser() {
    return await this.userService.findAllusers();
  }
  /**
   * Metodo para buscar todos los policias de la aplicacion que tengan el rol de Police 
   * @returns Lista de policias 
   */
  async getAllPolice(): Promise<ResponsePoliceDto[]> {
    const police = await this.policeRepository
      .createQueryBuilder('police')
      .leftJoinAndSelect('police.roles', 'role')
      .where('role.role = :role', { role: 'POLICE' })
      .getMany();
    return police.map((police) => this.policeMapper.toResponsePolice(police));
  }
  /**
   * Metodo para buscar todos los policias de la aplicacion que tengan el rol de Administracion 
   * @returns Lista de policias 
   */
  async getAllAdministration(): Promise<ResponsePoliceDto[]> {
    const police = await this.policeRepository
      .createQueryBuilder('police')
      .leftJoinAndSelect('police.roles', 'role')
      .where('role.role = :role', { role: 'ADMINISTRACION' })
      .getMany();
    return police.map((police) => this.policeMapper.toResponsePolice(police));
  }
  /**
   * Metodo para hacer un borrado logico de un policia 
   * @param identificacion Identificacion del policia
   * @throws Excepcion BadRequest si el policia no existe 
   */
  async logicalDeletePolice(identificacion: string) {
    const police = await this.findOne(identificacion);
    if (police != null) {
      police.isDeleted = true;
      await this.policeRepository.save(police);
    } else {
      throw new BadRequestException(
        'The police with the identificacion:' +
          identificacion +
          ' does not exist',
      );
    }
  }
  /**
   * Metodo para revertir un borrado logico de un policia 
   * @param identificacion Identificacion del policia
   * @throws Excepcion BadRequest si el policia no existe
   */
  async logicalRevertDeletePolice(identificacion: string) {
    const police = await this.findOne(identificacion);
    if (police != null) {
      police.isDeleted = false;
      await this.policeRepository.save(police);
    } else {
      throw new BadRequestException(
        'The police with the identificacion:' +
          identificacion +
          ' does not exist',
      );
    }
  }
  /**
   * Metodo para hacer un borrado logico de un usuario 
   * @param dni Dni del usuario 
   * @returns El usuario borrado
   */
  async logicalDeleteUser(dni: string) {
    return await this.userService.logicalDelete(dni);
  }
  /**
   * Metodo para revertir un borrado logico de un usuario 
   * @param dni Dni del usuario 
   * @returns El usuario revertido
   */
  async logicalRevertDeleteUser(dni: string) {
    return await this.userService.logicalRevertDeleteUser(dni);
  }
  /**
   * Metodo que se encarga de enviar los datos de un usuario para el formulario de edicion
   * @param dni Dni del usuario 
   * @returns Los datos del usuario 
   */
  async updateDetailsUser(dni: string) {
    return await this.userService.updateDetails(dni);
  }
  /**
   * Metodo que se encarga de actualizar los datos de un usuario
   * @param dni Dni del usuario 
   * @param updateUserDto  Datos del usuario a actualizar
   * @returns El usuario actualizado 
   */
  async updateUser(dni: string, updateUserDto: UpdateUserDto) {
    return await this.userService.update(dni, updateUserDto);
  }
  /**
   * Metodo que se encarga de enviar los datos de un vehiculo para el formulario de edicion 
   * @param id  Id del vehiculo
   * @throws Excepcion NotFound si la matricula no es valida
   */
  async removeFineFisicalTicket(id: string) {
    return await this.ticketService.removePermanently(id);
  }
  /**
   * Metodo que se encarga de enviar los datos de un policia para el formulario de edicion 
   * @param identificacion Identificacion del policia 
   * @returns Los datos del policia
   */
  async getPoliceDetails(identificacion: string) {
    return await this.findOne(identificacion);
  }
  /**
   *  Metodo que se encarga de actualizar los datos de un policia
   * @param identificacion Identificacion del policia  
   * @param updatePoliceDto Datos del policia a actualizar 
   * @returns El policia actualizado
   * @throws Excepcion BadRequest si el nombre de usuario o el correo ya estan en uso 
   */
  async updatePolice(identificacion: string, updatePoliceDto: UpdatePoliceDto) {
    this.logger.log(`Updating police with the next identificacion : ${identificacion}`);
    const police = await this.findOne(identificacion);

    const duplicate = await this.searchingByUserEmailDni(
      updatePoliceDto.username ? updatePoliceDto.username : null,
      updatePoliceDto.email ? updatePoliceDto.email : null,
    );

    if (duplicate.username && duplicate.username.identification !== identificacion) {
      throw new BadRequestException(
        `El nombre de usuario ${updatePoliceDto.username} ya esta en uso`,
      );
    }
    if (duplicate.email && duplicate.email.identification !== identificacion) {
      throw new BadRequestException(
        `El correo ${updatePoliceDto.email} ya esta en uso`,
      );
    }
    if (updatePoliceDto.password) {
      updatePoliceDto.password = await this.bcryptService.hash(
        updatePoliceDto.password, 
      );
    }
    this.logger.log(`Esto es lo que se va a actualizar ${JSON.stringify(updatePoliceDto)}`);
    //Se actualizan los datos del policia
    const policeToUpdated = this.policeMapper.toPoliceUpdate(updatePoliceDto, police);
    this.logger.log(`Esto es lo que se va a actualiza tras mapear ${JSON.stringify(policeToUpdated)}`);
    const policeUpdated = await this.policeRepository.save(policeToUpdated);
    return this.policeMapper.toResponsePolice(policeUpdated);
}
/**
 * Metodo que se encarga de buscar todas las multas de la aplicacion 
 * @returns  Lista de multas
 */
async allFines() {
  return await this.ticketService.findAllFines();
}
}
