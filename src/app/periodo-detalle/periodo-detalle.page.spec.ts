import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PeriodoDetallePage } from './periodo-detalle.page';

describe('PeriodoDetallePage', () => {
  let component: PeriodoDetallePage;
  let fixture: ComponentFixture<PeriodoDetallePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodoDetallePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
