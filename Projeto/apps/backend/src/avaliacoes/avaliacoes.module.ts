import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvaliacoesService } from './avaliacoes.service';
import { AvaliacoesController } from './avaliacoes.controller';
import { Avaliacao } from './avaliacao.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Avaliacao])],
  providers: [AvaliacoesService],
  controllers: [AvaliacoesController]
})
export class AvaliacoesModule {}
