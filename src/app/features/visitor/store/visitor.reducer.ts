import { createReducer, on } from '@ngrx/store';
import { addVisitor, removeVisitor } from './visitor.actions';
import { Visitor } from './visitor.model';

export interface VisitorState {
  visitors: Visitor[];
}

export const initialState: VisitorState = {
  visitors: []
};

export const visitorReducer = createReducer(
  initialState,
  on(addVisitor, (state, { visitor }) => ({
    ...state,
    visitors: [...state.visitors, visitor] // Adds the new visitor to the list
  })),
  on(removeVisitor, (state, { visitorId }) => ({
    ...state,
    visitors: state.visitors.filter(visitor => visitor.id !== visitorId) // Removes the visitor by ID
  }))
);
