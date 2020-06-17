import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitfriendComponent } from './invitfriend.component';

describe('InvitfriendComponent', () => {
  let component: InvitfriendComponent;
  let fixture: ComponentFixture<InvitfriendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvitfriendComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvitfriendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
