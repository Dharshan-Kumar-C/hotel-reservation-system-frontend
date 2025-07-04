import { Component, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-guests',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './guests.html',
  styleUrl: './guests.css'
})
export class Guests {
  @ViewChild('addGuestModal') addGuestModal!: ElementRef;
  @ViewChild('editGuestModal') editGuestModal!: ElementRef;
  @ViewChild('addGuestPassword') addGuestPassword!: ElementRef;
  @ViewChild('addEyeIcon') addEyeIcon!: ElementRef;
  @ViewChild('guestNameFilter') guestNameFilter!: ElementRef;

  guests = [
    {
      id: 1,
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1 234 567 890',
      address: '123 Main St',
      password: 'password123'
    },
    {
      id: 2,
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+1 987 654 321',
      address: '456 Oak Ave',
      password: 'secret456'
    }
  ];

  editingRow: any = null;
  guestIdCounter = 3;
  showAddModal = false;
  showEditModal = false;

  // Form data for add guest
  newGuest = {
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  };

  // Form data for edit guest
  editGuestData = {
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  };

  searchFilter = '';

  viewGuest(guest: any) {
    alert(`Guest Details:\nID: ${guest.id}\nName: ${guest.name}\nEmail: ${guest.email}\nPhone: ${guest.phone}\nAddress: ${guest.address}\nPassword: ${guest.password}`);
  }

  editGuest(guest: any) {
    this.editingRow = guest;
    this.editGuestData = { ...guest };
    this.showEditModal = true;
  }

  saveEditGuest() {
    if (!this.editingRow) return;
    
    const index = this.guests.findIndex(g => g.id === this.editingRow.id);
    if (index !== -1) {
      this.guests[index] = { ...this.editGuestData, id: this.editingRow.id };
    }
    
    this.showEditModal = false;
    this.editingRow = null;
  }

  deleteGuest(guest: any) {
    if (confirm(`Are you sure you want to delete guest: ${guest.name}?`)) {
      this.guests = this.guests.filter(g => g.id !== guest.id);
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

    const newGuest = {
      id: this.guestIdCounter++,
      ...this.newGuest
    };

    this.guests.push(newGuest);
    this.showAddModal = false;
    this.newGuest = { name: '', email: '', phone: '', address: '', password: '' };
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

  get filteredGuests() {
    if (!this.searchFilter.trim()) {
      return this.guests;
    }
    
    const filter = this.searchFilter.toLowerCase();
    return this.guests.filter(guest => 
      guest.name.toLowerCase().includes(filter)
    );
  }

  getMaskedPassword(password: string): string {
    return '*'.repeat(password.length);
  }
}
