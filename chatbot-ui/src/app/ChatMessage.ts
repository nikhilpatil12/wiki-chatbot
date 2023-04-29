export interface ChatMessage {
    id?: string;
    question: string;
    answer: string;
    thread: string;
    model: string;
    ts: Date;
}