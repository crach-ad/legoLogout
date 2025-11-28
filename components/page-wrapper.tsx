'use client'

import Image from 'next/image'

interface PageWrapperProps {
  children: React.ReactNode
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="min-h-screen relative bg-slate-900">
      {/* Background Image with 10% opacity */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/kcsb-background.png"
          alt="Background"
          fill
          className="object-cover opacity-10"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
