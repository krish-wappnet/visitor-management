// src/app/features/visitor/store/visitor.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { adapter, VisitorState } from './visitors.state';
import { Visitor } from './visitor.model'; // Import from visitor.model.ts

export const selectVisitorState = createFeatureSelector<VisitorState>('visitors');
export const { selectAll: selectAllVisitors } = adapter.getSelectors(selectVisitorState);

export const selectLatestVisitorId = createSelector(
  selectVisitorState,
  (state) => state.latestVisitorId
);

export const selectLatestVisitor = createSelector(
  selectAllVisitors,
  selectLatestVisitorId,
  (visitors, latestId) => {
    const visitor = visitors.find((v) => v.id === latestId);
    return visitor || null; // Return Visitor | null
  }
);