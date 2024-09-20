import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CheckOutComponent } from './check-out/check-out.component';

const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'check-out', component: CheckOutComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
