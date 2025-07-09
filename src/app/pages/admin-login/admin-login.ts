import { Component, ViewChild, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [RouterLink, RouterLinkActive, FormsModule, CommonModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin {
  @ViewChild('adminPassword') adminPassword!: ElementRef;
  @ViewChild('adminShowPass') adminShowPass!: ElementRef;
  @ViewChild('adminError') adminError!: ElementRef;
  username = '';
  password = '';
  loading = false;

  constructor(private router: Router, private authService: AuthService) {}

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
    this.username = this.username.trim();
    this.password = this.password.trim();
    if (!this.username || !this.password) {
      this.adminError.nativeElement.textContent = 'Please enter both username/email and password.';
      this.adminError.nativeElement.style.display = 'block';
      return;
    }
    this.loading = true;
    this.adminError.nativeElement.style.display = 'none';
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.loading = false;
        alert('Login successful! Redirecting to admin dashboard.');
        this.router.navigate(['/admin-dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.adminError.nativeElement.textContent = err;
        this.adminError.nativeElement.style.display = 'block';
      }
    });
  }
}
