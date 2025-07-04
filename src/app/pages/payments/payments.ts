import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payments',
  imports: [RouterLink, CommonModule],
  templateUrl: './payments.html',
  styleUrl: './payments.css'
})
export class Payments {
  payments: any[] = [
    {
      paymentId: 1,
      reservationId: 1,
      guestName: 'Jane Doe',
      roomDisplay: '201 (Deluxe)',
      checkIn: '2025-06-19',
      checkOut: '2025-06-21',
      paymentDate: '2025-06-19',
      paymentAmount: 240,
      paymentMethod: 'Credit Card',
      paymentStatus: 'Paid'
    },
    {
      paymentId: 2,
      reservationId: 2,
      guestName: 'John Smith',
      roomDisplay: '105 (Standard)',
      checkIn: '2025-06-20',
      checkOut: '2025-06-22',
      paymentDate: '2025-06-20',
      paymentAmount: 160,
      paymentMethod: 'UPI',
      paymentStatus: 'Pending'
    }
  ];

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
}
