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
    var loginItem;
    var li = localStorage.getItem("user_login");
    if (li) {
      loginItem = JSON.parse(li);
    }
    if (loginItem) {
      console.log("Chat1")
      if (loginItem.user) {
        console.log("Chat2")
        this.router.navigate(['chat']);
      }
    }
    else {
      console.log("Login")
      this.router.navigate(['login']);
    }
  }

}
