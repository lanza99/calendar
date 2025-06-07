import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterModule],
  template: `<main><router-outlet></router-outlet></main>`
})
export class AppComponent { }







/*import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterModule],
  template: `
    <!-- Contenitore principale dell'app con router outlet -->
    <router-outlet></router-outlet>
  `
})
export class AppComponent {}



export class AppComponent {
  title = 'progettoUI';

   constructor(private http: HttpClient) { }

  userValue: string = '';
  pswValue: string = '';

  sendLoginData() {
    //console.log('Valore user:', this.userValue, "Valore psw: ", this.pswValue);
    const body = {username: this.userValue, password: this.pswValue};

    $.ajax({
      url: 'https://esempio.com/api/dati',
      dataType: 'json',
      success: function(data) {
        console.log(data);
      },
      error: function() {
        console.log('Errore nella richiesta AJAX');
      }
    });

    
  } 

}
*/
