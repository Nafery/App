import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.page.html',
  styleUrls: ['./recuperar.page.scss'],
})
export class RecuperarPage implements OnInit {
  user = '';

  constructor(private router: Router) { 
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {
      user: '';
      password: '';
  };
  this.user = state.user;
  }

  ngOnInit() {
  }

  recuperar() {
    alert('Se ha enviado un correo a ' + this.user + ' con las instrucciones para recuperar su contraseña ');
    this.router.navigate(['/home']);
  }
}
