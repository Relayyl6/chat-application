"use client";

import AppTheme from '@/components/Apptheme';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <AppTheme>
      {children}
    </AppTheme>
  );
}