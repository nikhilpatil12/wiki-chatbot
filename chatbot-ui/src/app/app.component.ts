import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { interval } from 'rxjs';
import { ChatMessage } from './ChatMessage';
import { ChatThread } from './ChatThread'
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { NewchatDialogComponent } from './newchat-dialog/newchat-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ChatMessagesResponse } from './ChatMessageResponse';
import { io } from 'socket.io-client';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private socket: any;
  chatMessages: ChatMessage[] = [];
  chatThreads: ChatThread[] = [];
  newChatThread = false;
  currentThread = "";
  chatname: string = '';
  newQuestion: string | undefined;
  extractedData: string = '';
  constructor(protected http: HttpClient, public dialog: MatDialog) { }
  openNewChatDialog(): void {
    const dialogRef = this.dialog.open(NewchatDialogComponent, {
      data: { name: this.chatname },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);
      if (result) {
        this.currentThread = result;
        const threadIndex = this.chatThreads.findIndex(thread => thread.thread === result);
        console.log(threadIndex)
        if (threadIndex == -1) {
          this.newChatThread = true
        } else {
          this.newChatThread = false

        }
      }
    });
  }
  title = 'chatbot-ui';
  showFiller = true;

  private url = environment.apiUrl;

  headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  setThread(th: string) {
    this.currentThread = th;
    this.newChatThread = false;
  }

  getAnswer() {
    const that = this;
    this.extractedData = ''

    const req = new XMLHttpRequest();
    req.open('POST', this.url + '/api/answer');
    req.setRequestHeader('Content-Type', 'application/json');
    req.responseType = 'text';
    const data = { "question": this.newQuestion, "thread": this.currentThread };
    req.onreadystatechange = function () {
      if (this.status === 200) {
        that.newQuestion = '';
        const response = this.responseText;
        that.extractedData = response + "<br>";
        console.log(that.extractedData);
      }
    };
    req.addEventListener('load', () => {
      if (req.status >= 200 && req.status < 300) {
        // this.extractedData += req.response;
        console.log('Stream completed');

      } else {
        console.error(`Error streaming data: ${req.statusText}`);
      }
    });

    req.addEventListener('error', () => {
      console.error('Network error');
    });

    req.addEventListener('abort', () => {
      console.log('Request aborted');
    });

    req.send(JSON.stringify(data));
  }

  ngOnInit() {
    // Establish a WebSocket connection
    this.socket = io();
    // Listen for the 'data_update' event
    this.socket.on('data_update', (data: ChatMessagesResponse) => {
      // Handle the updated data
      console.log(data);
      const groupedMessages = this.groupByThread(data);

      // Convert the grouped messages to an array of chat threads
      this.chatThreads = Object.keys(groupedMessages).map(thread => {
        return { thread, messages: groupedMessages[thread] };
      });
      this.chatMessages = groupedMessages[this.currentThread];
    });

    this.currentThread = "Default";
    // interval(1000).subscribe(() => {
    this.http.get<ChatMessagesResponse>(this.url + '/api/history').subscribe(data => {
      console.log(data)
      // this.messages = data;
      const groupedMessages = this.groupByThread(data);

      // Convert the grouped messages to an array of chat threads
      this.chatThreads = Object.keys(groupedMessages).map(thread => {
        return { thread, messages: groupedMessages[thread] };
      });
      this.chatMessages = groupedMessages[this.currentThread];
    });
    // });
  }

  private groupByThread(messages: ChatMessagesResponse): { [thread: string]: ChatMessage[] } {
    const result: { [thread: string]: ChatMessage[] } = {};
    Object.keys(messages).forEach(thread => {
      messages[thread].forEach(message => {
        if (result[thread]) {
          result[thread].push(message);
        } else {
          result[thread] = [message];
        }
      });
    });
    return result;
  }

}
