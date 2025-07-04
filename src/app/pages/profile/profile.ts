import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  profile = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 890',
    address: '123 Main St, City, Country',
    password: 'password123'
  };

  editMode = false;
  showMsg = false;
  errorMsg = '';
  showPassword = false;

  editProfile = { ...this.profile };

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
    this.errorMsg = '';
    this.profile = { ...this.editProfile };
    this.editMode = false;
    this.showMsg = true;
    setTimeout(() => {
      this.showMsg = false;
    }, 5000);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
