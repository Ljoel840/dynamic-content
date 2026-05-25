'use client';

import { useEffect, useState, type ReactNode } from "react";
import MobileMenu from "./MobileMenu";
import LoginForm from "./LoginForm";
import { clearToken, getStoredToken, validateSession } from "../services/auth";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getStoredToken();
	  console.log('Stored token:', token);
      if (!token) {
        setAuthenticated(false);
        return;
      }

      const valid = await validateSession(token);
      setAuthenticated(valid);
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    clearToken();
    setAuthenticated(false);
  };

  const handleLoginSuccess = () => {
    setAuthenticated(true);
  };

  return (
    <>
      {authenticated === null ? (
        <div className="flex min-h-screen items-center justify-center">
          <div className="rounded-xl bg-white p-6 shadow-lg">Validando sesión...</div>
        </div>
      ) : authenticated === false ? (
        <LoginForm onSuccess={handleLoginSuccess} />
      ) : (
        <MobileMenu onLogout={handleLogout}>{children}</MobileMenu>
      )}
    </>
  );
}