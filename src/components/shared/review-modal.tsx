'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ReviewModalProps {
  task: {
    id: string
    title: string
    customer_id: string
    tasker_id: string
  }
  revieweeId: string
  revieweeName: string
  reviewerRole: 'customer' | 'tasker'
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReviewModal({
  task,
  revieweeId,
  revieweeName,
  reviewerRole,
  open,
  onOpenChange
}: ReviewModalProps) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('You must be logged in to submit a review')
        return
      }

      // Submit the review directly - RLS policies will handle validation
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          task_id: task.id,
          reviewer_id: user.id,
          reviewed_id: revieweeId,
          rating,
          comment: comment.trim() || null,
          is_visible: true
        })
        .select()
        .single()

      if (error) {
        console.error('Review submission error:', error)
        
        // Better error messages
        if (error.code === '23505' || error.message.includes('duplicate')) {
          toast.error('You have already reviewed this task')
        } else if (error.message.includes('completed')) {
          toast.error('Reviews can only be submitted for completed tasks')
        } else if (error.code === '23503') {
          toast.error('Invalid task or user reference')
        } else {
          toast.error('Failed to submit review. Please try again.')
        }
        return
      }

      toast.success('Review submitted successfully!')
      onOpenChange(false)
      router.refresh()
      
      // Reset form
      setRating(0)
      setComment('')
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Review submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor'
      case 2: return 'Fair'
      case 3: return 'Good'
      case 4: return 'Great'
      case 5: return 'Excellent'
      default: return 'Select a rating'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Review {revieweeName}</DialogTitle>
            <DialogDescription>
              How was your experience {reviewerRole === 'customer' ? 'with this tasker' : 'with this customer'} for "{task.title}"?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* Star Rating */}
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    <Star
                      className={cn(
                        'h-8 w-8 transition-colors',
                        (hoveredRating || rating) >= star
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      )}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {getRatingText(hoveredRating || rating)}
                </span>
              </div>
            </div>

            {/* Review Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment">Comment (optional)</Label>
              <Textarea
                id="comment"
                placeholder={
                  reviewerRole === 'customer'
                    ? "Share your experience with this tasker..."
                    : "Share your experience with this customer..."
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 text-right">
                {comment.length}/500 characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || rating === 0}>
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}