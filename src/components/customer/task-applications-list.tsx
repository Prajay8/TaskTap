'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { User, DollarSign, Clock, Check, X } from 'lucide-react'

interface Application {
  id: string
  message: string
  proposed_rate: number
  status: string
  created_at: string
  tasker: {
    id: string
    full_name: string
    avatar_url: string | null
    email: string
  }
}

interface TaskApplicationsListProps {
  applications: Application[]
  taskId: string
}

export function TaskApplicationsList({ applications, taskId }: TaskApplicationsListProps) {
  const router = useRouter()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleAcceptApplication = async (applicationId: string, taskerId: string) => {
    setProcessingId(applicationId)
    
    try {
      const supabase = createClient()
      
      // Start a transaction by updating both the application and the task
      // Update application status
      const { error: appError } = await supabase
        .from('applications')
        .update({ status: 'accepted' })
        .eq('id', applicationId)

      if (appError) throw appError

      // Update task with assigned tasker
      const { error: taskError } = await supabase
        .from('tasks')
        .update({ 
          tasker_id: taskerId,
          status: 'assigned' 
        })
        .eq('id', taskId)

      if (taskError) throw taskError

      // Reject all other pending applications
      const { error: rejectError } = await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('task_id', taskId)
        .eq('status', 'pending')
        .neq('id', applicationId)

      if (rejectError) throw rejectError

      // Send application accepted notification email
      try {
        await fetch('/api/emails/application-accepted', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId: taskId,
            taskerId: taskerId
          })
        })
      } catch (error) {
        console.error('Failed to send acceptance email:', error)
      }

      toast.success('Application accepted! Task has been assigned.')
      router.refresh()
    } catch (error) {
      toast.error('Error accepting application')
      console.error(error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectApplication = async (applicationId: string) => {
    setProcessingId(applicationId)
    
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId)

      if (error) throw error

      toast.success('Application rejected')
      router.refresh()
    } catch (error) {
      toast.error('Error rejecting application')
      console.error(error)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <div
          key={application.id}
          className="border rounded-lg p-4 space-y-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-semibold">{application.tasker.full_name}</p>
                <p className="text-sm text-gray-500">
                  Applied {format(new Date(application.created_at), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
            <Badge
              variant={
                application.status === 'accepted' ? 'default' :
                application.status === 'rejected' ? 'destructive' :
                'secondary'
              }
            >
              {application.status}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
              <span className="font-semibold">${application.proposed_rate.toFixed(2)}</span>
              <span className="text-gray-500 ml-1">proposed rate</span>
            </div>
            
            {application.message && (
              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm text-gray-700">{application.message}</p>
              </div>
            )}
          </div>

          {application.status === 'pending' && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => handleAcceptApplication(application.id, application.tasker.id)}
                disabled={processingId === application.id}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRejectApplication(application.id)}
                disabled={processingId === application.id}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}