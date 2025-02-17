import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
  OnInit,
} from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatButtonModule } from '@angular/material/button';
import { LoginService } from '../../../services/login.service';
import { AlertHelper } from '../../../core/helpers/alert-helper';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, NgScrollbarModule, MaterialModule, MatButtonModule],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None,
})

export class HeaderComponent implements OnInit {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();
  userProfile: any;
  constructor(
    private loginService: LoginService,
    private alertHelper: AlertHelper
  ) { }
  ngOnInit(): void {
    const getUserProfile = sessionStorage.getItem('userProfile')
    if (getUserProfile) {
      this.userProfile = JSON.parse(getUserProfile);
    }
  }

  logout() {
    this.alertHelper.submitAlert(`Are you sure to logout?`, "", "Yes", "No").then((result: any) => {
      if (result.value) {
        this.loginService.logout();
      }
    });
  }
}
