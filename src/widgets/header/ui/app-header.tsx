import { useState } from "react";
import { LoaderCircle, LogIn, LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import {
  getUserDisplayName,
  getUserInitials,
} from "@/features/auth/model/use-auth-user";
import { signOut } from "@/features/auth/api/auth-api";

type AppHeaderProps = {
  user: User | null;
  isLoading: boolean;
};

export function AppHeader({ user, isLoading }: AppHeaderProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  async function handleSignOut() {
    if (isSigningOut) return;

    setSignOutError(null);
    setIsSigningOut(true);

    try {
      await signOut();
    } catch (error) {
      setSignOutError(getSignOutErrorMessage(error));
      setIsSigningOut(false);
    }
  }

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
            <button
              className="logout-button"
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              title="Log out"
            >
              {isSigningOut ? (
                <LoaderCircle className="spin" size={15} aria-hidden="true" />
              ) : (
                <LogOut size={15} aria-hidden="true" />
              )}
              <span>{isSigningOut ? "Logging out…" : "Log out"}</span>
            </button>
          </div>
        ) : null}

        {signOutError ? (
          <span className="auth-error" role="alert">
            {signOutError}
          </span>
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

function getSignOutErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to log out. Please try again.";
}
