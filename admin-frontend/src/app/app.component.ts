import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadScreenComponent } from './core/components/load-screen/load-screen.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,LoadScreenComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'front-end';
}
