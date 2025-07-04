import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-guest',
  imports: [ RouterLink, CommonModule ],
  templateUrl: './payment-guest.html',
  styleUrl: './payment-guest.css'
})
export class PaymentGuest {
  payments = [
    { id: '1', reservation: '1', date: '2025-06-19', amount: '$350', method: 'Credit Card', status: 'Paid' },
    { id: '2', reservation: '2', date: '2025-05-12', amount: '$180', method: 'UPI', status: 'Paid' },
    { id: '3', reservation: '3', date: '2025-03-04', amount: '$220', method: 'Credit Card', status: 'Failed' },
    { id: '4', reservation: '4', date: '2025-02-10', amount: '$120', method: 'CASH', status: 'Pending' }
  ];

  getMethodIcon(method: string): string {
    if (method === 'Credit Card') return '<i class="fa-solid fa-credit-card" style="color:#181c3a;margin-right:0.5em;"></i>';
    if (method === 'UPI') return '<i class="fa-solid fa-qrcode" style="color:#1a7f37;margin-right:0.5em;"></i>';
    return '<i class="fa-solid fa-money-bill" style="color:#b8860b;margin-right:0.5em;"></i>';
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  // If script.js contains any global utility functions used here, implement them as methods below.
}
