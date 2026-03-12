"use client"

import { useSearchParams } from 'next/navigation'
import React, { Suspense } from 'react'

const errorMessage: Record<string, string> = {
  UNAUTHORIZED: "You are not authorized to perform this action",
  NETWORK: "Network error. Please check your connection",
  SERVER: "Something went wrong on the server",
  DEFAULT: "An unexpected error occurred"
}

const ErrorContent = () => {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const message = errorMessage[code ?? "DEFAULT"];

  return (
    <div className="max-w-md text-center">
      <h1 className="text-2xl font-semibold text-red-700 mb-2">Error</h1>
      <p className="text-gray-600">{message}</p>
    </div>
  )
}

const ErrorPage = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
        <ErrorContent />
      </Suspense>
    </div>
  )
}

export default ErrorPage
