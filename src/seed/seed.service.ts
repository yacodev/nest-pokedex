import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose/dist/common';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany({});

    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=600',
    );

    // insert all pokemon in the database
    /* const insertPromiseArray = [];

    data.results.forEach(async ({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];
      
      insertPromiseArray.push(this.pokemonModel.create({ no, name }));
    });

    await Promise.all(insertPromiseArray); */

    const pokemonToInsert: { name: string; no: number }[] = [];

    data.results.forEach(async ({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];

      pokemonToInsert.push({ no, name });
    });

    await this.pokemonModel.insertMany(pokemonToInsert);

    return 'seed executed';
  }
}
