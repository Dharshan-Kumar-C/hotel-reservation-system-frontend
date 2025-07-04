import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationGuest } from './reservation-guest';

describe('ReservationGuest', () => {
  let component: ReservationGuest;
  let fixture: ComponentFixture<ReservationGuest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationGuest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationGuest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
