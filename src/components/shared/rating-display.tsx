import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingDisplayProps {
  rating: number
  totalReviews?: number
  size?: 'sm' | 'md' | 'lg'
  showNumber?: boolean
  className?: string
}

export function RatingDisplay({ 
  rating, 
  totalReviews, 
  size = 'md', 
  showNumber = true,
  className 
}: RatingDisplayProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClasses[size],
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            )}
          />
        ))}
      </div>
      {showNumber && (
        <span className={cn('text-gray-600', textSizeClasses[size])}>
          {rating.toFixed(1)}
          {totalReviews !== undefined && (
            <span className="text-gray-500"> ({totalReviews})</span>
          )}
        </span>
      )}
    </div>
  )
}