'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface NotificationSettingsProps {
  profile: any
}

export function NotificationSettings({ profile }: NotificationSettingsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [preferences, setPreferences] = useState(
    profile?.notification_preferences || {
      email: true,
      sms: false,
      push: true
    }
  )

  const notificationTypes = [
    {
      key: 'new_task_match',
      label: 'New Task Matches',
      description: 'When a new task matches your skills and location',
      channels: ['email', 'push']
    },
    {
      key: 'application_update',
      label: 'Application Updates',
      description: 'When your task application is accepted or rejected',
      channels: ['email', 'push', 'sms']
    },
    {
      key: 'task_status',
      label: 'Task Status Updates',
      description: 'When your task status changes',
      channels: ['email', 'push']
    },
    {
      key: 'new_message',
      label: 'New Messages',
      description: 'When you receive a new message',
      channels: ['email', 'push']
    },
    {
      key: 'review_reminder',
      label: 'Review Reminders',
      description: 'Reminders to review completed tasks',
      channels: ['email']
    },
    {
      key: 'marketing',
      label: 'Marketing & Promotions',
      description: 'Special offers and platform updates',
      channels: ['email']
    }
  ]

  const handlePreferenceChange = (type: string, channel: string, enabled: boolean) => {
    setPreferences((prev: any) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [channel]: enabled
      }
    }))
  }

  const handleGlobalChannelToggle = (channel: string, enabled: boolean) => {
    setPreferences((prev: any) => ({
      ...prev,
      [channel]: enabled
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('profiles')
        .update({
          notification_preferences: preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) throw error

      toast.success('Notification preferences updated')
      router.refresh()
    } catch (error) {
      toast.error('Error updating notification preferences')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Global Notification Settings</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-global">Email Notifications</Label>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <Switch
              id="email-global"
              checked={preferences.email}
              onCheckedChange={(checked) => handleGlobalChannelToggle('email', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms-global">SMS Notifications</Label>
              <p className="text-sm text-gray-500">Receive notifications via text message</p>
            </div>
            <Switch
              id="sms-global"
              checked={preferences.sms}
              onCheckedChange={(checked) => handleGlobalChannelToggle('sms', checked)}
              disabled={!profile?.phone}
            />
            {!profile?.phone && (
              <p className="text-xs text-gray-500">Add phone number to enable</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-global">Push Notifications</Label>
              <p className="text-sm text-gray-500">Receive notifications in your browser</p>
            </div>
            <Switch
              id="push-global"
              checked={preferences.push}
              onCheckedChange={(checked) => handleGlobalChannelToggle('push', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Customize notifications for specific events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {notificationTypes.map((type) => (
              <div key={type.key} className="space-y-3">
                <div>
                  <h4 className="font-medium">{type.label}</h4>
                  <p className="text-sm text-gray-500">{type.description}</p>
                </div>
                <div className="flex gap-6">
                  {type.channels.map((channel) => (
                    <div key={channel} className="flex items-center space-x-2">
                      <Switch
                        id={`${type.key}-${channel}`}
                        checked={preferences[type.key]?.[channel] ?? preferences[channel]}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange(type.key, channel, checked)
                        }
                        disabled={!preferences[channel]}
                      />
                      <Label 
                        htmlFor={`${type.key}-${channel}`}
                        className="capitalize text-sm"
                      >
                        {channel}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}