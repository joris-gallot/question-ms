import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import {
  AnswersGameDto,
  ResponseAnswersGameDto,
} from './interfaces/Answer.interface';
import { IGetQuestionsQuery } from './interfaces/GetQuestionsQuery.interface';
import { IOpenDBQuestion } from './interfaces/OpenDB.interface';
import { ResponseGetQuestions } from './interfaces/Question.interface';
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
  async getQuestionByd(id: string): Promise<Question> {
    return this.appService.getQuestionById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('category')
  async getCategory(): Promise<IOpenDBQuestion[]> {
    return this.openDBService.getCategory();
  }

  @UseGuards(JwtAuthGuard)
  @Post('/games/:id/answers')
  async saveAnswers(
    @Param('id') id: string,
    @Body() payload: AnswersGameDto,
  ): Promise<ResponseAnswersGameDto> {
    const score = await this.appService.calculateScore(payload);

    const saveScore$ = await this.gameClient.send(
      { cmd: 'SAVE_SCORE' },
      { score, gameId: id, userId: 1 },
    );

    await lastValueFrom(saveScore$);

    return { score };
  }

  @UseGuards(JwtAuthGuard)
  @Get('questions')
  async getQuestion(
    @Query() query: IGetQuestionsQuery,
  ): Promise<ResponseGetQuestions> {
    const questions = await this.openDBService.getQuestions(query);

    const questionsFromDB = await this.appService.findOrCreateQuestions(
      questions,
    );

    const gameCreated$ = await this.gameClient.send(
      { cmd: 'CREATE_GAME' },
      { questions: questionsFromDB, userId: 1 },
    );

    const gameCreated = await lastValueFrom(gameCreated$);

    return { questions: questionsFromDB, gameId: gameCreated.id };
  }
}
