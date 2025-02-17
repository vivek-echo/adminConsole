import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  constructor(){
  }
  ngOnInit(): void {
    this.clearStorage();
   
  }

  clearStorage() {
    sessionStorage.clear();
    localStorage.clear();
  }
}
