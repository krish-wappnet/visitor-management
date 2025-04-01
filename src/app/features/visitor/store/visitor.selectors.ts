import { createFeatureSelector, createSelector } from '@ngrx/store';
import { VisitorState } from './visitor.reducer'; // Import your visitor reducer state type

// Select the feature state for visitors
export const getVisitorState = createFeatureSelector<VisitorState>('visitor');

// Selector to get the list of visitors
export const getVisitors = createSelector(
  getVisitorState,
  (state: VisitorState) => state.visitors
);
