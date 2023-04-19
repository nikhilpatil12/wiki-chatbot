import { Component, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent {

  private url = environment.apiUrl;
  public fname = '';
  public lname = '';
  public email = '';
  public password1 = '';
  public password2 = '';
  public loginpassword = '';
  public loginemail = '';
  constructor(private http: HttpClient) { }
  login = () => {
    const data = { "email": this.loginpassword, "password": this.loginemail };
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.url}/login`, data, { headers });
  }
  signup = () => {
    const data = { "fname": this.fname, "lname": this.lname, "email": this.password1, "password": this.email };
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.url}/signup`, data, { headers });
  }
}
