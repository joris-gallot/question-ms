import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AnswersGameDto } from './interfaces/Answer.interface';
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

  getQuestionById(id: string) {
    return this.questionModel.findById(id);
  }

  async calculateScore(payload: AnswersGameDto): Promise<number> {
    let score = 0;

    for (const answerObj of payload.answers) {
      const question = await this.getQuestionById(answerObj.questionId);

      if (answerObj.answer === question.correct_answer) {
        switch (question.difficulty) {
          case 'hard':
            score += 3;
            break;

          case 'medium':
            score += 2;
            break;

          default:
            score += 1;
            break;
        }
      }
    }

    return score;
  }
}
