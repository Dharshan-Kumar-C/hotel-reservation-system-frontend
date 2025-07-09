import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService, Reservation } from '../../services/reservation.service';
import { PaymentService, Payment } from '../../services/payment.service';
import { GuestService, Guest } from '../../services/guest.service';
import { RoomService, Room } from '../../services/room.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reservations',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css'
})
export class Reservations implements OnInit {
  @ViewChild('bookReservationModal') bookReservationModal!: ElementRef;
  @ViewChild('editReservationModal') editReservationModal!: ElementRef;
  @ViewChild('makePaymentModal') makePaymentModal!: ElementRef;

  reservations: Reservation[] = [];
  guests: Guest[] = [];
  rooms: Room[] = [];
  payments: Payment[] = []; // Cache payments for status checking
  editingReservation: Reservation | null = null;
  selectedReservation: Reservation | null = null; // For payment modal
  editingPayment: Payment | null = null; // For payment editing
  showBookModal = false;
  showEditModal = false;
  showPaymentModal = false;
  isEditingPayment = false; // Flag to distinguish between new payment and editing
  loading = false;
  errorMsg = '';
  successMsg = '';

  // Pagination properties
  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  totalElements = 0;
  sortBy = 'checkInDate';
  sortDir = 'asc';

  // Form data for new reservation
  newReservation: any = {
    guest: null,
    room: null,
    checkInDate: '',
    checkOutDate: '',
    price: 0,
    status: ''
  };

  // Form data for edit reservation
  editReservationData: any = {
    guest: '',
    room: '',
    checkInDate: '',
    checkOutDate: '',
    price: 0,
    status: ''
  };

  // Payment form data
  paymentData = {
    paymentDate: '',
    amountPaid: 0,
    paymentMethod: '',
    paymentStatus: ''
  };

  // Filter values
  nameFilter = '';
  roomTypeFilter = '';
  statusFilter = '';

  // --- Guest and Room Search+Select State ---
  guestSearch: string = '';
  showGuestDropdown: boolean = false;
  filteredGuests: Guest[] = [];

  roomSearch: string = '';
  showRoomDropdown: boolean = false;
  filteredRooms: Room[] = [];

  constructor(
    private reservationService: ReservationService,
    private paymentService: PaymentService,
    private guestService: GuestService,
    private roomService: RoomService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchReservations();
    this.fetchGuests();
    this.fetchRooms();
    this.fetchPayments();
  }

  fetchGuests() {
    this.guestService.getAll().subscribe({
      next: (guests) => {
        this.guests = guests;
      },
      error: (err) => {
        console.error('Failed to load guests:', err);
      }
    });
  }

