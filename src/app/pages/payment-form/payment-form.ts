import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService, Payment } from '../../services/payment.service';
import { GuestAuthService } from '../../services/guest-auth.service';

@Component({
  selector: 'app-payment-form',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './payment-form.html',
  styleUrl: './payment-form.css'
})
export class PaymentForm implements OnInit {
  reservationId: string = '';
  paymentDate: string = '';
  amount: string = '';
  method: string = '';
  errorMsg: string = '';
  paymentSuccess: boolean = false;
  paymentFailed: boolean = false;
  paymentPending: boolean = false;
  status: string = '';
  existingPayment: Payment | null = null;
  isUpdating: boolean = false;

  constructor(
    private route: ActivatedRoute, 
    private paymentService: PaymentService, 
    private router: Router,
    private guestAuthService: GuestAuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.amount = params['amount'] || '';
      this.reservationId = params['reservationId'] || '';
      
      // Check if there's an existing payment for this reservation
      if (this.reservationId) {
        this.checkExistingPayment();
      }
    });
    this.paymentDate = new Date().toISOString().split('T')[0];
  }

  checkExistingPayment() {
    this.paymentService.getAll().subscribe({
      next: (payments) => {
        const existingPayment = payments.find(p => p.reservation?.reservationId === parseInt(this.reservationId));
        if (existingPayment) {
          this.existingPayment = existingPayment;
          this.isUpdating = true;
          this.loadExistingPaymentData(existingPayment);
        }
      },
      error: (error) => {
        // Silently handle error, assume no existing payment
      }
    });
  }

  loadExistingPaymentData(payment: Payment) {
    this.paymentDate = payment.paymentDate;
    this.amount = payment.amountPaid.toString();
    this.method = payment.paymentMethod;
    this.status = payment.paymentStatus;
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.paymentDate || !this.amount || !this.method || !this.status) {
      this.errorMsg = 'Please fill all fields.';
      return;
    }
    if (!this.reservationId) {
      this.errorMsg = 'Reservation ID is required.';
      return;
    }

    this.errorMsg = '';

    // Create payment object
    const payment: Payment = {
      reservation: { reservationId: parseInt(this.reservationId) },
      paymentDate: this.paymentDate,
      amountPaid: parseFloat(this.amount),
      paymentMethod: this.method,
      paymentStatus: this.status
    };

    // Submit payment to backend
    if (this.isUpdating && this.existingPayment?.paymentId) {
      // Update existing payment
      this.paymentService.update(this.existingPayment.paymentId, payment).subscribe({
        next: (updatedPayment) => {
          this.showPaymentResult();
        },
        error: (error) => {
          this.errorMsg = 'Failed to update payment. Please try again.';
        }
      });
    } else {
      // Create new payment
      this.paymentService.create(payment).subscribe({
        next: (createdPayment) => {
          this.showPaymentResult();
        },
        error: (error) => {
          this.errorMsg = 'Failed to process payment. Please try again.';
        }
      });
    }
  }

  showPaymentResult() {
    // Show appropriate success/failure state
    if (this.status === 'Paid') {
      this.paymentSuccess = true;
      this.paymentFailed = false;
      this.paymentPending = false;
    } else if (this.status === 'Failed') {
      this.paymentSuccess = false;
      this.paymentFailed = true;
      this.paymentPending = false;
    } else if (this.status === 'Pending') {
      this.paymentSuccess = false;
      this.paymentFailed = false;
      this.paymentPending = true;
    }
  }

  setMethod(value: string) {
    this.method = value;
    this.errorMsg = '';
  }

  setStatus(value: string) {
    this.status = value;
    this.errorMsg = '';
    this.paymentSuccess = false;
    this.paymentFailed = false;
    this.paymentPending = false;
  }

  goToDashboard() {
    this.router.navigate(['/guest-dashboard']);
  }

  resetForm() {
    this.paymentSuccess = false;
    this.paymentFailed = false;
    this.paymentPending = false;
    this.method = '';
    this.status = '';
    this.errorMsg = '';
  }

  logout() {
    this.guestAuthService.logout();
    this.router.navigate(['/login']);
  }
}
