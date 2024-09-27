import { Component } from '@angular/core';
import { AnimationController} from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { AuthenticatorService } from '../services/authenticator.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  user = {
    username: '',
    password: '',
  };

  mensaje = '';
  isLoading = false;
  images = [
    './assets/gato1.png',
    './assets/gato2.png'
  ]
  currentImageIndex = 0;
  imageChangeInterval: any;

  constructor(private router: Router, private auth: AuthenticatorService) {}

  async login() {
    if (this.user.password.length != 0) {
      if (this.auth.login(this.user.username, this.user.password)) {
        this.isLoading = true;
        this.startImageChange();

        let navigationExtras: NavigationExtras = {
          
          state: {
            user: this.user.username,
            password: this.user.password,
          },
          
        };
        setTimeout(() => {
          this.isLoading = false;
          this.stopImageChange();
          this.router.navigate(['/perfil'], navigationExtras);
        }, 3000);
      }
    } else {
      this.mensaje = 'Ingrese su contraseña';
    } 
  }

  startImageChange() {
    this.imageChangeInterval = setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    }, 400);
  }

  stopImageChange() {
    clearInterval(this.imageChangeInterval);
  }

  register() {
    this.router.navigate(['/register']);
  }

  recuperar() {
    let navigationExtras: NavigationExtras = {
      state: {
        user: this.user.username,
      },
    };
    this.router.navigate(['/recuperar'], navigationExtras);
  }

}
