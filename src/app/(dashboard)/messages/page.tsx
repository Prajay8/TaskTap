'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { ConversationsList } from '@/components/messages/conversations-list'
import { MessageThread } from '@/components/messages/message-thread'
import { MessageSquare } from 'lucide-react'

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

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    loadConversations()
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUserId(user.id)
    }
  }

  const loadConversations = async () => {
    setLoading(true)
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('last_message_time', { ascending: false })

    if (error) {
      console.error('Error loading conversations:', error)
    } else {
      setConversations(data || [])
      // Select first conversation by default if none selected
      if (data && data.length > 0 && !selectedTaskId) {
        setSelectedTaskId(data[0].task_id)
      }
    }
    setLoading(false)
  }

  const selectedConversation = conversations.find(c => c.task_id === selectedTaskId)

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="h-8 w-8" />
          Messages
        </h1>
        <p className="text-gray-600 mt-2">Communicate with customers and taskers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100%-6rem)]">
        {/* Conversations List */}
        <div className="md:col-span-1">
          <Card className="h-full overflow-hidden">
            <ConversationsList
              conversations={conversations}
              selectedTaskId={selectedTaskId}
              onSelectConversation={setSelectedTaskId}
              currentUserId={currentUserId}
              loading={loading}
            />
          </Card>
        </div>

        {/* Message Thread */}
        <div className="md:col-span-2">
          <Card className="h-full overflow-hidden">
            {selectedConversation && currentUserId ? (
              <MessageThread
                taskId={selectedTaskId!}
                conversation={selectedConversation}
                currentUserId={currentUserId}
                onMessageSent={loadConversations}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Select a conversation to view messages</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}