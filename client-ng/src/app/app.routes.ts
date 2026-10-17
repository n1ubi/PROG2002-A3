import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { SearchComponent } from './components/search/search';
import { EventDetailComponent } from './components/event-detail/event-detail';
import { RegisterComponent } from './components/register/register';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'event/:id', component: EventDetailComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: '' }
];
