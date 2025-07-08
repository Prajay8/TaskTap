'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface MarkCompleteButtonProps {
  taskId: string
}

export function MarkCompleteButton({ taskId }: MarkCompleteButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleMarkComplete = async () => {
    setIsLoading(true)
    
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)

      if (error) {
        toast.error('Failed to mark task as complete')
        console.error(error)
        return
      }

      // Send task completion notification email
      try {
        await fetch('/api/emails/task-completed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId })
        })
      } catch (error) {
        console.error('Failed to send completion email:', error)
      }

      toast.success('Task marked as complete! You can now leave a review.')
      router.refresh()
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error marking task complete:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            className="w-full" 
            disabled={isLoading}
            variant="default"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Marking Complete...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Complete
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Task as Complete?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <span>This action confirms that the task has been completed successfully.</span>
                <br />
                <span>After marking as complete:</span>
                <div className="mt-2 space-y-1 text-sm">
                  <div>• Both you and the tasker can leave reviews</div>
                  <div>• The task status cannot be changed back</div>
                  <div>• Payment will be processed (if applicable)</div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkComplete}>
              Yes, Mark as Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p className="text-sm text-gray-500 mt-2">
        Once marked complete, both parties can leave reviews.
      </p>
    </>
  )
}