import { Test, TestingModule } from '@nestjs/testing';
import { IntercambiosController } from './intercambios.controller';

describe('IntercambiosController', () => {
  let controller: IntercambiosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntercambiosController],
    }).compile();

    controller = module.get<IntercambiosController>(IntercambiosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
