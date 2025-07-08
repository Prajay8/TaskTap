'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface Conversation {
  task_id: string
  task_title: string
  customer_id: string
  tasker_id: string
  task_status: string
  customer_name: string
  tasker_name: string
  last_message: string | null
  last_message_time: string | null
  unread_count: number
}

interface ConversationsListProps {
  conversations: Conversation[]
  selectedTaskId: string | null
  onSelectConversation: (taskId: string) => void
  currentUserId: string | null
  loading: boolean
}

export function ConversationsList({
  conversations,
  selectedTaskId,
  onSelectConversation,
  currentUserId,
  loading
}: ConversationsListProps) {
  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading conversations...
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No conversations yet
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <h2 className="font-semibold mb-4">Conversations</h2>
        <div className="space-y-2">
          {conversations.map((conversation) => {
            const otherPersonName = currentUserId === conversation.customer_id
              ? conversation.tasker_name
              : conversation.customer_name
            
            const initials = otherPersonName
              ?.split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase() || '?'

            return (
              <button
                key={conversation.task_id}
                onClick={() => onSelectConversation(conversation.task_id)}
                className={cn(
                  'w-full text-left p-3 rounded-lg transition-colors',
                  selectedTaskId === conversation.task_id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{otherPersonName}</p>
                      {conversation.unread_count > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.task_title}
                    </p>
                    {conversation.last_message && (
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.last_message}
                      </p>
                    )}
                    {conversation.last_message_time && (
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(conversation.last_message_time), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </ScrollArea>
  )
}