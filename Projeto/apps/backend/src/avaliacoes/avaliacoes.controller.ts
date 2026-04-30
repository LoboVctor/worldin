import { Controller, Get, Post, Body, Param, ParseIntPipe, Delete } from '@nestjs/common';
import { AvaliacoesService } from './avaliacoes.service';

@Controller('avaliacoes')
export class AvaliacoesController {
  constructor(private avaliacoesService: AvaliacoesService) {}

  @Get('intercambio/:id')
  async findByIntercambio(@Param('id', ParseIntPipe) id: number) {
    return this.avaliacoesService.findByIntercambio(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.avaliacoesService.create(body);
  }

  @Get('media/:id')
  async getAverageRating(@Param('id', ParseIntPipe) id: number) {
    const avg = await this.avaliacoesService.getAverageRating(id);
    return { media: avg };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.avaliacoesService.remove(id);
    return { message: 'Avaliação excluída com sucesso.' };
  }
}
