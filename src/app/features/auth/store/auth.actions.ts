import { createAction, props } from '@ngrx/store';

export const loginSuccess = createAction('[Auth] Login Success', props<{ user: any }>());
export const logout = createAction('[Auth] Logout');
export const loadUserFromStorage = createAction('[Auth] Load User From Storage', props<{ user: any }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());