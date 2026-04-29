import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntercambiosService } from './intercambios.service';
import { IntercambiosController } from './intercambios.controller';
import { Intercambio } from './intercambio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Intercambio])],
  providers: [IntercambiosService],
  controllers: [IntercambiosController]
})
export class IntercambiosModule {}
