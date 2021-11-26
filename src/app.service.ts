import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IOpenDBQuestion } from './interfaces/OpenDB.interface';
import { IQuestion } from './interfaces/Question.interface';
import { Question, QuestionDocument } from './schemas/question.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
  ) {}

  async findOrCreateQuestions(
    questionsFromOpenDB: IOpenDBQuestion[],
  ): Promise<IQuestion[]> {
    const questions = [];

    for (const questionObj of questionsFromOpenDB) {
      const q = await this.questionModel.findOne({
        question: questionObj.question,
      });

      if (!q) {
        const createdQuestion = await this.questionModel.create(questionObj);
        questions.push(createdQuestion);
      } else {
        questions.push(q);
      }
    }

    return questions;
  }

  getQuestionById(id: number) {
    return this.questionModel.findById(id);
  }
}
