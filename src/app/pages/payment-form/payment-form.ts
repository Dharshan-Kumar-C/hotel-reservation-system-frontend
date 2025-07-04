import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.amount = params['amount'] || '';
      this.reservationId = params['reservationId'] || '';
    });
    this.paymentDate = new Date().toISOString().split('T')[0];
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.paymentDate || !this.amount || !this.method || !this.status) {
      this.errorMsg = 'Please fill all fields.';
      return;
    }
    this.errorMsg = '';
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
}
