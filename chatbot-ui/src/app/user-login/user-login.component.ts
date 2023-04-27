import { Component, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

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
  constructor(private http: HttpClient, private router: Router) { }

  callLoginApi = (): Observable<any> => {
    const data = { "email": this.loginemail, "password": this.loginpassword };
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.url}/api/login`, data, { headers });
  }

  callSignupApi = (): Observable<any> => {
    const data = { "fname": this.fname, "lname": this.lname, "email": this.email, "password": this.password1 };
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.url}/api/signup`, data, { headers });
  }

  userLogin = () => {
    console.log("Calling login API")
    this.callLoginApi().subscribe(
      n => {
        // console.log(n);
        if (n.error)
          console.error(n.error);
        if (n.success) {
          localStorage.setItem("user_login", n.user);
          this.router.navigate(['/chat'])
        } else {
          localStorage.setItem("user_login", '');
          console.error(n.message);
        }
      },
    )
  }

  userSignup = () => {
    this.callSignupApi().subscribe(
      x => console.log(x),
    )
  }
}
//TODO: Add login error snackbar
//TODO: Add signup error snackbar
//TODO: Add login successful snackbar and spinner 
//TODO: Add signup successful snackbar and spinner 