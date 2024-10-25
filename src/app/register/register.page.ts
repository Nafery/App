import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AuthenticatorService } from '../services/authenticator.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  
  connectionStatus: boolean = false;
  currentUser: string | null = null;

  user = {
    email: '',
    username: '',
    password: '',
    password2: '',
    name: '',
    lastname: '',
  };

  mensaje = '';
  
  constructor(private auth: AuthenticatorService, private router: Router) {}

  registrar() {
    if (this.user.username.length != 0 && this.user.password.length != 0 && this.user.password === this.user.password2) {
      // Crear un nuevo objeto con solo los campos necesarios para la API
      const userToRegister = {
        username: this.user.username,
        name: this.user.name,
        lastname: this.user.lastname,
        email: this.user.email,
        password: this.user.password,
      };

      this.auth.register(userToRegister).subscribe(
        data => {
          if (data.success) {
            this.mensaje = 'Registro exitoso';
            this.router.navigate(['/home']);
          } else {
            this.mensaje = 'Error al registrar el usuario';
          }
        },
        error => {
          this.mensaje = 'Error al conectar con la API';
        }
      );
    } else {
      this.mensaje = 'Ingrese todos los campos y asegúrese de que las contraseñas coincidan';
    }
  }


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
