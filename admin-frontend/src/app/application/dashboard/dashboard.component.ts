import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { DashboardService } from './services/dashboard.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MaterialModule,CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent implements OnInit {

  constructor( 
    private spinner : NgxSpinnerService,
    private dashboardService:DashboardService
  ){

  }
  ngOnInit(): void {
    this.dashboardService.getDashbaoardData().subscribe({
      next:(res:any)=>{

      },
      error:(error:any)=>{

      }
    })
  }

}
