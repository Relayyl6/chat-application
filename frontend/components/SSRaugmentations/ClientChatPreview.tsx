"use client"

// making the client preview/sidebar to now be SSR since that is causing hydratin issues when reorering and adding new message
import dynamic from "next/dynamic";

export const ChatPreview = dynamic(() => import("@/components/ChatPreview"), {
    ssr: false,
});