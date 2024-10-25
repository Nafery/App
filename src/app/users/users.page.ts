import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthenticatorService } from '../services/authenticator.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {

  private apiUrl = 'http://127.0.0.1:8000/api/users/';
  users: any[] = [];
  allowedUsers: string[] = ['naferyh', 'bupsidu', 'laffy'];
  selectedUser: any = null;

  constructor(private http: HttpClient, private router: Router, private auth: AuthenticatorService) { }

  ngOnInit() {
    const currentUser = this.auth.getCurrentUser();
    if (currentUser && this.allowedUsers.includes(currentUser)) {
      this.getUsers().subscribe(data => {
        this.users = data;
      });
    } else {
      this.router.navigate(['/perfil']);
    }
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  selectUser(user: any) {
    this.selectedUser = { ...user };
  }

  updateUser() {
    if (this.selectedUser) {
      this.auth.updateUser(this.selectedUser).subscribe(() => {
        this.getUsers().subscribe(data => {
          this.users = data;
          this.selectedUser = null;
        });
      });
    }
  }

  deleteUser(userId: number) {
    this.auth.deleteUser(userId).subscribe(() => {
      this.getUsers().subscribe(data => {
        this.users = data;
      });
    });
  }

  goBack() {
    this.router.navigate(['/perfil']);
  }

}
