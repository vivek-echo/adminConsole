import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AlertHelper } from '../helpers/alert-helper';
import { LoginService } from '../../services/login.service';

interface Button {
  btn_id: number;
  btn_name: string;
  btn_path: string;
  btn_class: string;
  btn_radio: string;
}

interface Tab {
  tab_id: number;
  tab_name: string;
  tab_path: string;
  tab_class: string;
  tab_radio: string;
  tab_buttons: Button[];
}

interface ChildLink {
  pl_id: number;
  pl_name: string;
  pl_path: string;
  pl_class: string;
  pl_radio: string;
  pl_tab: Tab[];
}

interface ParentLink {
  gl_id: number;
  gl_name: string;
  gl_path: string;
  gl_class: string;
  gl_radio: string;
  pl_links: ChildLink[];
}

export const roleGuardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const alertHelper = inject(AlertHelper);
  const auth = inject(LoginService);
  const sessionNavigationData = sessionStorage.getItem('userMenus');

  if (!sessionNavigationData) {
    alertHelper
      .viewAlert(
        'warning',
        'UNAUTHORIZED',
        'You are unauthorized to access this page!'
      )
      .then((res: any) => {
        if (res) {
          const targetRoute = auth.isAuthenticated()
            ? '/console/dashboard'
            : '/website/home';
          router.navigate([targetRoute]);
        }
      });
    return false;
  }

  let roleMenu: ParentLink[];
  try {
    roleMenu = JSON.parse(sessionNavigationData);
  } catch (error) {
    alertHelper
      .viewAlert(
        'warning',
        'UNAUTHORIZED',
        'You are unauthorized to access this page!'
      )
      .then((res: any) => {
        if (res) {
          const targetRoute = auth.isAuthenticated()
            ? '/console/dashboard'
            : '/website/home';
          router.navigate([targetRoute]);
        }
      });
    return false;
  }

  // Extract paths function
  const extractPaths = (menuData: ParentLink[]): string[] => {
    const paths: string[] = [];
    const traverse = (item: any): void => {
      if (item.gl_path) paths.push(item.gl_path);
      if (item.pl_path) paths.push(item.pl_path);
      if (item.tab_path) paths.push(item.tab_path);
      if (item.btn_path) paths.push(item.btn_path);

      // Recursively traverse pl_links, pl_tab, and tab_buttons
      if (item.pl_links) {
        item.pl_links.forEach(traverse);
      }
      if (item.pl_tab) {
        item.pl_tab.forEach(traverse);
      }
      if (item.tab_buttons) {
        item.tab_buttons.forEach(traverse);
      }
    };

    menuData.forEach(traverse);
    return paths;
  };

  // Extract all user permissions
  const userPermissions = extractPaths(roleMenu);
  // Check if the current URL is in the user's permissions
  const currentUrl = state.url;
  const hasPermission = userPermissions.includes(currentUrl);

  if (!hasPermission) {
    alertHelper
      .viewAlert(
        'warning',
        'UNAUTHORIZED',
        'You are unauthorized to access this page!'
      )
      .then((res: any) => {
        if (res) {
          router.navigate(['/console/dashboard']);
        }
      });
    return false;
  }

  return true;
};
