export interface AnswersGameDto {
  answers: { answer: string; questionId: string }[];
}

export interface ResponseAnswersGameDto {
  score: number;
}
