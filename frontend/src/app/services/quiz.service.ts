import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Challenge {
  id: number;
  type: 'text' | 'math' | 'image-select';
  question: string;
  correct: any;
  images?: { url: string; id: string }[];
}

export interface ChallengeSet {
  level1: Challenge;
  level2: Challenge;
  level3: Challenge;
}

export interface QuizSubmission {
  id: number;
  level: number;
  answer: any;
}

export interface QuizResult {
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private readonly apiUrl = 'http://localhost:3000/api/quiz';

  http = inject(HttpClient);

  getChallenges(): Observable<ChallengeSet> {
    return this.http.get<ChallengeSet>(this.apiUrl);
  }

  submitAnswer(submission: QuizSubmission): Observable<QuizResult> {
    return this.http.post<QuizResult>(this.apiUrl, submission);
  }
}