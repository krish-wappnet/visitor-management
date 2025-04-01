import { createFeatureSelector, createSelector } from '@ngrx/store';
import { adapter, VisitorState } from './visitors.state';

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
    return visitor ? JSON.stringify(visitor) : null;
  }
);