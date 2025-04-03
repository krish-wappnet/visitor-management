// auth.state.ts
export interface AuthState {
  user: { uid: string; email: string | null; role: string | null; status: string | null; token: string } | null;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  error: null,
};