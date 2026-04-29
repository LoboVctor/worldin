import { Test, TestingModule } from '@nestjs/testing';
import { IntercambiosService } from './intercambios.service';

describe('IntercambiosService', () => {
  let service: IntercambiosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntercambiosService],
    }).compile();

    service = module.get<IntercambiosService>(IntercambiosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
