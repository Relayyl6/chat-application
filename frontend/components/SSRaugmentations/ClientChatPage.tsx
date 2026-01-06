// app/(root)/chat/chatsection/[id]/ClientPage.tsx
"use client";

// making the entire chat page to now be SSR since that is causing hydratin issues when reorering and adding new message
import dynamic from "next/dynamic";

export const ClientPage = dynamic(() => import("./ClientPage"), {
  ssr: false,
});

export default function PageWrapper() {
  return <ClientPage />;
}