import { createAction, props } from '@ngrx/store';
import { Visitor } from './visitors.state';

export const checkInVisitor = createAction('[Visitor] Check In', props<{ visitor: Visitor }>());
export const checkOutVisitor = createAction('[Visitor] Check Out', props<{ id: string }>());