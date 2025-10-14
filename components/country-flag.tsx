"use client"

import { useState } from 'react'
import { getCountryFlagUrl, getCountryFlag } from '@/lib/country-flags'

interface CountryFlagProps {
  country: string | null | undefined
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CountryFlag({ country, size = 'md', className = '' }: CountryFlagProps) {
  const [imageError, setImageError] = useState(false)
  const flagUrl = getCountryFlagUrl(country)
  
  const sizeClasses = {
    sm: 'w-6 h-4',
    md: 'w-8 h-6',
    lg: 'w-12 h-8'
  }
  
  const emojiSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  }
  
  if (!flagUrl || imageError) {
    return (
      <span className={`${emojiSizes[size]} ${className}`}>
        {getCountryFlag(country)}
      </span>
    )
  }
  
  return (
    <img 
      src={flagUrl} 
      alt={`Drapeau ${country}`}
      className={`${sizeClasses[size]} object-cover rounded shadow-sm ${className}`}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  )
}

