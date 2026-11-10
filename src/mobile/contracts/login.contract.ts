import type { AuthenticationState } from '../models/authentication-state.js';
export interface Login {
  open(): Promise<void>;
  submit(username: string, password: string): Promise<void>;
  errorVisible(): Promise<boolean>;
  formVisible(): Promise<boolean>;
  readAuthenticationMenu(): Promise<AuthenticationState>;
}
