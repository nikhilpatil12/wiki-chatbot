import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { interval } from 'rxjs';
import { Chat } from './chat';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  messages: Chat[] = [];
  newQuestion: string | undefined;
  extractedData: string = '';
  constructor(protected http: HttpClient) {}
  title = 'chatbot-ui';
  showFiller = true;

  // url = 'http://127.0.0.1:8000/answer';

  headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  // getAnswer<T>(): Observable<T> {
  //   var q = {"question": this.newQuestion}
  //   console.log(q)
  //   return this.http.post<T>(
  //     'http://127.0.0.1:8000/answer',
  //     JSON.stringify(q),
  //     {headers: this.headers}
  //   )
  // }

  getAnswer() {
    const that = this;
    this.extractedData = ''
    // this.http.post('http://127.0.0.1:8000/api/answer', { "question": this.newQuestion }, { responseType: 'text', observe: 'response' })
    // // .pipe(tap(chunk => {
    // //   console.log(chunk)
    // // }))
    // // .subscribe(data => {
      
    // //   this.extractedData += data;
    // //   console.log(data)
    // // });
    // .subscribe({
    //   next: chunk => {
    //     this.extractedData += chunk;
    //     console.log(chunk)
    //   },
    //   error: error => console.error(error),
    //   complete: () => console.log('Stream completed')
    // })
    const req = new XMLHttpRequest();
    req.open('POST', '/api/answer');
    req.setRequestHeader('Content-Type', 'application/json');
    req.responseType = 'text';
    const data = { "question": this.newQuestion };
    req.onreadystatechange = function() {
      if (this.status === 200) {
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
    interval(1000).subscribe(() => {
      this.http.get('/api/history').subscribe((data: any) => {
        this.messages = data;
      });
    });
  }

}
 
