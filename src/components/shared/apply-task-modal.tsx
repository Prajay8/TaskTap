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
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface ApplyTaskModalProps {
  task: {
    id: string
    title: string
    price: number
    customer_id: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ApplyTaskModal({ task, open, onOpenChange }: ApplyTaskModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    message: '',
    proposed_rate: task.price.toString()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please login to apply')
        return
      }

      // Check if already applied
      const { data: existingApplication } = await supabase
        .from('applications')
        .select('id')
        .eq('task_id', task.id)
        .eq('tasker_id', user.id)
        .single()

      if (existingApplication) {
        toast.error('You have already applied for this task')
        onOpenChange(false)
        return
      }

      // Create application
      const { error } = await supabase
        .from('applications')
        .insert({
          task_id: task.id,
          tasker_id: user.id,
          customer_id: task.customer_id,
          message: formData.message,
          proposed_rate: parseFloat(formData.proposed_rate)
        })

      if (error) {
        if (error.message.includes('duplicate key')) {
          toast.error('You have already applied for this task')
        } else {
          toast.error('Error submitting application')
        }
        console.error(error)
        return
      }

      toast.success('Application submitted successfully!')
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Application error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Apply for Task</DialogTitle>
            <DialogDescription>
              Submit your application for: {task.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="proposed_rate">Your Rate ($)</Label>
              <Input
                id="proposed_rate"
                type="number"
                min="20"
                step="0.01"
                value={formData.proposed_rate}
                onChange={(e) => setFormData({ ...formData, proposed_rate: e.target.value })}
                required
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500">
                Customer's budget: ${task.price.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message to Customer</Label>
              <Textarea
                id="message"
                placeholder="Introduce yourself and explain why you're the best fit for this task..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                disabled={isLoading}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}