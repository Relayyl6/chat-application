// app/(auth)/layout.tsx
"use client";

import AppTheme from '@/components/Apptheme';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AppTheme disableCustomTheme={false}>{children}</AppTheme>;
}
