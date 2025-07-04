import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestLogin } from './guest-login';

describe('GuestLogin', () => {
  let component: GuestLogin;
  let fixture: ComponentFixture<GuestLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestLogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestLogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
