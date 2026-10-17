import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

/**
 * Root component: hosts the common header/nav/footer and the router outlet
 * where page components (home, search, detail, register) are rendered.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'GreatLove Events';
}
