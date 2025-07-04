import { Component, ViewChild, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  constructor(private router: Router) {}

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
    if (!this.email.trim() || !this.password.trim()) {
      this.guestError.nativeElement.textContent = 'Please enter both email and password.';
      this.guestError.nativeElement.style.display = 'block';
      return;
    }
    alert('Guest login successful! Redirecting to guest-dashboard.');
    this.router.navigate(['/guest-dashboard']);
  }

  showRegister(e: Event) {
    e.preventDefault();
    this.showRegisterForm = true;
  }

  backToLogin(e: Event) {
    e.preventDefault();
    this.showRegisterForm = false;
  }

  onRegisterSubmit() {
    if (!this.name.trim() || !this.regEmail.trim() || !this.address.trim() || !this.phone.trim() || !this.regPasswordValue.trim()) {
      this.regError.nativeElement.textContent = 'Please fill all fields.';
      this.regError.nativeElement.style.display = 'block';
      return;
    }
    this.regError.nativeElement.style.display = 'none';
    alert('Registration successful! You can now log in.');
    // Reset registration fields
    this.name = '';
    this.regEmail = '';
    this.address = '';
    this.phone = '';
    this.regPasswordValue = '';
    this.showRegisterForm = false;
  }
}
