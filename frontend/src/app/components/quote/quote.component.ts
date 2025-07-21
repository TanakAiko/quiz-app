import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Quote, QuoteSubmission } from '../../models/quiz.model';
import { QuoteService } from '../../services/quote.service';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quote',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quote.component.html',
  styleUrl: './quote.component.css'
})
export class QuoteComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  quoteForm: FormGroup;

  currentQuote: Quote | null = null;
  errorMessage = '';
  isLoading = false;
  isSubmitting = false;
  showLevelTransition = false;

  // State from service
  currentLevel = 0;
  results: { [key: number]: boolean | null } = {};
  quotes: { [key: number]: Quote } = {};

  // Expose Object to template
  Object = Object;

  quoteService = inject(QuoteService);
  stateService = inject(StateService);
  router = inject(Router);
  fb = inject(FormBuilder)

  constructor() {
    this.quoteForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit() {
    this.quoteForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        console.log('Form value changed:', value);
        if (value.author === null || value.author === undefined) {
          return;
        }
        this.stateService.setAnswer(this.currentLevel, value.author?.trim());
      });

    this.stateService.state$.pipe(takeUntil(this.destroy$)).subscribe(state => {
      this.currentLevel = state.currentLevel;
      this.results = state.results;
      this.quotes = state.quotes;
      this.updateCurrentQuote();
    });

    if (Object.keys(this.quotes).length === 0) this.loadQuote();
    else this.updateCurrentQuote;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadQuote() {
    this.isLoading = true;
    this.errorMessage = '';

    this.quoteService.getQuotes().subscribe({
      next: (data: Quote[]) => {
        console.log('Quote fetched successfully:', data);

        this.stateService.setQuotes(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching quote:', error);
        this.isLoading = false;
        this.errorMessage = 'Failed to load quote. Please try again.';
      }
    });
  }

  updateCurrentQuote() {
    this.currentQuote = this.quotes[this.currentLevel] || null;
    if (this.results[this.currentLevel]) {
      this.resetForm();
    }
  }

  resetForm() {
    this.quoteForm.reset();
    this.errorMessage = '';
    this.isSubmitting = false;
  }

  canSubmit(): boolean {
    if (!this.currentQuote) return false;
    return true;
  }

  submitAuthor() {
    if (!this.currentQuote || !this.canSubmit()) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const currentAnswer = this.stateService.currentState.answers[this.currentLevel];

    const submission: QuoteSubmission = {
      id: this.currentQuote.id,
      answer: currentAnswer
    };

    console.log('Submitting answer:', submission);

    this.quoteService.submitAnswer(submission).subscribe({
      next: (result) => {
        this.stateService.setResult(this.currentLevel, result.success);
        this.isSubmitting = false;

        console.log('Submission result:', result);


        if (result.success) {
          if (this.currentLevel < 4) {
            this.showLevelTransition = true;
            setTimeout(() => {
              this.stateService.setCurrentLevel(this.currentLevel + 1);
              this.showLevelTransition = false;
            }, 1000);
          } else {
            // All levels completed
            setTimeout(() => {
              this.router.navigate(['/result']);
            }, 1500);
          }
        } else {
          this.errorMessage = result.message || 'Incorrect answer. Please try again.';
        }
      },
      error: (error) => {
        console.error('Error submitting answer:', error);
        this.isSubmitting = false;
        this.errorMessage = 'Failed to submit answer. Please try again.';
      }
    });
  }

  skipQuote() {
    if (this.currentLevel >= 5) {
      setTimeout(() => {
        this.router.navigate(['/result']);
      }, 2000);
      return;
    }

    this.stateService.setResult(this.currentLevel, false);
    this.stateService.setCurrentLevel(this.currentLevel + 1);
    this.resetForm();
  }

  getProgressPercentage(): number {
    const completedLevels = Object.values(this.results).filter(result => result === true).length;
    return (completedLevels / 5) * 100;
  }

  restart() {
    this.stateService.resetState();
    this.loadQuote();
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
