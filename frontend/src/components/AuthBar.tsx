"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import AuthModal from "./AuthModal";

export default function AuthBar() {
  const { user, isLoading, signOut } = useAuth();
  const [modalMode, setModalMode] = useState<"signin" | "signup" | null>(null);

  return (
    <header
      className="flex items-center justify-between border-b border-slate-200 px-6 py-3"
      style={{ backgroundColor: "#032147" }}
    >
      <span className="text-sm font-semibold text-white">Prelegal</span>

      <div className="flex items-center gap-3 text-sm">
        {isLoading ? null : user ? (
          <>
            <span className="text-slate-200">{user.email}</span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-md px-3 py-1.5 font-medium text-white"
              style={{ backgroundColor: "#753991" }}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setModalMode("signin")}
              className="font-medium text-white hover:underline"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setModalMode("signup")}
              className="rounded-md px-3 py-1.5 font-medium text-white"
              style={{ backgroundColor: "#ecad0a", color: "#032147" }}
            >
              Sign up
            </button>
          </>
        )}
      </div>

      {modalMode && (
        <AuthModal initialMode={modalMode} onClose={() => setModalMode(null)} />
      )}
    </header>
  );
}
