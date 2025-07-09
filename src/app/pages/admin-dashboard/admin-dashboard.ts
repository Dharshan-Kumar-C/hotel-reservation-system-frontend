import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { GuestService } from '../../services/guest.service';
import { RoomService } from '../../services/room.service';
import { ReservationService } from '../../services/reservation.service';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [ RouterLink, CommonModule ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  totalGuests = 0;
  totalRooms = 0;
  totalReservations = 0;
  totalPayments = 0;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private guestService: GuestService,
    private roomService: RoomService,
    private reservationService: ReservationService,
    private paymentService: PaymentService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    
    // Load total guests
    this.guestService.getAll().subscribe({
      next: (guests) => {
        this.totalGuests = guests.length;
        this.checkAllDataLoaded();
      },
      error: () => {
        this.totalGuests = 0;
        this.checkAllDataLoaded();
      }
    });

    // Load total rooms
    this.roomService.getAll().subscribe({
      next: (rooms) => {
        this.totalRooms = rooms.length;
        this.checkAllDataLoaded();
      },
      error: () => {
        this.totalRooms = 0;
        this.checkAllDataLoaded();
      }
    });

    // Load total reservations
    this.reservationService.getAll().subscribe({
      next: (reservations) => {
        this.totalReservations = reservations.length;
        this.checkAllDataLoaded();
      },
      error: () => {
        this.totalReservations = 0;
        this.checkAllDataLoaded();
      }
    });

    // Load total payments and calculate total amount
    this.paymentService.getAll().subscribe({
      next: (payments) => {
        this.totalPayments = payments.length;
        // Calculate total amount from paid payments
        const totalAmount = payments
          .filter(payment => payment.paymentStatus === 'Paid')
          .reduce((sum, payment) => sum + payment.amountPaid, 0);
        this.totalPayments = totalAmount; // Using totalPayments to store total amount
        this.checkAllDataLoaded();
      },
      error: () => {
        this.totalPayments = 0;
        this.checkAllDataLoaded();
      }
    });
  }

  private checkAllDataLoaded() {
    // This is a simple approach - in a real app you might want to track each request separately
    setTimeout(() => {
      this.loading = false;
    }, 500); // Small delay to ensure all data is loaded
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
