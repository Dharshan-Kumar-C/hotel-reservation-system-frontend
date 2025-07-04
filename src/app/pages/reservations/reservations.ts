import { Component, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reservations',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css'
})
export class Reservations {
  @ViewChild('bookReservationModal') bookReservationModal!: ElementRef;
  @ViewChild('editReservationModal') editReservationModal!: ElementRef;
  @ViewChild('makePaymentModal') makePaymentModal!: ElementRef;

  reservations = [
    {
      id: 1,
      guestName: 'Jane Doe',
      roomDisplay: '201 (Deluxe)',
      checkIn: '2025-06-19',
      checkOut: '2025-06-21',
      price: 240,
      status: 'Confirmed'
    },
    {
      id: 2,
      guestName: 'John Smith',
      roomDisplay: '105 (Standard)',
      checkIn: '2025-06-20',
      checkOut: '2025-06-22',
      price: 160,
      status: 'Pending'
    }
  ];

  guests = [
    { id: 1, name: 'Jane Doe' },
    { id: 2, name: 'John Smith' }
  ];

  rooms = [
    { id: 1, number: '201', type: 'Deluxe', price: 120 },
    { id: 2, number: '105', type: 'Standard', price: 80 }
  ];

  editingReservation: any = null;
  reservationIdCounter = 3;
  showBookModal = false;
  showEditModal = false;
  showPaymentModal = false;

  // Form data for new reservation
  newReservation = {
    guestId: '',
    roomId: '',
    checkIn: '',
    checkOut: '',
    price: 0,
    status: ''
  };

  // Form data for edit reservation
  editReservationData = {
    guestId: '',
    roomId: '',
    checkIn: '',
    checkOut: '',
    price: 0,
    status: ''
  };

  // Payment form data
  paymentData = {
    paymentDate: '',
    paymentAmount: 0,
    paymentMethod: '',
    paymentStatus: ''
  };

  // Filter values
  nameFilter = '';
  roomTypeFilter = '';
  statusFilter = '';

  viewReservation(reservation: any) {
    alert(`Reservation Details:\nReservation ID: ${reservation.id}\nGuest: ${reservation.guestName}\nRoom: ${reservation.roomDisplay}\nCheck-in: ${reservation.checkIn}\nCheck-out: ${reservation.checkOut}\nPrice: $${reservation.price}\nStatus: ${reservation.status}`);
  }

  editReservation(reservation: any) {
    this.editingReservation = reservation;
    
    // Find guest and room IDs
    const guest = this.guests.find(g => g.name === reservation.guestName);
    const roomMatch = reservation.roomDisplay.match(/^(.*?) \((.*?)\)$/);
    const room = this.rooms.find(r => r.number === roomMatch?.[1] && r.type === roomMatch?.[2]);
    
    this.editReservationData = {
      guestId: guest?.id?.toString() || '',
      roomId: room?.id?.toString() || '',
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      price: reservation.price,
      status: reservation.status
    };
    
    this.showEditModal = true;
  }

  saveEditReservation() {
    if (!this.editingReservation) return;
    
    const guest = this.guests.find(g => g.id.toString() === this.editReservationData.guestId);
    const room = this.rooms.find(r => r.id.toString() === this.editReservationData.roomId);
    
    const index = this.reservations.findIndex(r => r.id === this.editingReservation.id);
    if (index !== -1) {
      this.reservations[index] = {
        id: this.editingReservation.id,
        guestName: guest?.name || '',
        roomDisplay: room ? `${room.number} (${room.type})` : '',
        checkIn: this.editReservationData.checkIn,
        checkOut: this.editReservationData.checkOut,
        price: this.editReservationData.price,
        status: this.editReservationData.status
      };
    }
    
    this.showEditModal = false;
    this.editingReservation = null;
  }

  deleteReservation(reservation: any) {
    if (confirm('Are you sure you want to delete this reservation?')) {
      this.reservations = this.reservations.filter(r => r.id !== reservation.id);
    }
  }

  openModal(modalType: 'book' | 'edit' | 'payment') {
    if (modalType === 'book') {
      this.showBookModal = true;
      this.newReservation = { guestId: '', roomId: '', checkIn: '', checkOut: '', price: 0, status: '' };
    } else if (modalType === 'edit') {
      this.showEditModal = true;
    } else if (modalType === 'payment') {
      this.showPaymentModal = true;
      this.paymentData.paymentDate = new Date().toISOString().split('T')[0];
    }
  }

  closeModal(modalType: 'book' | 'edit' | 'payment') {
    if (modalType === 'book') {
      this.showBookModal = false;
    } else if (modalType === 'edit') {
      this.showEditModal = false;
      this.editingReservation = null;
    } else if (modalType === 'payment') {
      this.showPaymentModal = false;
    }
  }

  addReservation() {
    if (!this.newReservation.guestId || !this.newReservation.roomId || !this.newReservation.checkIn || !this.newReservation.checkOut || !this.newReservation.price || !this.newReservation.status) {
      alert('Please fill in all fields.');
      return;
    }

    const guest = this.guests.find(g => g.id.toString() === this.newReservation.guestId);
    const room = this.rooms.find(r => r.id.toString() === this.newReservation.roomId);

    const newReservation = {
      id: this.reservationIdCounter++,
      guestName: guest?.name || '',
      roomDisplay: room ? `${room.number} (${room.type})` : '',
      checkIn: this.newReservation.checkIn,
      checkOut: this.newReservation.checkOut,
      price: this.newReservation.price,
      status: this.newReservation.status
    };

    this.reservations.push(newReservation);
    this.showBookModal = false;
    this.newReservation = { guestId: '', roomId: '', checkIn: '', checkOut: '', price: 0, status: '' };
    
    // Show payment modal
    this.paymentData.paymentAmount = newReservation.price;
    this.openModal('payment');
  }

  updateRoomPrice() {
    const room = this.rooms.find(r => r.id.toString() === this.newReservation.roomId);
    this.newReservation.price = room?.price || 0;
  }

  updateEditRoomPrice() {
    const room = this.rooms.find(r => r.id.toString() === this.editReservationData.roomId);
    this.editReservationData.price = room?.price || 0;
  }

  submitPayment() {
    if (!this.paymentData.paymentMethod || !this.paymentData.paymentStatus) {
      alert('Please fill in all payment fields.');
      return;
    }

    // Get latest reservation
    const latestReservation = this.reservations[this.reservations.length - 1];
    if (!latestReservation) {
      alert('No reservation found for payment.');
      this.closeModal('payment');
      return;
    }

    // No storing payment data anywhere
    alert('Payment successful!');
    this.closeModal('payment');
  }

  get filteredReservations() {
    return this.reservations.filter(reservation => {
      let show = true;
      
      if (this.nameFilter && !reservation.guestName.toLowerCase().includes(this.nameFilter.toLowerCase())) {
        show = false;
      }
      
      if (this.roomTypeFilter && !reservation.roomDisplay.toLowerCase().includes(this.roomTypeFilter.toLowerCase())) {
        show = false;
      }
      
      if (this.statusFilter && reservation.status !== this.statusFilter) {
        show = false;
      }
      
      return show;
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Confirmed': return 'green';
      case 'Pending': return 'orange';
      case 'Cancelled': return 'red';
      default: return 'green';
    }
  }
}
