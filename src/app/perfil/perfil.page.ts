import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticatorService } from '../services/authenticator.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {

  user = '';
  userImage: string = 'assets/LogoDef.JPG';
  allowedUsers: string[] = ['naferyh', 'bupsidu', 'laffy'];
  canViewUsers: boolean = false;

  constructor(private router: Router, private auth: AuthenticatorService) { 
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {
      user: '';
      password: '';
    };
  this.user = state.user;
  }

  ngOnInit() {
    const currentUser = this.auth.getCurrentUser();
    if (currentUser) {
      this.user = currentUser;
      this.canViewUsers = this.allowedUsers.includes(currentUser);
      if (currentUser === "naferyh") {
        this.userImage = 'assets/Naferyh.jpg';
      } else if (currentUser === "bubu") {
        this.userImage = 'assets/bubu.png';
      } else if (currentUser === "Laffy") {
        this.userImage = 'assets/Laffy.png';
      } else {
        this.userImage = 'assets/images/default.png';
      }
    } else {
      this.router.navigate(['/home']);
    }
  }

  logout() {
    this.auth.logout()
    this.router.navigate(['/home']);
  }

  users() {
    this.router.navigate(['/users']);
  }

  map() {
    this.router.navigate(['/map']);
  }

}
