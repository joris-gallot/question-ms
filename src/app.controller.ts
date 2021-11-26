import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { IGetQuestionsQuery } from './interfaces/GetQuestionsQuery.interface';
import { IOpenDBQuestion } from './interfaces/OpenDB.interface';
import { IQuestion } from './interfaces/Question.interface';
import { OpenDBService } from './opentdb.service';
import { Question } from './schemas/question.schema';

@Controller()
export class AppController {
  constructor(
    @Inject('GAME_SERVICE') private gameClient: ClientProxy,
    private openDBService: OpenDBService,
    private appService: AppService,
  ) {}

  @MessagePattern({ cmd: 'GET_QUESTION' })
  async getQuestionByd(id: number): Promise<Question> {
    return this.appService.getQuestionById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('category')
  async getCategory(): Promise<IOpenDBQuestion[]> {
    return this.openDBService.getCategory();
  }

  @UseGuards(JwtAuthGuard)
  @Get('questions')
  async getQuestion(@Query() query: IGetQuestionsQuery): Promise<IQuestion[]> {
    const questions = await this.openDBService.getQuestions(query);

    const questionsFromDB = await this.appService.findOrCreateQuestions(
      questions,
    );

    const gameCreated$ = await this.gameClient.send(
      { cmd: 'CREATE_GAME' },
      { questions: questionsFromDB, userId: 1 },
    );

    await lastValueFrom(gameCreated$);

    return questionsFromDB;
  }
}
