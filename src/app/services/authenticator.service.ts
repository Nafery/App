import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatorService {

  connectionStatus: boolean = false;
  currentUser: string | null = null;
  constructor() { }

  login(user: string, password: string): boolean {
    if(user == "Naferyh" && password == "wenalosk") {
      this.connectionStatus = true;
      this.currentUser = user;
      return true;
    } else if (user == "bubu" && password == "naxotonto") {
      this.connectionStatus = true;
      this.currentUser = user;
      return true;
    } else if (user == "Laffy" && password == "nose") {
      this.connectionStatus = true;
      this.currentUser = user;
      return true;
    }
    else {
      alert("Usuario o contraseña incorrectos");
    }
    
    this.connectionStatus = false;
    this.currentUser = null;
    return false;
  }

  logout() {
    this.connectionStatus = false;
  }

  isConected() {
    return this.connectionStatus;
  }

  getCurrentUser(): string | null {
    return this.currentUser;
  }
}
