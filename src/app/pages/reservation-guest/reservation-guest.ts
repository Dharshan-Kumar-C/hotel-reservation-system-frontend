import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservationGuestService, GuestReservation } from '../../services/reservation-guest.service';
import { PaymentService, Payment } from '../../services/payment.service';
import { GuestAuthService } from '../../services/guest-auth.service';

@Component({
  selector: 'app-reservation-guest',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './reservation-guest.html',
  styleUrl: './reservation-guest.css'
})
export class ReservationGuest implements OnInit {
  reservations: GuestReservation[] = [];
  filteredReservations: GuestReservation[] = [];
  loading = false;
  errorMsg = '';

  // Pagination
  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  totalElements = 0;

  // Sorting
  sortBy = 'reservationId';
  sortDir = 'desc';

  // Filtering
  statusFilter = '';
  roomTypeFilter = '';

  editModalOpen = false;
  editingIndex: number | null = null;
  editReservation: GuestReservation = { id: '', room: '', type: '', checkin: '', checkout: '', status: '' } as any;

  modalLoading = false;
  modalError = '';

  payments: Payment[] = []; // Cache payments for status checking

  constructor(
    private reservationGuestService: ReservationGuestService, 
    private paymentService: PaymentService,
    private router: Router,
    private guestAuthService: GuestAuthService
  ) {}

  ngOnInit() {
    this.fetchGuestReservations();
    this.fetchPayments();
  }

  fetchGuestReservations() {
    this.loading = true;
    this.reservationGuestService.getByCurrentGuest().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.applyFiltersAndSort();
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to load your reservations.';
        this.loading = false;
      }
    });
  }

  fetchPayments() {
    this.paymentService.getAll().subscribe({
      next: (payments) => {
        this.payments = payments;
      },
      error: (err) => {
        // Silently handle payment fetch errors for guests
      }
    });
  }

  applyFiltersAndSort() {
    let filtered = [...this.reservations];

    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter(r => r.status === this.statusFilter);
    }

    // Apply room type filter
    if (this.roomTypeFilter) {
      filtered = filtered.filter(r => r.room?.type === this.roomTypeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (this.sortBy) {
        case 'reservationId':
          aValue = a.reservationId || 0;
          bValue = b.reservationId || 0;
          break;
        case 'room':
          aValue = a.room?.roomNumber || '';
          bValue = b.room?.roomNumber || '';
          break;
        case 'checkInDate':
          aValue = new Date(a.checkInDate);
          bValue = new Date(b.checkInDate);
          break;
        case 'checkOutDate':
          aValue = new Date(a.checkOutDate);
          bValue = new Date(b.checkOutDate);
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        default:
          aValue = a.reservationId || 0;
          bValue = b.reservationId || 0;
      }

      if (aValue < bValue) return this.sortDir === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredReservations = filtered;
    this.totalElements = filtered.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
    this.currentPage = 0;
  }

  onSort(field: string) {
    if (this.sortBy === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDir = 'asc';
    }
    this.applyFiltersAndSort();
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages - 1, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getPaginatedReservations(): GuestReservation[] {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredReservations.slice(start, end);
  }

  viewReservation(res: any) {
    alert(`Reservation Details:\nReservation ID: ${res.reservationId}\nRoom: ${res.room?.roomNumber || res.room} (${res.room?.type})\nCheck-in: ${res.checkInDate}\nCheck-out: ${res.checkOutDate}\nPrice: ₹${res.price}\nStatus: ${res.status}`);
  }

  openEditModal(index: number) {
    this.editingIndex = index;
    const r = this.getPaginatedReservations()[index];
    this.editReservation = { ...r };
    this.editModalOpen = true;
    this.modalLoading = false;
    this.modalError = '';
  }

  closeEditModal() {
    this.editModalOpen = false;
    this.editingIndex = null;
  }

  saveEditReservation() {
    if (this.editingIndex === null) return;
    this.modalLoading = true;
    this.modalError = '';
    this.reservationGuestService.updateReservation(this.editReservation).subscribe({
      next: (updated) => {
        // Update the reservation in the original array
        const originalIndex = this.reservations.findIndex(r => r.reservationId === updated.reservationId);
        if (originalIndex !== -1) {
          this.reservations[originalIndex] = updated;
          this.applyFiltersAndSort();
        }
        this.closeEditModal();
        this.modalLoading = false;
      },
      error: () => {
        this.modalError = 'Failed to update reservation.';
        this.modalLoading = false;
      }
    });
  }

  deleteReservation(index: number) {
    if (confirm('Are you sure you want to delete this reservation?')) {
      const reservation = this.getPaginatedReservations()[index];
      if (reservation.reservationId) {
        this.reservationGuestService.deleteReservation(reservation.reservationId).subscribe({
          next: () => {
            // Remove from original array and reapply filters
            const originalIndex = this.reservations.findIndex(r => r.reservationId === reservation.reservationId);
            if (originalIndex !== -1) {
              this.reservations.splice(originalIndex, 1);
              this.applyFiltersAndSort();
            }
            alert('Reservation deleted successfully!');
          },
          error: () => {
            alert('Failed to delete reservation. Please try again.');
          }
        });
      } else {
        alert('Cannot delete reservation: Invalid reservation ID.');
      }
    }
  }

  redirectToBook() {
    this.router.navigate(['/reservation-form']);
  }

  getStatusClass(status: string) {
    return status.toLowerCase();
  }

  handlePaymentClick(reservation: GuestReservation) {
    if (!reservation.reservationId) {
      alert('Invalid reservation ID');
      return;
    }

    // Check if payment exists for this reservation using cached payments
    const existingPayment = this.payments.find(p => p.reservation?.reservationId === reservation.reservationId);
    
    if (existingPayment) {
      if (existingPayment.paymentStatus === 'Paid') {
        alert(`Payment already completed for this reservation.\nPayment ID: ${existingPayment.paymentId}\nStatus: ${existingPayment.paymentStatus}\nAmount: ₹${existingPayment.amountPaid}\nPayment Date: ${existingPayment.paymentDate}`);
      } else {
        // Payment exists but not paid - show confirmation
        const confirmMessage = `Would you like to do the payment for reservation ID ${reservation.reservationId} now?`;
        if (confirm(confirmMessage)) {
          this.router.navigate(['/payment-form'], {
            queryParams: {
              reservationId: reservation.reservationId,
              amount: reservation.price
            }
          });
        }
      }
    } else {
      // No payment exists - show confirmation
      const confirmMessage = `Would you like to do the payment for reservation ID ${reservation.reservationId} now?`;
      if (confirm(confirmMessage)) {
        this.router.navigate(['/payment-form'], {
          queryParams: {
            reservationId: reservation.reservationId,
            amount: reservation.price
          }
        });
      }
    }
  }

  getPaymentStatus(reservation: GuestReservation): string {
    const payment = this.payments.find(p => p.reservation?.reservationId === reservation.reservationId);
    return payment ? payment.paymentStatus : '';
  }

  getPaymentStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid': return 'green';
      case 'pending': return 'orange';
      case 'failed': return 'red';
      default: return 'gray';
    }
  }

  logout() {
    this.guestAuthService.logout();
    this.router.navigate(['/login']);
  }
}
