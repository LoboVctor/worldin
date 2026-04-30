import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Home } from './home/home';
import { Intercambio } from './intercambio/intercambio';
import { Profile } from './profile/profile';
import { Onboarding } from './onboarding/onboarding';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'onboarding', component: Onboarding },
  { path: 'home', component: Home },
  { path: 'intercambio/:id', component: Intercambio },
  { path: 'intercambio-novo', component: Intercambio },
  { path: 'profile', component: Profile },
];
