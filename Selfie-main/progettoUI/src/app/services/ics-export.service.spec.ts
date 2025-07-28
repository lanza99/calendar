import { TestBed } from '@angular/core/testing';

import { IcsExportService } from './ics-export.service';

describe('IcsExportService', () => {
  let service: IcsExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IcsExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
