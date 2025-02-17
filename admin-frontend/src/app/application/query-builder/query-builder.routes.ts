import { Routes } from '@angular/router';
import { roleGuardGuard } from '../../core/guards/role-guard.guard';
import { QueryBuilderComponent } from './query-builder.component';
import { DataQueryBuilderComponent } from './data-query-builder/data-query-builder.component';
import { ReportQueryBuilderComponent } from './report-query-builder/report-query-builder.component';

let firstTabPathCache: { [key: string]: string | undefined } = {};

// export function getFirstTabPath(glpath: string, plpath: string): string | undefined { 
//     const cacheKey = `${glpath}-${plpath}`;
//     if (firstTabPathCache[cacheKey]) return firstTabPathCache[cacheKey];
//     const privilegeNavigationData = sessionStorage.getItem('userMenus');
//     if (privilegeNavigationData) {
//         const sessionNavigationData = JSON.parse(privilegeNavigationData);
//         const mainGlobalLink = sessionNavigationData.find(
//             (item: any) => item.gl_path === glpath
//         );
//         const tabLink = mainGlobalLink?.pl_links.find(
//             (link: any) => link.pl_path === plpath
//         );
//         firstTabPathCache[cacheKey] =
//             tabLink?.pl_tab?.[0]?.tab_path.split('/').pop() || '';
//     }
//     return firstTabPathCache[cacheKey];
// }

export const QueryBuilderRoutes: Routes = [
    {
        path: "",
        component: QueryBuilderComponent,
        children: [
            {
                path: 'dataQuery',
                component: DataQueryBuilderComponent,
                canActivate: [roleGuardGuard]

            },
            {
                path: 'reportQuery',
                component: ReportQueryBuilderComponent,
                canActivate: [roleGuardGuard]
            },

        ],
    },
];