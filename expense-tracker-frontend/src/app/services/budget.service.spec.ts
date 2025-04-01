import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { BudgetService } from './budget.service';
import { Budget } from '../models/budget.model';

describe('BudgetService', () => {
  let service: BudgetService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BudgetService]
    });
    service = TestBed.inject(BudgetService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all budgets', () => {
    const mockBudgets: Budget[] = [
      { 
        id: 1, 
        name: 'Groceries', 
        amount: 500, 
        spent: 250,
        startDate: new Date(), 
        endDate: new Date(), 
        isRecurring: true, 
        recurringFrequency: 'monthly' 
      }
    ];

    service.getBudgets().subscribe(budgets => {
      expect(budgets).toEqual(mockBudgets);
    });

    const req = httpMock.expectOne('http://localhost:5000/api/budgets');
    expect(req.request.method).toBe('GET');
    req.flush(mockBudgets);
  });
});
