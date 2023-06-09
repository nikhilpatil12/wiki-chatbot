import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { interval } from 'rxjs';
import { ChatMessage } from '../ChatMessage';
import { ChatThread } from '../ChatThread'
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { NewchatDialogComponent } from '../newchat-dialog/newchat-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ChatMessagesResponse } from '../ChatMessageResponse';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {

  @ViewChild('answerHistory', { static: true })
  answerHistory!: ElementRef;
  inprogress = false;
  chatMessages: ChatMessage[] = [];
  chatThreads: ChatThread[] = [];
  newChatThread = false;
  currentThread = "";
  chatname: string = '';
  newQuestion: string | undefined;
  extractedData: string = '';
  pastdata: string = '';
  model: string = 'wikibot'
  loggedInUser = { email: '', fullname: '' }

  constructor(protected http: HttpClient, public dialog: MatDialog, public router: Router, public datePipe: DatePipe) { }
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
    this.inprogress = true;
    const that = this;
    this.extractedData = ''

    const req = new XMLHttpRequest();
    req.open('POST', this.url + '/api/answer');
    req.setRequestHeader('Content-Type', 'application/json');
    req.responseType = 'text';
    const data = { "question": this.newQuestion, "thread": this.currentThread, "model": this.model, "user": this.loggedInUser.email };
    req.onreadystatechange = function () {
      console.log(this)
      console.log(this.response)
      if (this.status === 200) {
        that.newQuestion = '';
        const response = this.responseText;
        that.extractedData = response == "" ? "" : response + "<br>";
        console.log(that.extractedData);
        console.log(this.responseText);
      }
      that.inprogress = false;
    };
    req.addEventListener('load', () => {
      if (req.status >= 200 && req.status < 300) {
        console.log('Stream completed');
        if (that.model == "chatgpt")
          console.log(req)
      } else {
        console.error(`Error streaming data: ${req.statusText}`);
      }
      that.inprogress = false;
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
    var loggedinuser = localStorage.getItem("user_login");
    if (loggedinuser)
      this.loggedInUser = JSON.parse(loggedinuser);
    this.currentThread = "Default";
    interval(1000).subscribe(() => {
      this.getHistory(this.loggedInUser.email);
    });
  }
  public getHistory = (queryUser: string) => {
    this.http.get<ChatMessagesResponse>(this.url + '/api/history?user=' + queryUser).subscribe(data => {
      console.log(data)
      // this.messages = data;
      const groupedMessages = this.groupByThread(data);
      // Convert the grouped messages to an array of chat threads
      this.chatThreads = Object.keys(groupedMessages).map(thread => {
        return { thread, messages: groupedMessages[thread] };
      });
      var cm = groupedMessages[this.currentThread];
      if (JSON.stringify(cm) !== this.pastdata) {
        this.pastdata = JSON.stringify(cm);
        this.chatMessages = groupedMessages[this.currentThread];

        // Set the scrollTop property to the height of the div
        this.answerHistory.nativeElement.scrollTop = this.answerHistory.nativeElement.scrollHeight;
      }
    });
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
  public userLogout = () => {
    console.log("Logout")
    localStorage.removeItem("user_login");
    this.router.navigate(['/login'])
  }
}
