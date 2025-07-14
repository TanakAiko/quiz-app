import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcom',
  imports: [CommonModule, FormsModule],
  templateUrl: './welcom.component.html',
  styleUrl: './welcom.component.css'
})
export class WelcomComponent {
  playerName: string = '';

  router = inject(Router);

  startGame() {
    const name = this.playerName.trim();
    if (name) {
      this.router.navigate(['/quiz'], { queryParams: { name } });
    } else {
      alert('Please enter your name to start the game.');
    }
  }
}