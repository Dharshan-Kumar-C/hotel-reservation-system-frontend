import { Component, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rooms',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './rooms.html',
  styleUrl: './rooms.css'
})
export class Rooms {
  @ViewChild('addRoomModal') addRoomModal!: ElementRef;
  @ViewChild('editRoomModal') editRoomModal!: ElementRef;

  rooms = [
    {
      id: 1,
      roomNumber: '201',
      type: 'Deluxe',
      price: 120,
      status: 'Available'
    },
    {
      id: 2,
      roomNumber: '105',
      type: 'Standard',
      price: 80,
      status: 'Occupied'
    }
  ];

  editingRoom: any = null;
  roomIdCounter = 3;
  showAddModal = false;
  showEditModal = false;

  // Form data for add room
  newRoom = {
    roomNumber: '',
    type: '',
    price: 0,
    status: ''
  };

  // Form data for edit room
  editRoomData = {
    roomNumber: '',
    type: '',
    price: 0,
    status: ''
  };

  // Filter values
  typeFilter = '';
  statusFilter = '';

  viewRoom(room: any) {
    alert(`Room Details:\nRoom ID: ${room.id}\nRoom Number: ${room.roomNumber}\nType: ${room.type}\nPrice: $${room.price}\nStatus: ${room.status}`);
  }

  editRoom(room: any) {
    this.editingRoom = room;
    this.editRoomData = { ...room };
    this.showEditModal = true;
  }

  saveEditRoom() {
    if (!this.editingRoom) return;
    
    const index = this.rooms.findIndex(r => r.id === this.editingRoom.id);
    if (index !== -1) {
      this.rooms[index] = { ...this.editRoomData, id: this.editingRoom.id };
    }
    
    this.showEditModal = false;
    this.editingRoom = null;
  }

  deleteRoom(room: any) {
    if (confirm(`Are you sure you want to delete room: ${room.roomNumber}?`)) {
      this.rooms = this.rooms.filter(r => r.id !== room.id);
    }
  }

  openModal(modalType: 'add' | 'edit') {
    if (modalType === 'add') {
      this.showAddModal = true;
      this.newRoom = { roomNumber: '', type: '', price: 0, status: '' };
    } else {
      this.showEditModal = true;
    }
  }

  closeModal(modalType: 'add' | 'edit') {
    if (modalType === 'add') {
      this.showAddModal = false;
    } else {
      this.showEditModal = false;
      this.editingRoom = null;
    }
  }

  addRoom() {
    if (!this.newRoom.roomNumber || !this.newRoom.type || !this.newRoom.price || !this.newRoom.status) {
      alert('Please fill in all fields.');
      return;
    }

    const newRoom = {
      id: this.roomIdCounter++,
      ...this.newRoom
    };

    this.rooms.push(newRoom);
    this.showAddModal = false;
    this.newRoom = { roomNumber: '', type: '', price: 0, status: '' };
  }

  get filteredRooms() {
    return this.rooms.filter(room => {
      let show = true;
      if (this.typeFilter && room.type !== this.typeFilter) show = false;
      if (this.statusFilter && room.status !== this.statusFilter) show = false;
      return show;
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Available': return 'green';
      case 'Occupied': return 'orange';
      case 'Maintenance': return 'red';
      default: return 'green';
    }
  }
}
