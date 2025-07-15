export interface Quote {
    id: number;
    quote: string;
}

export interface QuoteSubmission {
    id: number;
    answer: string;
}

export interface QuoteResult {
    success: boolean;
    message?: string;
}