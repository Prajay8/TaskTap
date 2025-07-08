import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileOverview } from '@/components/profile/profile-overview'
import { ProfileEditForm } from '@/components/profile/profile-edit-form'
import { TaskerProfileForm } from '@/components/profile/tasker-profile-form'
import { ProfileDocuments } from '@/components/profile/profile-documents'
import { NotificationSettings } from '@/components/profile/notification-settings'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: taskerProfile } = await supabase
    .from('tasker_profiles')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  const { data: documents } = await supabase
    .from('profile_documents')
    .select('*')
    .eq('profile_id', user.id)
    .order('uploaded_at', { ascending: false })

  const isTasker = profile?.role === 'tasker' || profile?.role === 'both'

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full lg:w-auto lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          {isTasker && <TabsTrigger value="tasker">Tasker Info</TabsTrigger>}
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ProfileOverview profile={profile} taskerProfile={taskerProfile} />
        </TabsContent>

        <TabsContent value="edit">
          <ProfileEditForm profile={profile} />
        </TabsContent>

        {isTasker && (
          <TabsContent value="tasker">
            <TaskerProfileForm profile={profile} taskerProfile={taskerProfile} />
          </TabsContent>
        )}

        <TabsContent value="documents">
          <ProfileDocuments 
            documents={documents || []} 
            isTasker={isTasker}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  )
}