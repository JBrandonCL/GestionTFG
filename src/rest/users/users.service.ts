import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { BcryptServices } from './bcrypt.services';
import { Role, UserRole } from './entities/user-role.entity';
import { UsersMapper } from './mapper/users.mapper';
import { VehiclesService } from '../vehicles/vehicles.service';
import { FinesService } from './fines.service';
import { FinesHistory } from './entities/user-finesHistory';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly bcryptService: BcryptServices,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    private readonly usersMapper: UsersMapper,
    private vehicleService: VehiclesService,
    private readonly finesService: FinesService,
  ) {}

  /**
   * Metodo que se encarga de crear un usuario en la base de datos
   * Primero se valida que el usuario no exista una persona con el mismo dni, correo o nombre de usuario en la base de datos
   * @param createUserDto datos del usuario a crear
   * @throws BadRequestException si ya existe un usuario con el mismo dni,username o correo en la base de datos
   */
  async create(createUserDto: CreateUserDto) {
    this.logger.log(
      `Creating user with the next data: ${JSON.stringify(createUserDto)}`,
    );
    const errors = [];
    //Se busca si ya existe un usuario con el mismo dni , username o correo registrado en la base de datos
    const exist = await this.searchingByUserEmailDni(
      createUserDto.username,
      createUserDto.email,
      createUserDto.dni,
    );

    //Validaciones de los datos
    if (exist.username) {
      this.logger.error(
        `The username ${createUserDto.username} already exists`,
      );
      errors.push(`El nombre de usuario ${createUserDto.username} ya existe`);
    }
    if (exist.email) {
      this.logger.error(`The email ${createUserDto.email} already exists`);
      errors.push(`El correo ${createUserDto.email} ya esta en uso`);
    }
    if (exist.dni) {
      this.logger.error(`The dni ${createUserDto.dni} already exists`);
      errors.push(`El dni ${createUserDto.dni} ya existe en la base de datos`);
    }
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const encryptedPassword = await this.bcryptService.hash(
      createUserDto.password,
    );

    const userEntity = this.usersMapper.toEntity(createUserDto);
    userEntity.password = encryptedPassword;
    const userCreated = await this.userRepository.save(userEntity);
    //Se le asigna por defectoel rol de usuario
    const userRole = userCreated.roles || [Role.USER];
    const userRoles = userRole.map((role) => ({
      user: userCreated,
      role: Role[role],
    }));
    await this.userRoleRepository.save(userRoles);
    return this.usersMapper.toResponse(userCreated);
  }

  /**
   * Metodo que se encarga de buscar un usuario por su dni en el ase de datos
   * @param dni dni del usuario a buscar
   * @returns usuario encontrado en la base de datos o null si no existe
   */
  async findOne(dni: string) {
    const person = await this.userRepository.findOne({
      where: { dni: dni },
    });
    if (!person) {
      this.logger.log(`User with id ${dni} not found`);
      return null;
    } else {
      return person;
    }
  }
  /**
   * Metodo que se encarga de buscar un usuario por su dni 
   * @param dni dni del usuario a buscar
   * @param updateUserDto datos del usuario a actualizar 
   * @returns usuario actualizado como Response
   * @throws NotFoundException si el usuario no existe en la base de datos
   * @throws BadRequestException si el nombre de usuario o correo ya esta en uso 
   */
  async update(dni: string, updateUserDto: UpdateUserDto) {
    this.logger.log(`Updating user with the next dni : ${dni}`);
    const user = await this.getUserByDni(dni);

    const duplicate = await this.searchingByUserEmailDni(
      updateUserDto.username ? updateUserDto.username : null,
      updateUserDto.email ? updateUserDto.email : null,
    );

    if (duplicate.username && duplicate.username.dni !== dni) {
      throw new BadRequestException(
        `El nombre de usuario ${updateUserDto.username} ya esta en uso`,
      );
    }
    if (duplicate.email && duplicate.email.dni !== dni) {
      throw new BadRequestException(
        `El correo ${updateUserDto.email} ya esta en uso`,
      );
    }
    if (updateUserDto.password) {
      updateUserDto.password = await this.bcryptService.hash(
        updateUserDto.password,
      );
    }
    //Se actualizan los datos del usuario
    const userToUpdated = this.usersMapper.toUserUpdate(updateUserDto, user);
    const userUpdated = await this.userRepository.save(userToUpdated);
    return this.usersMapper.toResponse(userUpdated);
  }

  /**
   * Metodo que se encarga de eliminar un usuario de la base de datos de manera logica
   * @param dni dni del usuario a eliminar
   * @returns usuario eliminado
   * @throws NotFoundException si el usuario no existe en la base de datos
   */
  async logicalDelete(dni: string) {
    this.logger.log(`Deleting user with the next dni : ${dni}`);
    const user = await this.getUserByDni(dni);
    user.isDeleted = true;
    return await this.userRepository.save(user);
  }
  /**
   * Metodo que se encarga de dar de alta un usuario de la base de datos de manera logica
   * @param dni dni del usuario a dar de alta
   * @returns usuario de alta
   * @throws NotFoundException si el usuario no existe en la base de datos
   */
  async logicalRevertDeleteUser(dni: string) {
    this.logger.log(`Update delete status user with the next dni : ${dni}`);
    const user = await this.getUserByDni(dni);
    user.isDeleted = false;
    return await this.userRepository.save(user);
  }

  /**
   * Metodo que se encarga de buscar una persona por su dni en la base de datos y la retorna
   * @param dni dni de la persona a buscar
   * @returns persona encontrada
   * @throws NotFoundException si la persona no existe en la base de datos
   */
  async getUserByDni(dni: string): Promise<User> {
    this.logger.log(`Getting user with the next dni: ${dni}`);
    //Metodo que busca una persona por dni en la base de datos
    const person = await this.userRepository.findOne({
      where: { dni: dni },
    });
    //Si la persona no existe en la base de datos se lanza una excepcion
    if (!person) {
      this.logger.error(`User with id ${dni} not found try again`);
      throw new NotFoundException(
        `El usuario con dni ${dni} no ha sido encontrado intente de nuevo`,
      );
    }
    //Si la persona existe en la base de datos se retorna
    this.logger.log(`User found: ${JSON.stringify(person)}`);
    return person;
  }
  /**
   * Metodo que se encarga de buscar un username , correo y dni en la base de datos
   * @param username username del usuario
   * @param email correo del usuario
   * @param dni dni del usuario
   * @returns un objeto con el usuario encontrado por username , correo y dni
   */
  async searchingByUserEmailDni(
    username?: string,
    email?: string,
    dni?: string,
  ) {
    this.logger.log(
      `Searching the user name : ${username} , with the email : ${email} if exists`,
    );
    const result: { username?: User; email?: User; dni?: User } = {};

    const user = await this.userRepository
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
   * Metodo que se encarga de actualizar el estado de la multa de un usuario
   * @param dni dni del usuario
   * @param status estado de la multa
   * @returns usuario actualizado
   * @throws NotFoundException si el usuario no existe en la base de datos
   */
  async updateFineStatus(dni: string, status: boolean) {
    this.logger.log(`Updating the fine status of the user with dni : ${dni}`);
    const user = await this.getUserByDni(dni);
    if (user.hasFines != status) {
      user.hasFines = status;
    }
    return await this.userRepository.save(user);
  }
  /**
   * Metodo que se encarga de buscar todas las multas de un usuario
   * @param dni dni del usuario
   * @returns multas del usuario
   */
  async searchFinesByUser(dni: string): Promise<FinesHistory[]> {
    this.logger.log(`Searching all fines of the user ${dni}`);
    return await this.finesService.findAllByUser(dni);
  }
  //************************************************************** Part of authenticaction **************************************************************//
  /**
   * Metodo que se encarga de buscar un usuario por su correo en la base de datos
   * @param email correo del usuario a buscar
   * @returns usuario encontrado en la base de datos o null si no se encontro
   */
  async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email: email } });
  }
  /**
   * Metodo que se encarga de buscar un usuario por su username en la base de datos
   * @param username  username del usuario a buscar
   * @returns usuario encontrado en la base de datos
   * @throws BadRequestException si no se encontro el usuario 
   */
  async findByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: { username: username },
    });
    this.logger.log(`User found ${JSON.stringify(user)}`);
    if (user) {
      return user;
    } else {
      throw new BadRequestException(
        `Algo salio mal por favor intente de nuevo`,
      );
    }
  }

  /**
   * Metodo que se encarga de buscar todos los vehiculos de un usuario
   * @param dni dni del usuario 
   * @returns vehiculos del usuario en Response
   */
  async findVehiclesByUser(dni: string) {
    this.logger.log(`Searching all vehicles of the user ${dni}`);
    return await this.vehicleService.findAll(dni);
  }
  /**
   * Metodo que se encarga de enviar los detalles de un usuario para el formulario de edicion
   * @param dni dni del usuario 
   * @returns usuario encontrado en Response
   * @throws BadRequestException si no se encontro el usuario 
   */
  async updateDetails(dni: string) {
    this.logger.log(`Updating details of the user ${dni}`);
    const user = await this.getUserByDni(dni);
    if (user) {
      return this.usersMapper.toResponse(user);
    } else {
      throw new BadRequestException(
        `Algo salio mal por favor intente de nuevo`,
      );
    }
  }
  /**
   * Metodo que se encarga de buscar todos los usuarios en la base de datos
   * @returns lista de usuarios en Response
   */
  async findAllusers() {
    this.logger.log(`Searching all users`);
    const users = await this.userRepository.find();
    return users.map((user) => this.usersMapper.toResponse(user));
  }
}
