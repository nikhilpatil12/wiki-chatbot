export interface ChatMessage {
    id?: string;
    question: string;
    answer: string;
    thread: string;
    ts: Date;
}