import { Component, ViewChild, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GuestAuthService, Guest } from '../../services/guest-auth.service';

@Component({
  selector: 'app-guest-login',
  imports: [RouterLink, RouterLinkActive, FormsModule, CommonModule],
  templateUrl: './guest-login.html',
  styleUrl: './guest-login.css'
})
export class GuestLogin {
  // Login form
  @ViewChild('guestPassword') guestPassword!: ElementRef;
  @ViewChild('guestShowPass') guestShowPass!: ElementRef;
  @ViewChild('guestError') guestError!: ElementRef;
  @ViewChild('guestLoginWrapper') guestLoginWrapper!: ElementRef;
  @ViewChild('guestRegisterWrapper') guestRegisterWrapper!: ElementRef;
  email = '';
  password = '';

  // Register form
  @ViewChild('regPassword') regPassword!: ElementRef;
  @ViewChild('regShowPass') regShowPass!: ElementRef;
  @ViewChild('regError') regError!: ElementRef;
  name = '';
  regEmail = '';
  address = '';
  phone = '';
  regPasswordValue = '';

  showRegisterForm = false;
  isLoading = false;

  constructor(
    private router: Router,
    private guestAuthService: GuestAuthService
  ) {}

  togglePassword(input: 'guest' | 'reg') {
    let passInput, icon;
    if (input === 'guest') {
      passInput = this.guestPassword.nativeElement;
      icon = this.guestShowPass.nativeElement;
    } else {
      passInput = this.regPassword.nativeElement;
      icon = this.regShowPass.nativeElement;
    }
    if (passInput.type === 'password') {
      passInput.type = 'text';
      icon.classList.add('active');
    } else {
      passInput.type = 'password';
      icon.classList.remove('active');
    }
  }

  onGuestLoginSubmit() {
    this.email = this.email.trim();
    this.password = this.password.trim();
    if (!this.email || !this.password) {
      this.showError('Please enter both email and password.', 'guest');
      return;
    }

    this.isLoading = true;
    this.hideError('guest');

    this.guestAuthService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        alert('Guest login successful! Redirecting to guest dashboard.');
        this.router.navigate(['/guest-dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.showError(error, 'guest');
      }
    });
  }

  showRegister(e: Event) {
    e.preventDefault();
    this.showRegisterForm = true;
    this.hideError('guest');
    this.hideError('reg');
  }

  backToLogin(e: Event) {
    e.preventDefault();
    this.showRegisterForm = false;
    this.hideError('guest');
    this.hideError('reg');
  }

  onRegisterSubmit() {
    if (!this.name.trim() || !this.regEmail.trim() || !this.address.trim() || !this.phone.trim() || !this.regPasswordValue.trim()) {
      this.showError('Please fill all fields.', 'reg');
      return;
    }

    this.isLoading = true;
    this.hideError('reg');

    const guestData: Guest = {
      name: this.name.trim(),
      email: this.regEmail.trim(),
      address: this.address.trim(),
      phone: this.phone.trim(),
      password: this.regPasswordValue
    };

    this.guestAuthService.register(guestData).subscribe({
          next: (response) => {
          this.isLoading = false;
          alert('Registration successful! You can now log in.');
          // Reset registration fields
          this.name = '';
          this.regEmail = '';
          this.address = '';
          this.phone = '';
          this.regPasswordValue = '';
          this.showRegisterForm = false;
          // Redirect to guest login page
          this.router.navigate(['/guest-login']);
        },
        error: (error) => {
          this.isLoading = false;
          alert('Registration successful! You can now log in.');
          // Reset registration fields
          this.name = '';
          this.regEmail = '';
          this.address = '';
          this.phone = '';
          this.regPasswordValue = '';
          this.showRegisterForm = false;
          // Redirect to guest login page
          this.router.navigate(['/guest-login']);
        }
    });
  }

  private showError(message: string, form: 'guest' | 'reg') {
    const errorElement = form === 'guest' ? this.guestError : this.regError;
    errorElement.nativeElement.textContent = message;
    errorElement.nativeElement.style.display = 'block';
  }

  private hideError(form: 'guest' | 'reg') {
    const errorElement = form === 'guest' ? this.guestError : this.regError;
    errorElement.nativeElement.style.display = 'none';
  }
}