  fetchRooms() {
    this.roomService.getAll().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
      },
      error: (err) => {
        console.error('Failed to load rooms:', err);
      }
    });
  }

  fetchPayments() {
    this.paymentService.getAll().subscribe({
      next: (payments) => {
        this.payments = payments;
      },
      error: (err) => {
        console.error('Failed to load payments:', err);
      }
    });
  }

  fetchReservations() {
    this.loading = true;
    this.reservationService.getPaged(
      this.currentPage, this.pageSize, this.sortBy, this.sortDir,
      this.nameFilter, this.roomTypeFilter, this.statusFilter
    ).subscribe({
      next: (data) => {
        this.reservations = data.content || data;
        this.totalPages = data.totalPages || 0;
        this.totalElements = data.totalElements || 0;
        this.currentPage = data.number || 0;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Failed to load reservations.';
        this.loading = false;
      }
    });
  }

  viewReservation(reservation: Reservation) {
    alert(`Reservation Details:\nReservation ID: ${reservation.reservationId}\nGuest: ${reservation.guest?.name || ''}\nRoom: ${reservation.room ? reservation.room.roomNumber + ' (' + reservation.room.type + ')' : ''}\nCheck-in: ${reservation.checkInDate}\nCheck-out: ${reservation.checkOutDate}\nPrice: ₹${reservation.price}\nStatus: ${reservation.status}`);
  }

  editReservation(reservation: Reservation) {
    this.editingReservation = reservation;
    this.editReservationData = {
      guest: reservation.guest,
      room: reservation.room,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      price: reservation.price,
      status: reservation.status
    };
    this.showEditModal = true;
  }

  saveEditReservation() {
    if (!this.editingReservation || !this.editingReservation.reservationId) return;
    this.loading = true;
    this.reservationService.update(this.editingReservation.reservationId, this.editReservationData).subscribe({
      next: (updated) => {
        const idx = this.reservations.findIndex(r => r.reservationId === updated.reservationId);
        if (idx !== -1) this.reservations[idx] = updated;
    this.showEditModal = false;
    this.editingReservation = null;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Failed to update reservation.';
        this.loading = false;
      }
    });
  }

  deleteReservation(reservation: Reservation) {
    if (!reservation.reservationId) return;
    if (confirm('Are you sure you want to delete this reservation?')) {
      this.loading = true;
      this.reservationService.delete(reservation.reservationId).subscribe({
        next: () => {
          this.fetchReservations();
        },
        error: (err) => {
          this.errorMsg = 'Failed to delete reservation.';
          this.loading = false;
        }
      });
    }
  }

  openModal(modalType: 'book' | 'edit' | 'payment', reservation?: Reservation) {
    if (modalType === 'book') {
      this.showBookModal = true;
      this.newReservation = { guest: null, room: null, checkInDate: '', checkOutDate: '', price: 0, status: '' };
    } else if (modalType === 'edit') {
      this.showEditModal = true;
    } else if (modalType === 'payment') {
      if (reservation) {
        this.selectedReservation = reservation;
        this.paymentData = {
          paymentDate: new Date().toISOString().split('T')[0],
          amountPaid: reservation.price,
          paymentMethod: '',
          paymentStatus: 'Pending'
        };
      }
      this.showPaymentModal = true;
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
      this.selectedReservation = null;
      this.editingPayment = null;
      this.isEditingPayment = false;
      this.paymentData = {
        paymentDate: '',
        amountPaid: 0,
        paymentMethod: '',
        paymentStatus: ''
      };
    }
  }

  submitPayment() {
    if (!this.selectedReservation || !this.paymentData.paymentMethod || !this.paymentData.paymentStatus) {
      alert('Please fill in all payment fields.');
      return;
    }

    const paymentPayload: Payment = {
      reservation: this.selectedReservation,
      paymentDate: this.paymentData.paymentDate,
      amountPaid: this.paymentData.amountPaid,
      paymentMethod: this.paymentData.paymentMethod,
      paymentStatus: this.paymentData.paymentStatus
    };

    this.loading = true;

    if (this.isEditingPayment && this.editingPayment?.paymentId) {
      // Update existing payment
      this.paymentService.update(this.editingPayment.paymentId, paymentPayload).subscribe({
        next: (payment) => {
          this.closeModal('payment');
          this.loading = false;
          // Refresh payments cache
          this.fetchPayments();
          // Show alert based on payment status
          this.showPaymentStatusAlert(payment.paymentStatus);
        },
        error: (err) => {
          this.errorMsg = 'Failed to update payment: ' + (err.error?.message || err.message);
          this.loading = false;
          // Clear error message after 5 seconds
          setTimeout(() => {
            this.errorMsg = '';
          }, 5000);
        }
      });
    } else {
      // Create new payment
      this.paymentService.create(paymentPayload).subscribe({
        next: (payment) => {
          this.closeModal('payment');
          this.loading = false;
          // Refresh payments cache
          this.fetchPayments();
          // Show alert based on payment status
          this.showPaymentStatusAlert(payment.paymentStatus);
        },
        error: (err) => {
          this.errorMsg = 'Failed to submit payment: ' + (err.error?.message || err.message);
          this.loading = false;
          // Clear error message after 5 seconds
          setTimeout(() => {
            this.errorMsg = '';
          }, 5000);
        }
      });
    }
  }

  showPaymentStatusAlert(status: string) {
    switch (status.toLowerCase()) {
      case 'paid':
        alert('Payment Successful\nReservation is Confirmed');
        break;
      case 'failed':
        alert('Payment Failed\nPlease try after some time using a different method');
        break;
      case 'pending':
        alert('Payment Pending\nPlease try after some time');
        break;
      default:
        alert('Payment status: ' + status);
    }
  }

  addReservation() {
    if (!this.newReservation.guest || !this.newReservation.room || !this.newReservation.checkInDate || !this.newReservation.checkOutDate || !this.newReservation.price || !this.newReservation.status) {
      alert('Please fill in all fields.');
      return;
    }
    this.loading = true;
    this.reservationService.create(this.newReservation).subscribe({
      next: (created) => {
        const statusText = this.newReservation.status.toLowerCase();
        const confirmed = confirm(`Your reservation is ${statusText}. Do you wish to proceed to payment now or later?`);
        if (confirmed) {
          // Open payment modal for this reservation
          this.showBookModal = false;
          this.newReservation = { guest: null, room: null, checkInDate: '', checkOutDate: '', price: 0, status: '' };
          this.fetchReservations();
          this.openModal('payment', created);
        } else {
          // Just refresh reservations and close modal
          this.currentPage = 0;
          this.fetchReservations();
          this.showBookModal = false;
          this.newReservation = { guest: null, room: null, checkInDate: '', checkOutDate: '', price: 0, status: '' };
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Failed to add reservation.';
        this.loading = false;
      }
    });
  }

  // Pagination methods
  onPageChange(page: number) {
    this.currentPage = page;
    this.fetchReservations();
  }

  onSort(column: string) {
    if (this.sortBy === column) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDir = 'asc';
    }
    this.currentPage = 0;
    this.fetchReservations();
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.fetchReservations();
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

  getStatusColor(status: string): string {
    switch (status) {
      case 'Confirmed': return 'green';
      case 'Pending': return 'orange';
      case 'Cancelled': return 'red';
      default: return 'green';
    }
  }

  updateRoomPrice() {
    if (this.newReservation.room && this.newReservation.room.roomId) {
      // Use the room's actual amount from backend
      this.newReservation.price = this.newReservation.room.amount;
    }
  }

  handlePaymentClick(reservation: Reservation) {
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
        // Payment exists but not paid - allow editing or creating new payment
        if (confirm(`Payment exists with status: ${existingPayment.paymentStatus}. Do you want to edit the existing payment?`)) {
          this.openPaymentEditModal(reservation, existingPayment);
        }
      }
    } else {
      // No payment exists - open payment form
      this.openModal('payment', reservation);
    }
  }

  openPaymentEditModal(reservation: Reservation, payment: Payment) {
    this.selectedReservation = reservation;
    this.editingPayment = payment;
    this.isEditingPayment = true;
    
    // Pre-fill payment data with existing payment
    this.paymentData = {
      paymentDate: payment.paymentDate,
      amountPaid: payment.amountPaid,
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus
    };
    
    this.showPaymentModal = true;
  }

  getPaymentStatus(reservation: Reservation): string {
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
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onNameFilterChange() {
    this.currentPage = 0;
    this.fetchReservations();
  }

  onRoomTypeFilterChange() {
    this.currentPage = 0;
    this.fetchReservations();
  }

  onStatusFilterChange() {
    this.currentPage = 0;
    this.fetchReservations();
  }

  // --- Guest Search+Select Methods ---
  filterGuests() {
    const search = this.guestSearch.toLowerCase();
    if (!this.guestSearch) {
      this.filteredGuests = this.guests.slice();
    } else {
      this.filteredGuests = this.guests.filter(g =>
        g.name.toLowerCase().includes(search) ||
        (g.guestId ? g.guestId.toString().includes(search) : false)
      );
    }
    // Ensure the selected guest is always in the filtered list
    if (this.newReservation.guest && !this.filteredGuests.includes(this.newReservation.guest)) {
      this.filteredGuests.unshift(this.newReservation.guest);
    }
    // If input is empty or no match, clear selection
    const match = this.guests.find(g => `${g.guestId ?? ''} - ${g.name}` === this.guestSearch);
    if (!this.guestSearch || !match) {
      this.newReservation.guest = null;
    } else {
      this.newReservation.guest = match;
    }
  }
  selectGuest(guest: Guest) {
    this.newReservation.guest = guest;
    this.guestSearch = `${guest.guestId ?? ''} - ${guest.name}`;
    this.showGuestDropdown = false;
  }
  hideGuestDropdownWithDelay() {
    setTimeout(() => {
      this.showGuestDropdown = false;
    }, 200);
  }

  // --- Room Search+Select Methods ---
  filterRooms() {
    const search = this.roomSearch.toLowerCase();
    if (!this.roomSearch) {
      this.filteredRooms = this.rooms.slice();
    } else {
      this.filteredRooms = this.rooms.filter(r =>
        r.roomNumber.toString().toLowerCase().includes(search) ||
        r.type.toLowerCase().includes(search)
      );
    }
    // Ensure the selected room is always in the filtered list
    if (this.newReservation.room && !this.filteredRooms.includes(this.newReservation.room)) {
      this.filteredRooms.unshift(this.newReservation.room);
    }
    // If input is empty or no match, clear selection and price
    const match = this.rooms.find(r => `${r.roomId} - ${r.roomNumber} (${r.type})` === this.roomSearch);
    if (!this.roomSearch || !match) {
      this.newReservation.room = null;
      this.newReservation.price = 0;
    } else {
      this.newReservation.room = match;
      this.newReservation.price = match.amount;
    }
  }
  selectRoom(room: Room) {
    this.newReservation.room = room;
    this.roomSearch = `${room.roomId} - ${room.roomNumber} (${room.type})`;
    this.newReservation.price = room.amount;
    this.showRoomDropdown = false;
  }
  hideRoomDropdownWithDelay() {
    setTimeout(() => {
      this.showRoomDropdown = false;
    }, 200);
  }
}
