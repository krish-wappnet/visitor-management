import { createAction, props } from '@ngrx/store';
import { Visitor } from './visitor.model';

// Action to load visitors
export const loadVisitors = createAction('[Visitor] Load Visitors');

// Action to handle successful loading of visitors
export const loadVisitorsSuccess = createAction(
  '[Visitor] Load Visitors Success',
  props<{ visitors: Visitor[] }>()
);

// Action to handle errors (optional but good practice)
export const loadVisitorsFailure = createAction(
  '[Visitor] Load Visitors Failure',
  props<{ error: string }>()
);

// Action to add a visitor
export const addVisitor = createAction(
  '[Visitor] Add Visitor',
  props<{ visitor: Visitor }>()
);

// Action to remove a visitor
export const removeVisitor = createAction(
  '[Visitor] Remove Visitor',
  props<{ visitorId: string }>()
);
