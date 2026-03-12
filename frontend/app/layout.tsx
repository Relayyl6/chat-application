import type { Metadata } from "next";
import "./globals.css";
import ContextProvider from "@/context/useContext";

import Sidebar from '@/components/Sidebar';
import { MobileSidebar } from '@/components/Sidebar';

// Inside your JSX:


export const metadata: Metadata = {
  title: "WeChat",
  description: "Welcome to the We Chat chat application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ContextProvider>
          {children}
        </ContextProvider>
      </body>
    </html>
  );
}
