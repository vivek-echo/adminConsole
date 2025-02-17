import {
  Component,
  Input,
  OnChanges,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { NavItem } from './nav-item';
import { Router } from '@angular/router';
import { NavService } from '../../../services/nav.service';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../../../material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-item',
  standalone: true,
  imports: [TranslateModule, MaterialModule, CommonModule],
  templateUrl: './nav-item.component.html',
  styleUrls: [],
})
export class AppNavItemComponent implements OnChanges, OnInit {
  
  @Output() toggleMobileLink: any = new EventEmitter<void>();
  @Output() notify: EventEmitter<boolean> = new EventEmitter<boolean>();
  expandedItems: Set<NavItem> = new Set();
  //@HostBinding('attr.aria-expanded') ariaExpanded = this.expanded;
  @Input() item: NavItem | any;
  @Input() depth: any;
  constructor(public navService: NavService, public router: Router) {

    if (this.depth === undefined) {
      this.depth = 0;
    }
  }
  ngOnInit(): void {
    // Expand the parent if the current route matches any child
    this.navService.currentUrl.subscribe((url: string) => {
      if (this.item && this.item.children) {
        this.item.children.forEach((child: NavItem) => {
          if (this.isRouteActive(child.route)) {
            this.expandedItems.add(this.item); // Keep the parent expanded
          }
        });
      }
    });
  }

  isRouteActive(route: string | undefined): boolean {
    if (!route) {
      return false;
    }
    return this.router.isActive(route, {
      paths: 'subset',
      matrixParams: 'ignored',
      queryParams: 'ignored',
      fragment: 'ignored',
    });
  }

  ngOnChanges() {
    this.navService.currentUrl.subscribe((url: string) => { });
  }

  onItemSelected(item: NavItem) {
    // Navigate to the selected route
    this.router.navigate([item.route]);

    // Scroll to the top of the page
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
    // Collapse all parents when a child is selected
    this.expandedItems.clear();
  }


  onSubItemSelected(item: NavItem) {

  }

  toggleExpand(event: MouseEvent, item: NavItem) {
    event.stopPropagation(); // Prevent parent click
    if (this.expandedItems.has(item)) {
      this.expandedItems.delete(item);
    } else {
      this.expandedItems.add(item);
    }
  }

 

}
