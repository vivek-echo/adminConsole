import { Routes } from '@angular/router';
import { ApplicationComponent } from './application.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const ApplicationRoutes: Routes = [
    {
        path: '',
        component: ApplicationComponent,
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full',
            },
            {
                path: 'dashboard',
                component: DashboardComponent,
            },
            {
                path: 'manageLink',
                loadChildren: () =>
                    import('./manage-link/manage-link.routes').then(
                        (m) => m.ManageLinkRoutes
                    ),
            },
            {
                path: 'queryBuilder',
                loadChildren: () =>
                    import('./query-builder/query-builder.routes').then(
                        (m) => m.QueryBuilderRoutes
                    ),
            },
            {
                path: 'monitorSite',
                loadChildren: () =>
                    import('./monitor-site/monitor-site.routes').then(
                        (m) => m.MonitorSiteRoutes
                    ),
            }
        ],
    },
];