import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-quiz',
  imports: [CommonModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css'
})
export class QuizComponent {
  playerName: string = '';
  isLoading = false;
  isSubmitting = false;

  route = inject(ActivatedRoute)

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.playerName = params['name'] || 'Player';
    });
  }
}
