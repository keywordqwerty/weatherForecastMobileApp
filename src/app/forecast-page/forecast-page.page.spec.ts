import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForecastPagePage } from './forecast-page.page';

describe('ForecastPagePage', () => {
  let component: ForecastPagePage;
  let fixture: ComponentFixture<ForecastPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
