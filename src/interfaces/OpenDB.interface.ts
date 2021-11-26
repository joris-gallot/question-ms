export interface IResponseOpenDBGetQuestions {
  response_code: number;
  results: IOpenDBQuestion[];
}

export interface IOpenDBQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface IResponseOpenDBGetCategory {
  trivia_categories: IOpenDBQuestion[];
}

export interface IOpenDBQuestion {
  id: number;
  name: string;
}
