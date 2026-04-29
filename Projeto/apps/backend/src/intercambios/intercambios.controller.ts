import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { IntercambiosService } from './intercambios.service';

@Controller('intercambios')
export class IntercambiosController {
  constructor(private intercambiosService: IntercambiosService) {}

  @Get()
  async findAll() {
    return this.intercambiosService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.intercambiosService.findById(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.intercambiosService.create(body);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.intercambiosService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.intercambiosService.delete(id);
    return { message: 'Intercâmbio excluído com sucesso.' };
  }
}
