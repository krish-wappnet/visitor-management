// src/app/features/visitor/store/visitor.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { adapter, initialState, VisitorState } from './visitors.state';
import { checkInVisitor, checkOutVisitor } from './visitor.actions';

export const visitorReducer = createReducer(
  initialState,
  on(checkInVisitor, (state: VisitorState, { visitor }) => {
    return adapter.addOne(visitor, {
      ...state,
      latestVisitorId: visitor.id, // Set the latest visitor ID
    });
  }),
  on(checkOutVisitor, (state: VisitorState, { id }) => {
    return adapter.updateOne(
      { 
        id, 
        changes: { 
          checkOut: new Date(), 
          isCheckedIn: false // Update isCheckedIn to reflect checkout
        } 
      },
      { ...state }
    );
  })
);