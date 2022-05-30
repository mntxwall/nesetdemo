import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { CatsService } from './cats.service';
import { Cat } from '../cats.interface';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Get()
  findAll(): Observable<Cat[]> {
    // @ts-ignore
    return of(this.catsService.findAll());
  }


  @Get(':id')
  findOne(@Param('id') id: string): string {
    console.log('HelloWolrd');
    return `a ${id}`;
  }

  @Post()
  async create(@Body() createCatDto: Cat) {
    this.catsService.create(createCatDto);
  }
}
