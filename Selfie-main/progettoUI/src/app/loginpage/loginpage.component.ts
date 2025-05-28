import { Component, inject, Inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { ActivatedRoute, Route } from '@angular/router';
import { LoginService } from '../login.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-loginpage',
  standalone: true,
  imports: [NavbarComponent, ReactiveFormsModule],
  templateUrl: './loginpage.component.html',
  styleUrl: './loginpage.component.css'
})

export class LoginpageComponent {
  route: ActivatedRoute = inject(ActivatedRoute);
  loginService = inject(LoginService);

  constructor() {}

  loginForm = new FormGroup({
    email:  new FormControl(''),
    password: new FormControl('')
  })


  submitLoginRequest(){
    this.loginService.loginRequest(
      this.loginForm.value.email ?? '',
      this.loginForm.value.password ?? ''
    )
  }



}
