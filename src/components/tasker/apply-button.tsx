'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ApplyTaskModal } from '@/components/shared/apply-task-modal'

interface ApplyButtonProps {
  task: {
    id: string
    title: string
    price: number
    customer_id: string
  }
  hasApplied: boolean
}

export function ApplyButton({ task, hasApplied }: ApplyButtonProps) {
  const [showModal, setShowModal] = useState(false)

  if (hasApplied) {
    return (
      <Button className="w-full" disabled>
        Already Applied
      </Button>
    )
  }

  return (
    <>
      <Button 
        className="w-full" 
        size="lg"
        onClick={() => setShowModal(true)}
      >
        Apply for this Task
      </Button>
      <ApplyTaskModal 
        task={task}
        open={showModal}
        onOpenChange={setShowModal}
      />
    </>
  )
}