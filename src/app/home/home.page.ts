import { Component } from '@angular/core';
import { AnimationController} from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';

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

  constructor(private router: Router) {}

  login() {
    if (this.user.username.length != 0) {
      if (this.user.password.length != 0) {
        let navigationExtras: NavigationExtras = {

          state: {
            user: this.user.username,
            password: this.user.password,
          },

        };
        setTimeout(() => {

          this.router.navigate(['/perfil'], navigationExtras);

        }, 2000);
      } else {
        this.mensaje = 'Ingrese su contraseña';
      }
    }
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
