import { Test, TestingModule } from '@nestjs/testing';
import { PoliceController } from './police.controller';
import { PoliceService } from './police.service';

describe('PoliceController', () => {
  let controller: PoliceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoliceController],
      providers: [PoliceService],
    }).compile();

    controller = module.get<PoliceController>(PoliceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
