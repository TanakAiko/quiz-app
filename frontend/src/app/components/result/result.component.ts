import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StateService } from '../../services/state.service';
import { Quote } from '../../models/quiz.model';
import { LeaderboardService } from '../../services/leaderboard.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-result',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent {
  quotes: { [key: number]: Quote } = {};
  answers: { [key: number]: string } = {};
  results: { [key: number]: boolean | null } = {};
  total: number = 0;
  correct: number = 0;
  incorrect: number = 0;
  timeTaken: number | null = null;

  playerName: string = '';
  scoreSubmitted = false;
  submitError: string | null = null;
  isSubmitting = false;

  stateService = inject(StateService);
  leaderboardService = inject(LeaderboardService);

  constructor() {
    this.quotes = this.stateService.currentState.quotes;
    this.answers = this.stateService.currentState.answers;
    this.results = this.stateService.currentState.results;
    this.total = Object.keys(this.quotes).length;
    this.correct = Object.values(this.results).filter(r => r === true).length;
    this.incorrect = Object.values(this.results).filter(r => r === false).length;
    if (this.stateService.currentState.startTime && this.stateService.currentState.completionTime) {
      this.timeTaken = Math.round((this.stateService.currentState.completionTime.getTime() - this.stateService.currentState.startTime.getTime()) / 1000);
    }
  }

  submitScore() {
    if (!this.playerName.trim()) {
      this.submitError = 'Please enter your name.';
      return;
    }
    this.isSubmitting = true;
    this.submitError = null;
    this.leaderboardService.submitScore({
      name: this.playerName.trim(),
      score: this.correct,
      date: new Date().toISOString()
    }).subscribe({
      next: () => {
        this.scoreSubmitted = true;
        this.isSubmitting = false;
      },
      error: () => {
        this.submitError = 'Failed to submit score. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}
