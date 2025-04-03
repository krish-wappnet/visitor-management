// src/app/features/visitor/store/visitor.actions.ts
import { createAction, props } from '@ngrx/store';
import { Visitor } from './visitor.model'; // Import from visitor.model.ts

export const checkInVisitor = createAction('[Visitor] Check In', props<{ visitor: Visitor }>());
export const checkOutVisitor = createAction('[Visitor] Check Out', props<{ id: string }>());

export const loadVisitors = createAction(
  '[Visitor] Load Visitors',
  props<{ email: string }>() // Fetch based on user email
);

export const loadVisitorsSuccess = createAction(
  '[Visitor] Load Visitors Success',
  props<{ visitors: Visitor[] }>()
);