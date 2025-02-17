import { Component } from '@angular/core';
import { NgxSpinnerModule } from 'ngx-spinner';
@Component({
  selector: 'app-load-screen',
  standalone: true,
  imports: [NgxSpinnerModule],
  templateUrl: './load-screen.component.html',
  styleUrl: './load-screen.component.scss'
})
export class LoadScreenComponent {

}
