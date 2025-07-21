import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaderboardEntry, LeaderboardResult } from '../models/quiz.model';

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  private readonly apiUrl = 'http://localhost:3000/api/leaderboard';

  constructor(private http: HttpClient) {}

  getLeaderboard(): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(this.apiUrl);
  }

  submitScore(entry: LeaderboardEntry): Observable<LeaderboardResult> {
    return this.http.post<LeaderboardResult>(this.apiUrl, entry);
  }
} 