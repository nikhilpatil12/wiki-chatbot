import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { interval } from 'rxjs';
import { Chat } from './chat';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  messages: Chat[] = [];
  newQuestion: string | undefined;
  constructor(protected http: HttpClient) {}

  title = 'chatbot-ui';
  showFiller = true;

  // url = 'http://127.0.0.1:5000/answer';

  headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  // getAnswer<T>(): Observable<T> {
  //   var q = {"question": this.newQuestion}
  //   console.log(q)
  //   return this.http.post<T>(
  //     'http://127.0.0.1:5000/answer',
  //     JSON.stringify(q),
  //     {headers: this.headers}
  //   )
  // }

  getAnswer() {
    this.http.post('/api/answer', { "question": this.newQuestion }).subscribe((data: any) => {
      this.newQuestion = '';
      console.log(data)
    });
  }

  ngOnInit() {
    interval(1000).subscribe(() => {
      this.http.get('/api/history').subscribe((data: any) => {
        this.messages = data;
      });
    });
  }

}
 
