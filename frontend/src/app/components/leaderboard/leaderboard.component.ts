import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LeaderboardService } from '../../services/leaderboard.service';
import { LeaderboardEntry } from '../../models/quiz.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-leaderboard',
  imports: [RouterLink, DatePipe],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent implements OnInit {
  leaderboard: LeaderboardEntry[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private leaderboardService: LeaderboardService) {}

  ngOnInit() {
    this.leaderboardService.getLeaderboard().subscribe({
      next: (data) => {
        this.leaderboard = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load leaderboard.';
        this.isLoading = false;
      }
    });
  }
}
