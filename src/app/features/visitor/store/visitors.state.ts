// src/app/features/visitor/store/visitors.state.ts
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Visitor } from './visitor.model'; // Import from visitor.model.ts

export interface VisitorState extends EntityState<Visitor> {
  latestVisitorId: string | null;
}

export const adapter: EntityAdapter<Visitor> = createEntityAdapter<Visitor>();
export const initialState: VisitorState = adapter.getInitialState({
  latestVisitorId: null,
});