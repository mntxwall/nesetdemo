import { Injectable } from '@nestjs/common';

class Cat {}

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];
  constructor() {
  }
  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }
}
