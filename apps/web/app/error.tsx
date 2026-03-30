'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}): JSX.Element {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="bg-red-50 text-red-600 rounded-full p-4 mb-4">
        <AlertCircle size={48} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        We encountered an unexpected error. Please try again or contact support if the problem persists.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-amber-600 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
      >
        Try again
      </button>
    </div>
  )
}
