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

        createdQuestion.answers = this.shuffle([
          ...createdQuestion.incorrect_answers,
          createdQuestion.correct_answer,
        ]);

        questions.push(createdQuestion);
      } else {
        q.answers = this.shuffle([...q.incorrect_answers, q.correct_answer]);

        questions.push(q);
      }
    }

    return questions;
  }

  private shuffle(array) {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
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
