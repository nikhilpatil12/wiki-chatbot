import { ChatMessage } from "./ChatMessage";

export interface ChatThread {
    thread: string;
    messages: ChatMessage[];
}