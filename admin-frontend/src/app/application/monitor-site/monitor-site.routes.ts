import { Routes } from '@angular/router';
import { roleGuardGuard } from '../../core/guards/role-guard.guard';
import { MonitorSiteComponent } from './monitor-site.component';
import { ViewErrorLogsComponent } from './view-error-logs/view-error-logs.component';
import { ViewErrorsComponent } from './view-error-logs/view-errors/view-errors.component';

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

export const MonitorSiteRoutes: Routes = [
    {
       path: "",
       component: MonitorSiteComponent,
       children: [
         {
           path: 'errorLogs',
           component: ViewErrorLogsComponent,
           children: [
             {
               path: '',
               redirectTo:
                 getFirstTabPath(
                   '/console/monitorSite',
                   '/console/monitorSite/errorLogs'
                 ) || '',
               pathMatch: 'full',
             },
             {
               path: 'viewErrorLogs',
               component: ViewErrorsComponent,
               canActivate: [roleGuardGuard],
             },
             
           ],
         },
         
   
       ],
     },
];