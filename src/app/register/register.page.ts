import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  
  user = {
    email: '',
    username: '',
    password: '',
    password2: '',
    name: '',
    lastname: '',
  };

  mensaje = '';
  
  constructor(private router: Router) {}

  login() {
    if (this.user.email.length != 0) {
      if (this.user.name.length != 0) {
        if (this.user.lastname.length != 0) {
          if (this.user.username.length != 0) {
            if (this.user.password.length != 0) {
              if (this.user.password2.length != 0) {
                if (this.user.password2 == this.user.password) {
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
                  this.mensaje = 'Las contraseñas no coinciden';
                }
              } else {
                this.mensaje = 'Ingrese su contraseña nuevamente';
              }
            } else {
              this.mensaje = 'Ingrese su contraseña';
            }
          } else {
            this.mensaje = 'Ingrese su usuario';
          } 
        } else {
          this.mensaje = 'Ingrese su apellido';
        }
      } else {
        this.mensaje = 'Ingrese su nombre';
      }
    } else {
      this.mensaje = 'Ingrese su correo electrónico';
    }
  }

  ngOnInit() {
  }

}
