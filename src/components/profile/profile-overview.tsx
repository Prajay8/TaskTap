'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Mail, Calendar, Briefcase, Star } from 'lucide-react'
import { format } from 'date-fns'
import { Profile } from '@/types/database'

interface ProfileOverviewProps {
  profile: any
  taskerProfile: any
}

export function ProfileOverview({ profile, taskerProfile }: ProfileOverviewProps) {
  const initials = profile?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || '?'

  const roleDisplay = {
    customer: 'Customer',
    tasker: 'Tasker', 
    both: 'Customer & Tasker',
    admin: 'Admin'
  }

  return (
    <div className="space-y-6">
      {/* Main Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">{profile?.full_name}</h2>
                <Badge className="mt-1">{roleDisplay[profile?.role]}</Badge>
              </div>
              
              <div className="grid gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {profile?.email}
                </div>
                {profile?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {profile.phone}
                    {profile.phone_verified && (
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    )}
                  </div>
                )}
                {(profile?.location_city || profile?.location_state) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {[profile.location_city, profile.location_state, profile.location_country]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Member since {format(new Date(profile?.created_at), 'MMMM yyyy')}
                </div>
              </div>

              {profile?.bio && (
                <div className="pt-4">
                  <h3 className="font-medium mb-2">About</h3>
                  <p className="text-sm text-gray-600">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasker Specific Information */}
      {taskerProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Tasker Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium mb-1">Hourly Rate</p>
                <p className="text-2xl font-semibold">
                  ${taskerProfile.hourly_rate || '0'}/hr
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Experience</p>
                <p className="text-2xl font-semibold">
                  {taskerProfile.years_experience || 0} years
                </p>
              </div>
            </div>

            {taskerProfile.skills && taskerProfile.skills.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {taskerProfile.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {taskerProfile.certifications && taskerProfile.certifications.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Certifications</p>
                <div className="flex flex-wrap gap-2">
                  {taskerProfile.certifications.map((cert: string) => (
                    <Badge key={cert} variant="outline">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Badge 
                variant={taskerProfile.verification_status === 'approved' ? 'default' : 'secondary'}
              >
                {taskerProfile.verification_status}
              </Badge>
              {taskerProfile.background_check_completed && (
                <Badge variant="default">Background Check ✓</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}