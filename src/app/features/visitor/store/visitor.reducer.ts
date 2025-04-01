import { createReducer, on } from '@ngrx/store';
import { adapter, initialState, VisitorState } from './visitors.state';
import { checkInVisitor, checkOutVisitor } from './visitor.actions';

export const visitorReducer = createReducer(
  initialState,
  on(checkInVisitor, (state, { visitor }) => ({
    ...adapter.addOne(visitor, state),
    latestVisitorId: visitor.id,
  })),
  on(checkOutVisitor, (state, { id }) =>
    adapter.updateOne({ id, changes: { checkOut: new Date() } }, state)
  )
);