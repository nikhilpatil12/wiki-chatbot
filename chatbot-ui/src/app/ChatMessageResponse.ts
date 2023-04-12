import { ChatMessage } from "./ChatMessage";

export interface ChatMessagesResponse {
    [thread: string]: ChatMessage[];
}