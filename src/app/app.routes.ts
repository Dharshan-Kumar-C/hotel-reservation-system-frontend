import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Index } from './pages/index/index';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { Login } from './pages/login/login';
import { AdminLogin } from './pages/admin-login/admin-login';
import { GuestLogin } from './pages/guest-login/guest-login';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { GuestDashboard } from './pages/guest-dashboard/guest-dashboard';
import { Guests } from './pages/guests/guests';
import { Rooms } from './pages/rooms/rooms';
import { Reservations } from './pages/reservations/reservations';
import { Payments } from './pages/payments/payments';
import { Profile } from './pages/profile/profile';
import { ReservationForm } from './pages/reservation-form/reservation-form';
import { ReservationGuest } from './pages/reservation-guest/reservation-guest';
import { PaymentForm } from './pages/payment-form/payment-form';
import { PaymentGuest } from './pages/payment-guest/payment-guest';

export const routes: Routes = [
  { path: '', component: Index },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: 'login', component: Login },
  { path: 'admin-login', component: AdminLogin },
  { path: 'guest-login', component: GuestLogin },
  { path: 'admin-dashboard', component: AdminDashboard },
  { path: 'guest-dashboard', component: GuestDashboard },
  { path: 'guests', component: Guests },
  { path: 'rooms', component: Rooms },
  { path: 'reservations', component: Reservations },
  { path: 'payments', component: Payments },
  { path: 'profile', component: Profile },
  { path: 'reservation-form', component: ReservationForm },
  { path: 'reservation-guest', component: ReservationGuest },
  { path: 'payment-form', component: PaymentForm },
  { path: 'payment-guest', component: PaymentGuest },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }