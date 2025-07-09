import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuestService, Guest } from '../../services/guest.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-guests',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './guests.html',
  styleUrl: './guests.css'
})
export class Guests implements OnInit {
  @ViewChild('addGuestModal') addGuestModal!: ElementRef;
  @ViewChild('editGuestModal') editGuestModal!: ElementRef;
  @ViewChild('addGuestPassword') addGuestPassword!: ElementRef;
  @ViewChild('addEyeIcon') addEyeIcon!: ElementRef;
  @ViewChild('editGuestPassword') editGuestPassword!: ElementRef;
  @ViewChild('editEyeIcon') editEyeIcon!: ElementRef;
  @ViewChild('guestNameFilter') guestNameFilter!: ElementRef;

  guests: Guest[] = [];
  editingRow: Guest | null = null;
  showAddModal = false;
  showEditModal = false;
  loading = false;
  errorMsg = '';

  // Pagination properties
  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  totalElements = 0;
  sortBy = 'name';
  sortDir = 'asc';

  // Form data for add guest
  newGuest: Guest = {
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  };

  // Form data for edit guest
  editGuestData: Guest = {
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  };

  searchFilter = '';
  searchTimeout: any = null;

  constructor(
    private guestService: GuestService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchGuests();
  }

  fetchGuests() {
    this.loading = true;
    this.guestService.getPaged(this.currentPage, this.pageSize, this.sortBy, this.sortDir, this.searchFilter).subscribe({
      next: (data) => {
        this.guests = data.content || data;
        this.totalPages = data.totalPages || 0;
        this.totalElements = data.totalElements || 0;
        this.currentPage = data.number || 0;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Failed to load guests.';
        this.loading = false;
      }
    });
  }

  viewGuest(guest: Guest) {
    alert(`Guest Details:\nID: ${guest.guestId}\nName: ${guest.name}\nEmail: ${guest.email}\nPhone: ${guest.phone}\nAddress: ${guest.address}\nPassword: ${guest.password}`);
  }

  editGuest(guest: Guest) {
    this.editingRow = guest;
    this.editGuestData = { ...guest };
    this.showEditModal = true;
  }

  saveEditGuest() {
    if (!this.editingRow || !this.editGuestData.guestId) return;
    this.loading = true;
    this.guestService.update(this.editGuestData.guestId, this.editGuestData).subscribe({
      next: (updated) => {
        const idx = this.guests.findIndex(g => g.guestId === updated.guestId);
        if (idx !== -1) this.guests[idx] = updated;
    this.showEditModal = false;
    this.editingRow = null;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Failed to update guest.';
        this.loading = false;
      }
    });
  }

  deleteGuest(guest: Guest) {
    if (!guest.guestId) return;
    if (confirm(`Are you sure you want to delete guest: ${guest.name}?`)) {
      this.loading = true;
      this.guestService.delete(guest.guestId).subscribe({
        next: () => {
          // Refresh the current page to get updated data
          this.fetchGuests();
        },
        error: (err) => {
          this.errorMsg = 'Failed to delete guest.';
          this.loading = false;
        }
      });
    }
  }

  openModal(modalType: 'add' | 'edit') {
    if (modalType === 'add') {
      this.showAddModal = true;
      this.newGuest = { name: '', email: '', phone: '', address: '', password: '' };
    } else {
      this.showEditModal = true;
    }
  }

  closeModal(modalType: 'add' | 'edit') {
    if (modalType === 'add') {
      this.showAddModal = false;
    } else {
      this.showEditModal = false;
      this.editingRow = null;
    }
  }

  addGuest() {
    if (!this.newGuest.name || !this.newGuest.email || !this.newGuest.phone || !this.newGuest.address || !this.newGuest.password) {
      alert('Please fill in all fields.');
      return;
    }
    this.loading = true;
    this.guestService.create(this.newGuest).subscribe({
      next: (created) => {
        // Go to first page to see the new guest
        this.currentPage = 0;
        this.fetchGuests();
    this.showAddModal = false;
    this.newGuest = { name: '', email: '', phone: '', address: '', password: '' };
      },
      error: (err) => {
        this.errorMsg = 'Failed to add guest.';
        this.loading = false;
      }
    });
  }

  togglePassword() {
    const pwd = this.addGuestPassword.nativeElement;
    const eye = this.addEyeIcon.nativeElement;
    
    if (pwd.type === 'password') {
      pwd.type = 'text';
      eye.classList.remove('fa-eye');
      eye.classList.add('fa-eye-slash');
    } else {
      pwd.type = 'password';
      eye.classList.remove('fa-eye-slash');
      eye.classList.add('fa-eye');
    }
  }

  toggleEditPassword() {
    const pwd = this.editGuestPassword.nativeElement;
    const eye = this.editEyeIcon.nativeElement;
    
    if (pwd.type === 'password') {
      pwd.type = 'text';
      eye.classList.remove('fa-eye');
      eye.classList.add('fa-eye-slash');
    } else {
      pwd.type = 'password';
      eye.classList.remove('fa-eye-slash');
      eye.classList.add('fa-eye');
    }
  }

  onSearchFilterChange() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 0;
      this.fetchGuests();
    }, 300);
  }

  // Pagination methods
  onPageChange(page: number) {
    this.currentPage = page;
    this.fetchGuests();
  }

  onSort(column: string) {
    if (this.sortBy === column) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDir = 'asc';
    }
    this.currentPage = 0; // Reset to first page when sorting
    this.fetchGuests();
  }

  onPageSizeChange() {
    this.currentPage = 0; // Reset to first page when changing page size
    this.fetchGuests();
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

  getMaskedPassword(password: string | undefined): string {
    return password ? '*'.repeat(password.length) : '';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
