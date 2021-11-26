import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { IGetQuestionsQuery } from './interfaces/GetQuestionsQuery.interface';
import {
  IOpenDBQuestion,
  IResponseOpenDBGetCategory,
  IResponseOpenDBGetQuestions,
} from './interfaces/OpenDB.interface';

@Injectable()
export class OpenDBService {
  constructor(private httpService: HttpService) {}

  async getQuestions(query: IGetQuestionsQuery): Promise<IOpenDBQuestion[]> {
    if ((query.amount && query.amount > 30) || !query.amount) {
      query.amount = 30;
    }

    const questionsRes$ = this.httpService.get<IResponseOpenDBGetQuestions>(
      'https://opentdb.com/api.php',
      {
        params: query,
      },
    );

    const { data } = await lastValueFrom(questionsRes$);

    return data.results;
  }

  async getCategory(): Promise<IOpenDBQuestion[]> {
    const questionsRes$ = this.httpService.get<IResponseOpenDBGetCategory>(
      'https://opentdb.com/api_category.php',
    );

    const { data } = await lastValueFrom(questionsRes$);

    return data.trivia_categories;
  }
}
