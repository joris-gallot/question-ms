import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema()
export class Question {
  @Prop()
  difficulty: string;

  @Prop()
  category: string;

  @Prop()
  question: string;

  @Prop()
  type: string;

  @Prop()
  correct_answer: string;

  @Prop()
  incorrect_answers: string[];

  @Prop({ default: new Date() })
  createdAt: Date;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
