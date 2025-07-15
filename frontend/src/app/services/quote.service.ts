import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Quote, QuoteResult, QuoteSubmission } from "../models/quiz.model";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class QuoteService {
    private readonly apiUrl = 'http://localhost:3000/api/quotes';

    http = inject(HttpClient);

    getQuotes(): Observable<Quote[]> {
        return this.http.get<Quote[]>(this.apiUrl);
    }

    submitAnswer(submission: QuoteSubmission): Observable<QuoteResult> {
        return this.http.post<QuoteResult>(this.apiUrl, submission);
    }
}