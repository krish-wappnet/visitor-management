// auth.selectors.ts
import { createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthState = (state: { auth: AuthState }) => state.auth;

export const selectUser = createSelector(selectAuthState, (state: AuthState) => state.user);

export const selectUserEmail = createSelector(selectUser, (user) => user?.email);

export const selectUserRole = createSelector(selectUser, (user) => user?.role);

export const selectUserStatus = createSelector(selectUser, (user) => user?.status);

export const selectUserToken = createSelector(selectUser, (user) => user?.token);