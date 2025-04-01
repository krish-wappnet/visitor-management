import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { VisitorService } from './visitor.service';
import { loadVisitors, loadVisitorsSuccess } from './visitor.actions';
import { mergeMap, map } from 'rxjs/operators';

@Injectable()
export class VisitorEffects {
  loadVisitors$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadVisitors),
      mergeMap(() =>
        this.visitorService.getVisitors().pipe(
          map(visitors => loadVisitorsSuccess({ visitors }))
        )
      )
    )
  );

  constructor(private actions$: Actions, private visitorService: VisitorService) {}
}
