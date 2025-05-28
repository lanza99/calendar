import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { response } from 'express';


@Injectable({
  providedIn: 'root'
})

export class LoginService {

  constructor(private http: HttpClient, private router: Router) { 

  }

  url='http://localhost:4316/login'

  async loginRequest(email: string, password: string) {
    this.http.post(this.url, {email, password}).subscribe((res: any) =>{
      if(res){
        localStorage.setItem("loginToken", res.token);
        localStorage.setItem("username", res.email);
        if(localStorage.getItem("loginToken")!='undefined'){
          this.router.navigateByUrl('');
        }
        else{
          console.log("Login failed.")
          /* GESTIRE LA UI AL LOGIN FALLITO */
        }
        
      }
      else{
        alert(res.message);
      }
    })

  }
}
