import { Injectable } from '@angular/core';
import { StorageService} from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatorService {

  connectionStatus: boolean = false;
  currentUser: string | null = null;
  constructor(private storage: StorageService) { }

  loginBDD(user: string, password: string): boolean {
    this.storage.get(user).then((value) => {
      if (value.password == password) {
        console.log("Usuario y contraseña correctos");
        this.connectionStatus = true;
        this.currentUser = user;
      } else {
        console.log("Contraseña incorrecta");
        this.connectionStatus
      }
    }).catch((error) => {
      console.log("Usuario no encontrado");
      this.connectionStatus = false;
    });
    if (this.connectionStatus) {
      return true;
    } else {
      return false;
    }
  }

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
