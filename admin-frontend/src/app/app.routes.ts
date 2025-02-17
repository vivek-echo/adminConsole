import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { authGuard } from './core/guards/auth.guard';
export const routes: Routes = [
  {
    path: '',
    redirectTo: "website",
    pathMatch: 'full'
  },
  {
    path: 'website',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'console',
    loadChildren: () =>
      import('./application/application.routes').then((m) => m.ApplicationRoutes),
    canActivate: [authGuard]
  }

];
