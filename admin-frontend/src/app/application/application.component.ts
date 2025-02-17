import { BreakpointObserver, MediaMatcher } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';
import { NavItem } from './layout/sidebar/nav-item/nav-item';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { AppNavItemComponent } from './layout/sidebar/nav-item/nav-item.component';
import { SideBarData } from './layout/sidebar/sidebar-data';
import { NavService } from './services/nav.service';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material.module';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { HeaderComponent } from './layout/header/header.component';

const MOBILE_VIEW = 'screen and (max-width: 768px)';
const TABLET_VIEW = 'screen and (min-width: 769px) and (max-width: 1024px)';
const MONITOR_VIEW = 'screen and (min-width: 1024px)';
const BELOWMONITOR = 'screen and (max-width: 1023px)';

@Component({
  selector: 'app-application',
  standalone: true,
  imports: [CommonModule,RouterModule,MaterialModule,SidebarComponent,NgScrollbarModule,HeaderComponent,AppNavItemComponent],
  templateUrl: './application.component.html',
  styleUrl: './application.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ApplicationComponent implements OnInit {

  navItems = SideBarData;

  @ViewChild('leftsidenav')
  public sidenav: MatSidenav | any;

  //get options from service
  private layoutChangesSubscription = Subscription.EMPTY;
  private isMobileScreen = false;
  private isContentWidthFixed = true;
  private isCollapsedWidthFixed = false;
  private htmlElement!: HTMLHtmlElement;

  get isOver(): boolean {
    return this.isMobileScreen;
  }

  constructor(private breakpointObserver: BreakpointObserver, private navService: NavService) {
    
    this.htmlElement = document.querySelector('html')!;
    this.htmlElement.classList.add('light-theme');
    this.layoutChangesSubscription = this.breakpointObserver
      .observe([MOBILE_VIEW, TABLET_VIEW, MONITOR_VIEW])
      .subscribe((state) => {
        // SidenavOpened must be reset true when layout changes

        this.isMobileScreen = state.breakpoints[MOBILE_VIEW];

        this.isContentWidthFixed = state.breakpoints[MONITOR_VIEW];
      });
  }

  ngOnInit(): void {
    if(this.isMobileScreen){
    }
  }

  ngOnDestroy() {
    this.layoutChangesSubscription.unsubscribe();
  }

  toggleCollapsed() {
    this.isContentWidthFixed = false;
  }

  onSidenavClosedStart() {
    this.isContentWidthFixed = false;
  }

  onSidenavOpenedChange(isOpened: boolean) {
    const pageWrapper = document.querySelector('.pageWrapper')! as HTMLElement;
    if(!isOpened){
      pageWrapper.style.padding = "0px";
      pageWrapper.style.maxWidth = "1300px";
    }else{
      pageWrapper.style.padding = "10px";
      pageWrapper.style.maxWidth = "1200px";
    }
    this.isCollapsedWidthFixed = !this.isOver;
  }
}
