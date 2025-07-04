import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentGuest } from './payment-guest';

describe('PaymentGuest', () => {
  let component: PaymentGuest;
  let fixture: ComponentFixture<PaymentGuest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentGuest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentGuest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
