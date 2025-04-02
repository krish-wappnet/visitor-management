export interface AuthState {
    user: { uid: string; email: string | null; role: string | null } | null;
    error: string | null;
  }
  
  export const initialState: AuthState = {
    user: null,
    error: null,
  };