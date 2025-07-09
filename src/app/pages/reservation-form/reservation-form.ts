import { Component, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { RoomService, Room } from '../../services/room.service';
import { ReservationService, Reservation } from '../../services/reservation.service';
import { ProfileService } from '../../services/profile.service';
import { GuestAuthService } from '../../services/guest-auth.service';

@Component({
  selector: 'app-reservation-form',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reservation-form.html',
  styleUrl: './reservation-form.css'
})
export class ReservationForm implements OnInit, OnDestroy {
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

  allRooms: Room[] = [];
  filteredRooms: Room[] = [];
  selectedRoom: Room | null = null;
  guestId: number | null = null;

  roomNumberSearch: string = '';
  showRoomDropdown: boolean = false;
  filteredRoomNumbers: string[] = [];

  private documentClickListener: (() => void) | null = null;

  constructor(
    private router: Router,
    private roomService: RoomService,
    private reservationService: ReservationService,
    private profileService: ProfileService,
    private guestAuthService: GuestAuthService,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.roomService.getAll().subscribe({
      next: (rooms) => {
        this.allRooms = rooms;
        if (rooms.length === 0) {
          this.errorMsg = 'No rooms available in the system.';
        }
      },
      error: () => {
        this.errorMsg = 'Failed to load rooms.';
      }
    });
    // Fetch guestId from profile
    const token = localStorage.getItem('guest-jwt');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const email = payload.sub;
        if (email) {
          this.profileService.getProfileByEmail(email).subscribe({
            next: (guest) => {
              this.guestId = guest.guestId || null;
            },
            error: () => {
              this.guestId = null;
            }
          });
        }
      } catch {
        this.guestId = null;
      }
    }
    this.filteredRoomNumbers = this.availableRoomNumbers;
  }

  ngOnDestroy() {
  }

  get availableRoomNumbers() {
    return this.filteredRooms.map(r => r.roomNumber);
  }

  onRoomTypeChange() {
    this.roomNumber = '';
    this.roomNumberSearch = '';
    this.amount = null;
    this.showAmount = false;
    this.showProceed = false;
    this.roomImage = this.getRoomImage();
    
    // Use the new service method to fetch rooms by type
    this.roomService.getRoomsByType(this.roomType).subscribe({
      next: (rooms) => {
        this.filteredRooms = rooms;
        this.filteredRoomNumbers = rooms.map(r => r.roomNumber);
        if (rooms.length === 0) {
          this.errorMsg = 'No rooms available for selected type.';
        } else {
          this.errorMsg = '';
        }
      },
      error: (error) => {
        this.filteredRooms = [];
        this.filteredRoomNumbers = [];
        this.errorMsg = 'Failed to load rooms for selected type.';
      }
    });
  }

  onRoomNumberChange() {
    this.selectedRoom = this.filteredRooms.find(r => r.roomNumber === this.roomNumber) || null;
    if (this.selectedRoom) {
      this.amount = this.selectedRoom.amount;
      this.showAmount = true;
      this.showProceed = true;
    } else {
      this.amount = null;
      this.showAmount = false;
      this.showProceed = false;
    }
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

  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.checkin || !this.checkout || !this.roomType || !this.roomNumber || !this.reservationStatus) {
      this.errorMsg = 'Please fill all fields.';
      return;
    }
    if (!this.selectedRoom || !this.guestId) {
      this.errorMsg = 'Invalid room or guest.';
      return;
    }
    this.errorMsg = '';
    const reservation: Reservation = {
      guest: { guestId: this.guestId },
      room: { roomId: this.selectedRoom.roomId },
      checkInDate: this.checkin,
      checkOutDate: this.checkout,
      price: this.selectedRoom.amount,
      status: this.reservationStatus
    };
    this.reservationService.create(reservation).subscribe({
      next: (res) => {
        // Show confirmation alert
        const statusText = this.reservationStatus.toLowerCase();
        const confirmed = confirm(`Your reservation is ${statusText}. Do you wish to proceed to payment now or later?`);
        
        if (confirmed) {
          // Navigate to payment form
          this.router.navigate(['/payment-form'], { queryParams: { reservationId: res.reservationId, amount: res.price, reservationStatus: res.status } });
        } else {
          // Navigate to reservation guest page
          this.router.navigate(['/reservation-guest']);
        }
      },
      error: () => {
        this.errorMsg = 'Failed to book reservation.';
      }
    });
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
  setRoomNumber(value: string | number) {
    this.roomNumber = value.toString();
    this.roomNumberSearch = value.toString();
    this.errorMsg = '';
    this.selectedRoom = this.filteredRooms.find(r => r.roomNumber.toString() === this.roomNumber) || null;
    if (this.selectedRoom) {
      this.amount = this.selectedRoom.amount;
      this.showAmount = true;
      this.showProceed = true;
    } else {
      this.amount = null;
      this.showAmount = false;
      this.showProceed = false;
    }
  }
  setReservationStatus(value: string) {
    this.reservationStatus = value;
    this.errorMsg = '';
  }

  logout() {
    this.guestAuthService.logout();
    this.router.navigate(['/login']);
  }

  filterRoomNumbers() {
    const search = this.roomNumberSearch.toLowerCase();
    // Minimal change: if input matches a valid room number exactly, show only that
    const exactMatch = this.availableRoomNumbers.find(num => num.toString() === this.roomNumberSearch);
    if (exactMatch) {
      this.filteredRoomNumbers = [exactMatch];
    } else if (!this.roomNumberSearch) {
      this.filteredRoomNumbers = this.availableRoomNumbers.slice();
    } else {
      this.filteredRoomNumbers = this.availableRoomNumbers.filter(num =>
        num.toString().toLowerCase().includes(search)
      );
    }
    // If the input is empty or does not match a valid room number, clear amount and hide proceed
    const match = this.filteredRooms.find(r => r.roomNumber.toString() === this.roomNumberSearch);
    if (!this.roomNumberSearch || !match) {
      this.amount = null;
      this.showAmount = false;
      this.showProceed = false;
      this.selectedRoom = null;
      this.roomNumber = '';
    } else {
      // If a valid room number is typed, update amount and show proceed
      this.selectedRoom = match;
      this.roomNumber = match.roomNumber.toString();
      this.amount = match.amount;
      this.showAmount = true;
      this.showProceed = true;
    }
  }

  selectRoomNumber(num: string | number) {
    this.roomNumber = num.toString();
    this.roomNumberSearch = num.toString();
    this.showRoomDropdown = false;
    this.selectedRoom = this.filteredRooms.find(r => r.roomNumber.toString() === this.roomNumber) || null;
    if (this.selectedRoom) {
      this.amount = this.selectedRoom.amount;
      this.showAmount = true;
      this.showProceed = true;
    } else {
      this.amount = null;
      this.showAmount = false;
      this.showProceed = false;
    }
    this.errorMsg = '';
  }

  hideDropdownWithDelay() {
    setTimeout(() => {
      this.showRoomDropdown = false;
    }, 200);
  }
}
