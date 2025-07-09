import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GuestAuthService } from '../../services/guest-auth.service';
import { ProfileService } from '../../services/profile.service';
import { ReservationGuestService } from '../../services/reservation-guest.service';
import { PaymentGuestService } from '../../services/payment-guest.service';

@Component({
  selector: 'app-guest-dashboard',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './guest-dashboard.html',
  styleUrl: './guest-dashboard.css'
})
export class GuestDashboard implements OnInit {
  guestName: string = 'Guest';
  totalReservations = 0;
  totalRooms = 0;
  totalPayments = 0;
  loading = false;

  constructor(
    private guestAuthService: GuestAuthService,
    private profileService: ProfileService,
    private router: Router,
    private reservationGuestService: ReservationGuestService,
    private paymentGuestService: PaymentGuestService
  ) {}

  ngOnInit() {
    this.profileService.getCurrentGuestName().subscribe(name => {
      this.guestName = name;
    });
    this.loadGuestDashboardData();
  }

  loadGuestDashboardData() {
    this.loading = true;
    
    // Load guest's reservations
    this.reservationGuestService.getByCurrentGuest().subscribe({
      next: (reservations) => {
        this.totalReservations = reservations.length;
        
        // Count unique rooms (same room booked multiple times counts as 1)
        const uniqueRooms = new Set();
        reservations.forEach(reservation => {
          if (reservation.room?.roomNumber) {
            uniqueRooms.add(reservation.room.roomNumber);
          }
        });
        this.totalRooms = uniqueRooms.size;
        
        this.checkAllDataLoaded();
      },
      error: () => {
        this.totalReservations = 0;
        this.totalRooms = 0;
        this.checkAllDataLoaded();
      }
    });

    // Load guest's payments using PaymentGuestService
    this.paymentGuestService.getByCurrentGuest().subscribe({
      next: (payments) => {
        // Calculate total amount from paid payments
        const totalAmount = payments
          .filter(payment => payment.paymentStatus === 'Paid')
          .reduce((sum, payment) => sum + payment.amountPaid, 0);
        this.totalPayments = totalAmount;
        this.checkAllDataLoaded();
      },
      error: () => {
        this.totalPayments = 0;
        this.checkAllDataLoaded();
      }
    });
  }



  private checkAllDataLoaded() {
    setTimeout(() => {
      this.loading = false;
    }, 500);
  }

  logout() {
    this.guestAuthService.logout();
    this.router.navigate(['/login']);
  }
}
