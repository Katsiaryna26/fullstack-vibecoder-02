import { LogIn } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import {
  getUserDisplayName,
  getUserInitials,
} from "@/features/auth/model/use-auth-user";

type AppHeaderProps = {
  user: User | null;
  isLoading: boolean;
};

export function AppHeader({ user, isLoading }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header-copy">
        <p className="app-header-eyebrow">Relay workspace</p>
        <p className="app-header-title">Client inbox</p>
      </div>

      <div className="auth-area" aria-live="polite">
        {isLoading ? <span className="auth-loading">Checking session…</span> : null}

        {!isLoading && user ? (
          <div className="auth-user">
            <span className="auth-avatar" aria-hidden="true">
              {getUserInitials(user)}
            </span>
            <span className="auth-user-copy">
              <strong>{getUserDisplayName(user)}</strong>
              <span>{user.email}</span>
            </span>
          </div>
        ) : null}

        {!isLoading && !user ? (
          <a className="login-link" href="/login">
            <LogIn size={16} aria-hidden="true" />
            Log in
          </a>
        ) : null}
      </div>
    </header>
  );
}
