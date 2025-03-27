import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryIconSelectorComponent } from './category-icon-selector.component';

describe('CategoryIconSelectorComponent', () => {
  let component: CategoryIconSelectorComponent;
  let fixture: ComponentFixture<CategoryIconSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryIconSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryIconSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
