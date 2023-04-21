import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public router: Router) { }
  ngOnInit() {
    var loginItem = localStorage.getItem("user_login");
    if (loginItem) {
      console.log("Chat2")
      this.router.navigate(['chat']);
    }
    else {
      console.log("Login")
      this.router.navigate(['login']);
    }
  }

}
