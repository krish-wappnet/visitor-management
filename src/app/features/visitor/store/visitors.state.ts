import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

export interface Visitor {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  checkIn: Date;
  checkOut?: Date;
  email?: string; // Add email field
}

export interface VisitorState extends EntityState<Visitor> {
  latestVisitorId: string | null;
}

export const adapter: EntityAdapter<Visitor> = createEntityAdapter<Visitor>();
export const initialState: VisitorState = adapter.getInitialState({
  latestVisitorId: null,
});