import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, Event, RouterModule } from '@angular/router';
import { TabNavigationServiceService } from '../../../core/services/tab-navigation-service.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-view-error-logs',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule],
  templateUrl: './view-error-logs.component.html',
  styleUrl: './view-error-logs.component.scss'
})
export class ViewErrorLogsComponent implements OnInit, OnDestroy {
  tabMenuData: any[] = [];
  breadCrumData: { globalMenu?: string; primaryMenu?: string } = {}; // Initialize breadCrumData
  primaryMenuData: any;
  globalMenuData: any;
  currentUrl: string;
  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private tabNavigationServiceService: TabNavigationServiceService
  ) {
    // Load global, tab, and primary menu data for specific paths
    this.globalMenuData = this.tabNavigationServiceService.getGlobalMenuData("/console/monitorSite");
    this.tabMenuData = this.tabNavigationServiceService.getTabLinks("/console/monitorSite/errorLogs") || [];
    this.primaryMenuData = this.tabNavigationServiceService.getPrimaryLinks("/console/monitorSite/errorLogs");
    this.currentUrl = this.router.url;

    // Initialize breadcrumb data
    this.breadCrumData.globalMenu = this.globalMenuData.gl_name;
    this.breadCrumData.primaryMenu = this.primaryMenuData.pl_name;
  }

  ngOnInit(): void {
    // Subscribe to router events to track the current URL on navigation changes
    this.routerSubscription = this.router.events
      .pipe(
        filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd) // Filter to NavigationEnd events only
      )
      .subscribe((event: NavigationEnd) => {
        this.currentUrl = event.urlAfterRedirects;
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from the router events on component destroy to prevent memory leaks
    this.routerSubscription?.unsubscribe();
  }
}
