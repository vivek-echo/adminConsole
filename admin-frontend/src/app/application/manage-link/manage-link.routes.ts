import { Routes } from '@angular/router';
import { roleGuardGuard } from '../../core/guards/role-guard.guard';
import { ManageLinkComponent } from './manage-link.component';
import { ManageMenuLinkComponent } from './manage-menu-link/manage-menu-link.component';
import { ManageMenuLinkAddComponent } from './manage-menu-link/manage-menu-link-add/manage-menu-link-add.component';
import { ManageMenuLinkViewComponent } from './manage-menu-link/manage-menu-link-view/manage-menu-link-view.component';
import { ManageMenuPermissionComponent } from './manage-menu-permission/manage-menu-permission.component';
import { ManageMenuPermissionAddComponent } from './manage-menu-permission/manage-menu-permission-add/manage-menu-permission-add.component';
import { ManageMenuPermissionViewComponent } from './manage-menu-permission/manage-menu-permission-view/manage-menu-permission-view.component';
import { ManageMenuPermissionSerializationComponent } from './manage-menu-permission/manage-menu-permission-serialization/manage-menu-permission-serialization.component';
// utils/navigation-utils.ts
let firstTabPathCache: { [key: string]: string | undefined } = {};

export function getFirstTabPath(glpath: string, plpath: string): string | undefined {
  const cacheKey = `${glpath}-${plpath}`;
  if (firstTabPathCache[cacheKey]) return firstTabPathCache[cacheKey];
  const privilegeNavigationData = sessionStorage.getItem('userMenus');
  if (privilegeNavigationData) {
    const sessionNavigationData = JSON.parse(privilegeNavigationData);
    const mainGlobalLink = sessionNavigationData.find(
      (item: any) => item.gl_path === glpath
    );
    const tabLink = mainGlobalLink?.pl_links.find(
      (link: any) => link.pl_path === plpath
    );
    firstTabPathCache[cacheKey] =
      tabLink?.pl_tab?.[0]?.tab_path.split('/').pop() || '';
  }
  return firstTabPathCache[cacheKey];
}

export const ManageLinkRoutes: Routes = [
  {
    path: "",
    component: ManageLinkComponent,
    children: [
      {
        path: 'manageMenuLink',
        component: ManageMenuLinkComponent,
        children: [
          {
            path: '',
            redirectTo:
              getFirstTabPath(
                '/console/manageLink',
                '/console/manageLink/manageMenuLink'
              ) || '',
            pathMatch: 'full',
          },
          {
            path: 'add',
            component: ManageMenuLinkAddComponent,
            canActivate: [roleGuardGuard],
          },
          {
            path: 'view',
            component: ManageMenuLinkViewComponent,
            canActivate: [roleGuardGuard],
          },
        ],
      },
      {
        path: 'manageLinkPermission',
        component: ManageMenuPermissionComponent,
        children: [
          {
            path: '',
            redirectTo:
              getFirstTabPath(
                '/console/manageLink',
                '/console/manageLink/manageLinkPermission'
              ) || '',
            pathMatch: 'full',
          },
          {
            path: 'add',
            component: ManageMenuPermissionAddComponent,
            canActivate: [roleGuardGuard],
          },
          {
            path: 'view',
            component: ManageMenuPermissionViewComponent,
            canActivate: [roleGuardGuard],
          },
          {
            path: 'serialization',
            component: ManageMenuPermissionSerializationComponent,
            canActivate: [roleGuardGuard],
          },
        ],
      },

    ],
  },
];