'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { format } from 'date-fns'
import { ReviewModal } from './review-modal'
import { RatingDisplay } from './rating-display'

interface Review {
  id: string
  task_id: string
  reviewer_id: string
  reviewed_id: string
  rating: number
  comment: string | null
  created_at: string
  reviewer: {
    full_name: string
    avatar_url: string | null
  }
  reviewed: {
    full_name: string
  }
}

interface ReviewSectionProps {
  task: {
    id: string
    title: string
    customer_id: string
    tasker_id: string
  }
  reviews: Review[]
  currentUserId: string | null
  canReviewCustomer: boolean
  canReviewTasker: boolean
  customerName: string
  taskerName: string
}

export function ReviewSection({
  task,
  reviews,
  currentUserId,
  canReviewCustomer,
  canReviewTasker,
  customerName,
  taskerName
}: ReviewSectionProps) {
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewTarget, setReviewTarget] = useState<{
    id: string
    name: string
    role: 'customer' | 'tasker'
  } | null>(null)

  const handleReviewClick = (target: 'customer' | 'tasker') => {
    if (target === 'customer') {
      setReviewTarget({
        id: task.customer_id,
        name: customerName,
        role: 'customer'
      })
    } else {
      setReviewTarget({
        id: task.tasker_id,
        name: taskerName,
        role: 'tasker'
      })
    }
    setShowReviewModal(true)
  }

  // Separate reviews by who was reviewed
  const customerReviews = reviews.filter(r => r.reviewed_id === task.customer_id)
  const taskerReviews = reviews.filter(r => r.reviewed_id === task.tasker_id)

  return (
    <div className="space-y-4">
      {/* Review Buttons */}
      {(canReviewCustomer || canReviewTasker) && (
        <div className="flex gap-2 mb-4">
          {canReviewCustomer && (
            <Button onClick={() => handleReviewClick('customer')} size="sm">
              <Star className="h-4 w-4 mr-1" />
              Review Customer
            </Button>
          )}
          {canReviewTasker && (
            <Button onClick={() => handleReviewClick('tasker')} size="sm">
              <Star className="h-4 w-4 mr-1" />
              Review Tasker
            </Button>
          )}
        </div>
      )}

      {/* No Reviews Message */}
      {reviews.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          No reviews yet for this task.
        </p>
      )}

      {/* Customer Reviews Section */}
      {customerReviews.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">
            Reviews for {customerName} (Customer)
          </h4>
          {customerReviews.map((review) => (
            <ReviewCard key={review.id} review={review} currentUserId={currentUserId} />
          ))}
        </div>
      )}

      {/* Tasker Reviews Section */}
      {taskerReviews.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">
            Reviews for {taskerName} (Tasker)
          </h4>
          {taskerReviews.map((review) => (
            <ReviewCard key={review.id} review={review} currentUserId={currentUserId} />
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewTarget && (
        <ReviewModal
          task={task}
          revieweeId={reviewTarget.id}
          revieweeName={reviewTarget.name}
          reviewerRole={reviewTarget.role === 'customer' ? 'tasker' : 'customer'}
          open={showReviewModal}
          onOpenChange={setShowReviewModal}
        />
      )}
    </div>
  )
}

function ReviewCard({ review, currentUserId }: { review: Review; currentUserId: string | null }) {
  const isOwnReview = review.reviewer_id === currentUserId
  const initials = review.reviewer.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?'

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">
                {review.reviewer.full_name}
                {isOwnReview && (
                  <span className="text-gray-500 font-normal ml-1">(You)</span>
                )}
              </p>
              <RatingDisplay rating={review.rating} size="sm" showNumber={false} />
            </div>
            <p className="text-xs text-gray-500">
              {format(new Date(review.created_at), 'MMM d, yyyy')}
            </p>
          </div>
          {review.comment && (
            <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
          )}
        </div>
      </div>
    </Card>
  )
}