import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService, Room } from '../../services/room.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-rooms',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './rooms.html',
  styleUrl: './rooms.css'
})
export class Rooms implements OnInit {
  @ViewChild('addRoomModal') addRoomModal!: ElementRef;
  @ViewChild('editRoomModal') editRoomModal!: ElementRef;

  rooms: Room[] = [];
  editingRoom: Room | null = null;
  showAddModal = false;
  showEditModal = false;
  loading = false;
  errorMsg = '';

  // Pagination properties
  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  totalElements = 0;
  sortBy = 'amount';
  sortDir = 'asc';

  // Form data for add room
  newRoom: Room = {
    roomNumber: '',
    type: '',
    amount: 0,
    status: ''
  };

  // Form data for edit room
  editRoomData: Room = {
    roomNumber: '',
    type: '',
    amount: 0,
    status: ''
  };

  // Filter values
  typeFilter = '';
  statusFilter = '';

  constructor(
    private roomService: RoomService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchRooms();
  }

  fetchRooms() {
    this.loading = true;
    this.roomService.getPaged(this.currentPage, this.pageSize, this.sortBy, this.sortDir, this.typeFilter, this.statusFilter).subscribe({
      next: (data) => {
        this.rooms = data.content || data;
        this.totalPages = data.totalPages || 0;
        this.totalElements = data.totalElements || 0;
        this.currentPage = data.number || 0;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Failed to load rooms.';
        this.loading = false;
      }
    });
  }

  viewRoom(room: Room) {
    alert(`Room Details:\nRoom ID: ${room.roomId}\nRoom Number: ${room.roomNumber}\nType: ${room.type}\nPrice: ₹${room.amount}\nStatus: ${room.status}`);
  }

  editRoom(room: Room) {
    this.editingRoom = room;
    this.editRoomData = { ...room };
    this.showEditModal = true;
  }

  saveEditRoom() {
    if (!this.editingRoom || !this.editRoomData.roomId) return;
    this.loading = true;
    this.roomService.update(this.editRoomData.roomId, this.editRoomData).subscribe({
      next: (updated) => {
        const idx = this.rooms.findIndex(r => r.roomId === updated.roomId);
        if (idx !== -1) this.rooms[idx] = updated;
    this.showEditModal = false;
    this.editingRoom = null;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Failed to update room.';
        this.loading = false;
      }
    });
  }

  deleteRoom(room: Room) {
    if (!room.roomId) return;
    if (confirm(`Are you sure you want to delete room: ${room.roomNumber}?`)) {
      this.loading = true;
      this.roomService.delete(room.roomId).subscribe({
        next: () => {
          // Refresh the current page to get updated data
          this.fetchRooms();
        },
        error: (err) => {
          this.errorMsg = 'Failed to delete room.';
          this.loading = false;
        }
      });
    }
  }

  openModal(modalType: 'add' | 'edit') {
    if (modalType === 'add') {
      this.showAddModal = true;
      this.newRoom = { roomNumber: '', type: '', amount: 0, status: '' };
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
    if (!this.newRoom.roomNumber || !this.newRoom.type || !this.newRoom.amount || !this.newRoom.status) {
      alert('Please fill in all fields.');
      return;
    }
    this.loading = true;
    this.roomService.create(this.newRoom).subscribe({
      next: (created) => {
        // Go to first page to see the new room
        this.currentPage = 0;
        this.fetchRooms();
    this.showAddModal = false;
        this.newRoom = { roomNumber: '', type: '', amount: 0, status: '' };
      },
      error: (err) => {
        this.errorMsg = 'Failed to add room.';
        this.loading = false;
      }
    });
  }

  // Pagination methods
  onPageChange(page: number) {
    this.currentPage = page;
    this.fetchRooms();
  }

  onSort(column: string) {
    if (this.sortBy === column) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDir = 'asc';
    }
    this.currentPage = 0; // Reset to first page when sorting
    this.fetchRooms();
  }

  onPageSizeChange() {
    this.currentPage = 0; // Reset to first page when changing page size
    this.fetchRooms();
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

  onTypeFilterChange() {
    this.currentPage = 0;
    this.fetchRooms();
  }

  onStatusFilterChange() {
    this.currentPage = 0;
    this.fetchRooms();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Available': return 'green';
      case 'Occupied': return 'orange';
      case 'Maintenance': return 'red';
      default: return 'green';
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
