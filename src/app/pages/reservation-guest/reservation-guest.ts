import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reservation-guest',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './reservation-guest.html',
  styleUrl: './reservation-guest.css'
})
export class ReservationGuest {
  reservations = [
    { id: '1', room: '201', type: 'Deluxe', checkin: '2025-06-21', checkout: '2025-06-24', status: 'Confirmed' },
    { id: '2', room: '105', type: 'Standard', checkin: '2025-05-10', checkout: '2025-05-12', status: 'Cancelled' },
    { id: '3', room: '310', type: 'Suite', checkin: '2025-03-02', checkout: '2025-03-04', status: 'Pending' }
  ];

  editModalOpen = false;
  editingIndex: number | null = null;
  editReservation = { id: '', room: '', type: '', checkin: '', checkout: '', status: '' };

  constructor(private router: Router) {}

  viewReservation(res: any) {
    alert(`Reservation Details:\nReservation ID: ${res.id}\nRoom: ${res.room} (${res.type})\nCheck-in: ${res.checkin}\nCheck-out: ${res.checkout}\nStatus: ${res.status}`);
  }

  openEditModal(index: number) {
    this.editingIndex = index;
    const r = this.reservations[index];
    this.editReservation = { ...r };
    this.editModalOpen = true;
  }

  closeEditModal() {
    this.editModalOpen = false;
    this.editingIndex = null;
  }

  saveEditReservation() {
    if (this.editingIndex === null) return;
    this.reservations[this.editingIndex] = { ...this.editReservation };
    this.closeEditModal();
  }

  deleteReservation(index: number) {
    if (confirm('Are you sure you want to delete this reservation?')) {
      this.reservations.splice(index, 1);
    }
  }

  redirectToBook() {
    this.router.navigate(['/reservation-form']);
  }

  getStatusClass(status: string) {
    return status.toLowerCase();
  }
}
