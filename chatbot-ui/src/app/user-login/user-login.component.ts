import { Component, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent {
  private url = environment.apiUrl;
  signupFormGroup: FormGroup;
  loginFormGroup: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  inprogress = false;
  public fname = '';
  public lname = '';
  passwordmatcherror = false;
  constructor(private http: HttpClient, private router: Router, private fb: FormBuilder, private _snackBar: MatSnackBar) {
    this.signupFormGroup = this.fb.group({
      fname: new FormControl('', [Validators.required]),
      lname: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password1: new FormControl('', [Validators.required, Validators.minLength(8)]),
      password2: new FormControl('', [Validators.required]),
    }, { validator: this.matchPasswordsValidator, });
    this.loginFormGroup = this.fb.group({
      loginemail: new FormControl('', [Validators.required, Validators.email]),
      loginpassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
    }, {});


  }

  callLoginApi = (): Observable<any> => {
    const data = { "email": this.loginFormGroup.get('loginemail')?.value, "password": this.loginFormGroup.get('loginpassword')?.value };
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.url}/api/login`, data, { headers });
  }

  callSignupApi = (): Observable<any> => {
    const data = { "fname": this.signupFormGroup.get('fname')?.value, "lname": this.signupFormGroup.get('lname')?.value, "email": this.signupFormGroup.get('email')?.value, "password": this.signupFormGroup.get('password1')?.value };
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.url}/api/signup`, data, { headers });
  }

  userLogin = () => {
    this.inprogress = true;
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
          console.error(n.reason);
          this.openSnackBar(n.reason, "Try again")
        }
        this.inprogress = false;
      },
    )
  }

  userSignup = () => {
    this.inprogress = true;
    this.callSignupApi().subscribe(
      x => {
        console.log(x);
        if (x.success == true) {
          this.openSnackBar("Signup Successful, Continue to Login", "Okay");
        }
        else {
          this.openSnackBar(x.message, "Okay");

        }
        this.inprogress = false;
      },
    )
  }
  getErrorMessage() {
    if (this.signupFormGroup.get('loginemail')?.hasError('required')) {
      return 'Email is required';
    }

    return this.signupFormGroup.get('loginemail')?.hasError('email') ? 'Not a valid email' : '';
  }

  matchPasswordsValidator(formGroup: FormGroup) {
    const passwordControl = formGroup.get('password1');
    const confirmPasswordControl = formGroup.get('password2');
    if (confirmPasswordControl) {
      if (passwordControl) {
        if (passwordControl.value !== confirmPasswordControl.value) {
          confirmPasswordControl.setErrors({ passwordMismatch: true });
        } else {
          confirmPasswordControl.setErrors(null);
        }
      } else {
        confirmPasswordControl.setErrors(null);
      }
    } else {
      // confirmPasswordControl.setErrors(null);
    }
  }
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, { duration: 3000 });
  }
}