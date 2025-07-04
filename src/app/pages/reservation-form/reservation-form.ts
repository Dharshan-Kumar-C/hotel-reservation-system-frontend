import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-reservation-form',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reservation-form.html',
  styleUrl: './reservation-form.css'
})
export class ReservationForm {
  checkin = '';
  checkout = '';
  roomType = '';
  roomNumber = '';
  amount: number | null = null;
  errorMsg = '';
  showAmount = false;
  showProceed = false;
  roomImage: string | null = null;
  reservationStatus = '';

  roomNumbers: { [key: string]: string[] } = {
    'Single': ['101', '102', '103', '104'],
    'Double': ['201', '202', '203', '204'],
    'Suite': ['301', '302', '303'],
    'Deluxe': ['401', '402', '403', '404'],
    'Standard': ['501', '502', '503', '504']
  };

  constructor(private router: Router) {}

  get availableRoomNumbers() {
    return this.roomType ? this.roomNumbers[this.roomType] : [];
  }

  getRoomImage(): string | null {
    switch (this.roomType) {
      case 'Single': return '/assets/images/single.jpg';
      case 'Double': return '/assets/images/double.jpg';
      case 'Suite': return '/assets/images/suite.jpg';
      case 'Deluxe': return '/assets/images/deluxe.jpg';
      case 'Standard': return '/assets/images/standard.jpg';
      default: return null;
    }
  }

  onRoomTypeChange() {
    this.roomNumber = '';
    this.amount = null;
    this.showAmount = false;
    this.showProceed = false;
    this.roomImage = this.getRoomImage();
  }

  onRoomNumberChange() {
    this.updateAmount();
  }

  updateAmount() {
    if (this.roomType && this.roomNumber) {
      if (this.roomType === 'Single') this.amount = 120;
      else if (this.roomType === 'Double') this.amount = 180;
      else if (this.roomType === 'Standard') this.amount = 150;
      else if (this.roomType === 'Suite') this.amount = 300;
      else this.amount = 350;
      this.showAmount = true;
      this.showProceed = true;
    } else {
      this.amount = null;
      this.showAmount = false;
      this.showProceed = false;
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.checkin || !this.checkout || !this.roomType || !this.roomNumber || !this.reservationStatus) {
      this.errorMsg = 'Please fill all fields.';
      return;
    }
    this.errorMsg = '';
    // Generate dummy reservation ID and amount
    const reservationId = Math.floor(1 + Math.random() * 99);
    const amount = this.amount || 0;
    // Use Angular router to navigate to payment-form with query params
    this.router.navigate(['/payment-form'], { queryParams: { reservationId, amount, reservationStatus: this.reservationStatus } });
  }

  setCheckin(value: string) {
    this.checkin = value;
    this.errorMsg = '';
  }
  setCheckout(value: string) {
    this.checkout = value;
    this.errorMsg = '';
  }
  setRoomType(value: string) {
    this.roomType = value;
    this.errorMsg = '';
    this.onRoomTypeChange();
  }
  setRoomNumber(value: string) {
    this.roomNumber = value;
    this.errorMsg = '';
    this.onRoomNumberChange();
  }
  setReservationStatus(value: string) {
    this.reservationStatus = value;
    this.errorMsg = '';
  }
}
