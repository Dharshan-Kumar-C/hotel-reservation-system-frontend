import { Component, ViewChild, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin {
  @ViewChild('adminPassword') adminPassword!: ElementRef;
  @ViewChild('adminShowPass') adminShowPass!: ElementRef;
  @ViewChild('adminError') adminError!: ElementRef;
  username = '';
  password = '';

  constructor(private router: Router) {}

  togglePassword() {
    const passInput = this.adminPassword.nativeElement;
    const icon = this.adminShowPass.nativeElement;
    if (passInput.type === 'password') {
      passInput.type = 'text';
      icon.classList.add('active');
    } else {
      passInput.type = 'password';
      icon.classList.remove('active');
    }
  }

  onSubmit() {
    if (!this.username.trim() || !this.password.trim()) {
      this.adminError.nativeElement.textContent = 'Please enter both username/email and password.';
      this.adminError.nativeElement.style.display = 'block';
      return;
    }
    alert('Admin login successful! Redirecting to admin-dashboard.');
    this.router.navigate(['/admin-dashboard']);
  }
}
