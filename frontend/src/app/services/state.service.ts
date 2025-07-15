import { Injectable } from "@angular/core";
import { Quote } from "../models/quiz.model";
import { BehaviorSubject, Observable } from "rxjs";

export interface QuoteState {
    quotes: { [key: number]: Quote };
    currentLevel: number;
    answers: { [key: number]: any };
    results: { [key: number]: boolean | null };
    sessionId: string;
    startTime: Date;
    isCompleted: boolean;
    completionTime?: Date;
}

@Injectable({ providedIn: 'root' })
export class StateService {
    private readonly STORAGE_KEY = 'angul-it-quote-state';
    private stateSubject = new BehaviorSubject<QuoteState>(this.getInitialState());

    constructor() { this.loadFromStorage(); }

    private getInitialState(): QuoteState {
        return {
            quotes: {},
            currentLevel: 0,
            answers: {},
            results: {},
            isCompleted: false,
            sessionId: this.generateSessionId(),
            startTime: new Date(),
        };
    }

    get state$(): Observable<QuoteState> {
        return this.stateSubject.asObservable();
    }

    get currentState(): QuoteState {
        return this.stateSubject.value;
    }

    private generateSessionId(): string {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
    }

    setQuotes(quotes: { [key: number]: Quote }) {
        const newState = {
            ...this.currentState,
            quotes,
            startTime: new Date(),
            sessionId: this.generateSessionId()
        };
        this.updateState(newState);
    }

    setCurrentLevel(level: number) {
        const newState = {
            ...this.currentState,
            currentLevel: level
        };
        this.updateState(newState);
    }

    setAnswer(level: number, answer: any) {
        const newState = {
            ...this.currentState,
            answers: {
                ...this.currentState.answers,
                [level]: answer
            }
        };
        this.updateState(newState);
    }

    setResult(level: number, result: boolean) {
        const results = {
            ...this.currentState.results,
            [level]: result
        };

        const isCompleted = Object.values(results).every(r => r === true);

        const newState = {
            ...this.currentState,
            results,
            isCompleted,
            completionTime: isCompleted ? new Date() : undefined
        };
        this.updateState(newState);
    }

    resetState() {
        const newState = this.getInitialState();
        this.updateState(newState);
    }

    canAccessResults(): boolean {
        return this.currentState.isCompleted;
    }

    getCompletionTime(): number | null {
        if (!this.currentState.startTime || !this.currentState.completionTime) {
            return null;
        }
        return this.currentState.completionTime.getTime() - this.currentState.startTime.getTime();
    }

    private updateState(newState: QuoteState) {
        this.stateSubject.next(newState);
        this.saveStateToStorage(newState);
    }

    private saveStateToStorage(state: QuoteState) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
                ...state,
                startTime: state.startTime.toISOString(),
                completionTime: state.completionTime?.toISOString()
            }));
        } catch (error) {
            console.error('Failed to save state to localStorage:', error);
        }
    }

    private loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const parsedState = JSON.parse(stored);
                const state: QuoteState = {
                    ...parsedState,
                    startTime: new Date(parsedState.startTime),
                    completionTime: parsedState.completionTime ? new Date(parsedState.completionTime) : undefined
                };
                this.stateSubject.next(state);
            }
        } catch (error) {
            console.error('Failed to load state from localStorage:', error);
            this.resetState();
        }
    }
}