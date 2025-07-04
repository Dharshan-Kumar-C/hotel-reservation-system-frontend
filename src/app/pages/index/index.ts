import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-index',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './index.html',
  styleUrl: './index.css'
})
export class Index implements OnInit, OnDestroy {
  images = [
    '/assets/images/hotel-banner1.jpg',
    '/assets/images/hotel-banner2.jpg',
    '/assets/images/hotel-banner3.jpg',
    '/assets/images/hotel-banner4.jpg',
    '/assets/images/hotel-banner5.jpg'
  ];
  current = 0;
  sliderInterval: any;

  ngOnInit() {
    this.sliderInterval = setInterval(() => this.nextImage(), 3000);
  }

  ngOnDestroy() {
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
    }
  }

  showImage(idx: number) {
    this.current = idx;
  }

  nextImage() {
    this.current = (this.current + 1) % this.images.length;
  }

  prevImage() {
    this.current = (this.current - 1 + this.images.length) % this.images.length;
  }

  onArrowClick(direction: 'left' | 'right') {
    clearInterval(this.sliderInterval);
    if (direction === 'left') {
      this.prevImage();
    } else {
      this.nextImage();
    }
    this.sliderInterval = setInterval(() => this.nextImage(), 3000);
  }
}