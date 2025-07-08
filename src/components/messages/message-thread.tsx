'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Message {
  id: string
  task_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: string
  sender: {
    full_name: string
    avatar_url: string | null
  }
}

interface MessageThreadProps {
  taskId: string
  conversation: any
  currentUserId: string
  onMessageSent: () => void
}

export function MessageThread({ taskId, conversation, currentUserId, onMessageSent }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadMessages()
    markMessagesAsRead()
    
    // Set up real-time subscription
    const channel = supabase
      .channel(`messages:${taskId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `task_id=eq.${taskId}`
        },
        (payload) => {
          loadMessages()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [taskId])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(full_name, avatar_url)
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading messages:', error)
    } else {
      setMessages(data || [])
    }
    setLoading(false)
  }

  const markMessagesAsRead = async () => {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('task_id', taskId)
      .neq('sender_id', currentUserId)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setSending(true)
    const { error } = await supabase
      .from('messages')
      .insert({
        task_id: taskId,
        sender_id: currentUserId,
        content: newMessage.trim()
      })

    if (error) {
      toast.error('Failed to send message')
      console.error(error)
    } else {
      setNewMessage('')
      onMessageSent()
    }
    setSending(false)
  }

  const otherPersonName = currentUserId === conversation.customer_id
    ? conversation.tasker_name
    : conversation.customer_name

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold">{otherPersonName}</h3>
        <p className="text-sm text-gray-600">{conversation.task_title}</p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {loading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">No messages yet. Start the conversation!</div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isOwn = message.sender_id === currentUserId
              const showDate = index === 0 || 
                new Date(messages[index - 1].created_at).toDateString() !== 
                new Date(message.created_at).toDateString()

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="text-center text-xs text-gray-500 my-4">
                      {format(new Date(message.created_at), 'MMMM d, yyyy')}
                    </div>
                  )}
                  <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
                    <div className={cn('flex gap-2 max-w-[70%]', isOwn && 'flex-row-reverse')}>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {message.sender.full_name?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div
                          className={cn(
                            'rounded-lg px-4 py-2',
                            isOwn 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(message.created_at), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !newMessage.trim()}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}