import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentGuestService, GuestPayment } from '../../services/payment-guest.service';
import { GuestAuthService } from '../../services/guest-auth.service';

@Component({
  selector: 'app-payment-guest',
  imports: [ RouterLink, CommonModule, FormsModule ],
  templateUrl: './payment-guest.html',
  styleUrl: './payment-guest.css'
})
export class PaymentGuest implements OnInit {
  payments: GuestPayment[] = [];
  filteredPayments: GuestPayment[] = [];
  loading = false;
  errorMsg = '';

  // Pagination
  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  totalElements = 0;

  // Sorting
  sortBy = 'paymentId';
  sortDir = 'desc';

  // Filtering
  reservationIdFilter = '';

  constructor(
    private paymentGuestService: PaymentGuestService,
    private router: Router,
    private guestAuthService: GuestAuthService
  ) {}

  ngOnInit() {
    this.fetchPayments();
  }

  fetchPayments() {
    this.loading = true;
    this.paymentGuestService.getByCurrentGuest().subscribe({
      next: (payments) => {
        this.payments = payments;
        this.applyFiltersAndSort();
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to load your payments.';
        this.loading = false;
      }
    });
  }

  applyFiltersAndSort() {
    let filtered = [...this.payments];

    // Apply reservation ID filter (only on reservationId, not paymentId)
    if (this.reservationIdFilter) {
      filtered = filtered.filter(p => 
        p.reservation?.reservationId?.toString().includes(this.reservationIdFilter)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (this.sortBy) {
        case 'paymentId':
          aValue = a.paymentId || 0;
          bValue = b.paymentId || 0;
          break;
        case 'reservation':
          aValue = a.reservation?.reservationId || 0;
          bValue = b.reservation?.reservationId || 0;
          break;
        case 'amountPaid':
          aValue = a.amountPaid || 0;
          bValue = b.amountPaid || 0;
          break;
        case 'paymentMethod':
          aValue = a.paymentMethod || '';
          bValue = b.paymentMethod || '';
          break;
        case 'paymentStatus':
          aValue = a.paymentStatus || '';
          bValue = b.paymentStatus || '';
          break;
        case 'paymentDate':
          aValue = new Date(a.paymentDate);
          bValue = new Date(b.paymentDate);
          break;
        default:
          aValue = a.paymentId || 0;
          bValue = b.paymentId || 0;
      }

      if (aValue < bValue) return this.sortDir === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredPayments = filtered;
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

  getPaginatedPayments(): GuestPayment[] {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredPayments.slice(start, end);
  }

  getMethodIcon(method: string): string {
    if (method === 'Credit Card') return '<i class="fa-solid fa-credit-card" style="color:#181c3a;margin-right:0.5em;"></i>';
    if (method === 'UPI') return '<i class="fa-solid fa-qrcode" style="color:#1a7f37;margin-right:0.5em;"></i>';
    return '<i class="fa-solid fa-money-bill" style="color:#b8860b;margin-right:0.5em;"></i>';
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  logout() {
    this.guestAuthService.logout();
    this.router.navigate(['/login']);
  }

  // If script.js contains any global utility functions used here, implement them as methods below.
}
