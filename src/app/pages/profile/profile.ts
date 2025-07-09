import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Guest } from '../../services/guest-auth.service';
import { ProfileService } from '../../services/profile.service';
import { GuestAuthService } from '../../services/guest-auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  profile: Guest = {
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  };
  editProfile: Guest = { ...this.profile };
  loading = false;
  showMsg = false;
  errorMsg = '';
  showPassword = false;
  editMode = false;

  constructor(
    private profileService: ProfileService,
    private guestAuthService: GuestAuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadGuestProfile();
  }

  private getEmailFromToken(): string | null {
    const token = localStorage.getItem('guest-jwt');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch {
      return null;
    }
  }

  loadGuestProfile() {
    this.loading = true;
    const email = this.getEmailFromToken();
    if (!email) {
      this.errorMsg = 'Not logged in. Please log in again.';
      this.loading = false;
      return;
    }
    this.profileService.getProfileByEmail(email).subscribe({
      next: (guest) => {
        this.profile = guest;
        this.editProfile = { ...this.profile };
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Failed to load profile. Please try again.';
        this.loading = false;
      }
    });
  }

  get maskedPassword() {
    return '*'.repeat(this.profile.password.length);
  }

  onEdit() {
    this.editProfile = { ...this.profile };
    this.editMode = true;
    this.showMsg = false;
    this.errorMsg = '';
  }

  onCancel() {
    this.editMode = false;
    this.errorMsg = '';
  }

  onSubmit() {
    const { name, email, phone, address, password } = this.editProfile;
    if (!name || !email || !phone || !address || !password) {
      this.errorMsg = 'Please fill all fields.';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    if (this.profile.guestId) {
      this.profileService.updateProfile(this.profile.guestId, this.editProfile).subscribe({
        next: (updatedGuest) => {
          this.profile = updatedGuest;
          this.editProfile = { ...this.profile };
    this.editMode = false;
    this.showMsg = true;
          this.loading = false;
    setTimeout(() => {
      this.showMsg = false;
    }, 5000);
        },
        error: () => {
          this.errorMsg = 'Failed to update profile. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.errorMsg = 'Guest ID not found. Please try logging in again.';
      this.loading = false;
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  logout() {
    this.guestAuthService.logout();
    this.router.navigate(['/login']);
  }
}
