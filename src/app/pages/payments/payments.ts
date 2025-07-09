import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService, Payment } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-payments',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './payments.html',
  styleUrl: './payments.css'
})
export class Payments implements OnInit {
  payments: Payment[] = [];
  loading = false;
  errorMsg = '';
  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  totalElements = 0;
  sortBy = 'amountPaid';
  sortDir = 'asc';
  reservationIdFilter = ''; // Filter by reservation ID

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchPayments();
  }

  fetchPayments() {
    this.loading = true;
    this.paymentService.getPaged(
      this.currentPage, this.pageSize, this.sortBy, this.sortDir, this.reservationIdFilter
    ).subscribe({
      next: (data) => {
        this.payments = data.content || data;
        this.totalPages = data.totalPages || 0;
        this.totalElements = data.totalElements || 0;
        this.currentPage = data.number || 0;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Failed to load payments.';
        this.loading = false;
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.fetchPayments();
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.fetchPayments();
  }

  onSort(column: string) {
    if (this.sortBy === column) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDir = 'asc';
    }
    this.currentPage = 0;
    this.fetchPayments();
  }

  onReservationIdFilterChange() {
    this.currentPage = 0;
    this.fetchPayments();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(0, this.currentPage - 2);
    const endPage = Math.min(this.totalPages - 1, this.currentPage + 2);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getStatusBadge(status: string): string {
    const s = status.toLowerCase();
    if (s === 'paid') return 'paid';
    if (s === 'pending') return 'pending';
    if (s === 'failed') return 'failed';
    return '';
  }

  getMethodIcon(method: string): string {
    const m = method.toLowerCase();
    if (m.includes('card')) return 'fa-solid fa-credit-card';
    if (m === 'upi') return 'fa-solid fa-qrcode';
    if (m === 'cash') return 'fa-solid fa-money-bill';
    return '';
  }

  get hasPayments(): boolean {
    return this.payments.length > 0;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
