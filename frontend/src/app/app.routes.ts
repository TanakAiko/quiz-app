import { Routes } from '@angular/router';
import { WelcomComponent } from './components/welcom/welcom.component';
import { QuizComponent } from './components/quiz/quiz.component';
import { ResultComponent } from './components/result/result.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { QuoteComponent } from './components/quote/quote.component';

export const routes: Routes = [
    {path: '', component: WelcomComponent},
    {path: 'quiz', component: QuizComponent},
    {path: 'result', component: ResultComponent},
    {path: 'leaderboard', component: LeaderboardComponent},
    {path: 'quote', component: QuoteComponent},
    {path: '**', redirectTo: ''}
];
