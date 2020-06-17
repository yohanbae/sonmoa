import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostgroupprayerComponent } from './postgroupprayer.component';

describe('PostgroupprayerComponent', () => {
  let component: PostgroupprayerComponent;
  let fixture: ComponentFixture<PostgroupprayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostgroupprayerComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostgroupprayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
