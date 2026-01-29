"use client"

import TroubleShoot from '@/components/troubleshoot'
import { useSearchParams } from 'next/navigation'
import React from 'react'

const ErrorPage = () => {
    const searchParams = useSearchParams();
    const code = searchParams.get("code");
    const errorMessage: Record<string, string> = {
        UNAUTHORIZED: "You are not authorized to perform this action",
        NETWORK: "Network error. Pleae check your connection",
        SERVER: "Something went wrong on the server",
        DEFAULT: "An unexpected error occured"
    }
    const message = errorMessage[code ?? "DEFAULT"]
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-red-700 mb-2">Error</h1>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}

export default ErrorPage
