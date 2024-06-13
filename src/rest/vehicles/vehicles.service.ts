import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { VehicleMapper } from './mapper/vehicle.mapper';
import { ResponseVehicleDetailsDTO } from './dto/responseDetails-vehicle.dto';

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly vehicleMapper: VehicleMapper,
  ) {}

  /**
   * Metodo que se encarga de crear un nuevo vehiculo en la base de datos
   * @param createVehicleDto DTO de creacion del vehiculo
   * @returns Vehiculo creado con el usuario asociado
   * @throws Excepcion BadRequest si el usuario no existe o si el vehiculo ya existe
   */
  async create(createVehicleDto: CreateVehicleDto) {
    //Se crea un array de errores para almacenar los errores que se encuentren y lanzarlos en caso de que existan
    const errors = [];
    this.logger.log(
      `Creating a new vehicle for the user ${createVehicleDto.dniOwner}`,
    );
    //Se busca el usuario en la base de datos
    const user = await this.userRepository.findOne({
      where: { dni: createVehicleDto.dniOwner },
    });
    //Si el usuario no existe se agrega un error al array
    if (!user) {
      errors.push(
        `El usuario con el dni ${createVehicleDto.dniOwner} no existe`,
      );
    }
    //Se busca el vehiculo en la base de datos
    const vehicle = await this.vehicleRepository.findOne({
      where: { linces_plate: createVehicleDto.linces_plate },
    });
    //Si el vehiculo ya existe se agrega un error al array
    if (vehicle) {
      errors.push(
        `El vehiculo con la matricula ${createVehicleDto.linces_plate} ya existe`,
      );
    }
    const chassis = await this.vehicleRepository.findOne({
      where: { chassis: createVehicleDto.chassis },
    });
    if (chassis) {
      errors.push(
        `El vehiculo con el chasis ${createVehicleDto.chassis} ya existe`,
      );
    }
    //SI existen errores se lanza una excepcion con todos los errores
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
    return await this.vehicleRepository.save(
      this.vehicleMapper.toEntity(createVehicleDto, user),
    );
  }

  /**
   * Metodo que se encarga de buscar todos los vehiculos de un usuario en la bbdd
   * @param dniOwner DNI del usuario
   * @returns Lista de vehiculos del usuario
   */
  async findAll(dniOwner: string) {
    this.logger.log(`Searching all vehicles of the user ${dniOwner}`);
    const vehicles = await this.vehicleRepository.find({
      where: { user: { dni: dniOwner } },
    });
    return vehicles.map((vehicle) => this.vehicleMapper.toResponse(vehicle));
  }
  /**
   * Metodo que se encarga de buscar un vehiculo por su matricula en la bbdd
   * @param id  matricula del vehiculo
   * @returns  vehiculo encontrado , si no existe lanza una excepcion
   */
  async findOne(id: string): Promise<Vehicle> {
    this.logger.log(`Searching the vehicle with the id ${id}`);
    const vehicle = await this.vehicleRepository.findOne({
      where: { linces_plate: id },
    });
    if (!vehicle) {
      throw new BadRequestException(
        `El vehiculo con la matricula ${id} no existe`,
      );
    }
    return vehicle;
  }
  /**
   * Metodo que se encarga de buscar un vehiculo por su matricula en la bbdd y devuelve los detalles para el usuario
   * @param id  matricula del vehiculo
   * @returns  vehiculo encontrado , si no existe lanza una excepcion
   */
  async findOneDetails(id: string): Promise<ResponseVehicleDetailsDTO> {
    this.logger.log(`Searching the vehicle with the id ${id}`);
    const vehicle = await this.vehicleRepository.findOne({
      where: { linces_plate: id },
    });
    if (!vehicle) {
      throw new BadRequestException(
        `El vehiculo con la matricula ${id} no existe`,
      );
    }
    return this.vehicleMapper.toResponseDetails(vehicle);
  }
  /**
   * Metodo que se encarga de buscar los vehiculos de un usuario por su dni
   * @param dni DNI del usuario
   * @returns Usuario con sus vehiculos
   * @throws Excepcion BadRequest si el usuario no existe
   */
  async findPersonVehicles(dni: string): Promise<User> {
    this.logger.log(`Searching the vehicles of the user with the dni ${dni}`);
    const user = await this.userRepository.findOne({
      where: { dni: dni },
    });
    if (!user) {
      throw new BadRequestException(`El usuario con el dni ${dni} no existe`);
    }
    return user;
  }
}
