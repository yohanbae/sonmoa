import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeememberComponent } from './seemember.component';

describe('SeememberComponent', () => {
  let component: SeememberComponent;
  let fixture: ComponentFixture<SeememberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeememberComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeememberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
