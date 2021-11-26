export interface IQuestion {
  id: string;
  difficulty: string;
  category: string;
  question: string;
  type: string;
  correct_answer: string;
  incorrect_answers: string[];
  createdAt: Date;
}
