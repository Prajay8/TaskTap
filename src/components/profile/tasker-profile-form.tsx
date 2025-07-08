'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Loader2, Plus, X } from 'lucide-react'

interface TaskerProfileFormProps {
  profile: any
  taskerProfile: any
}

export function TaskerProfileForm({ profile, taskerProfile }: TaskerProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [skills, setSkills] = useState<string[]>(taskerProfile?.skills || [])
  const [certifications, setCertifications] = useState<string[]>(taskerProfile?.certifications || [])
  const [newSkill, setNewSkill] = useState('')
  const [newCert, setNewCert] = useState('')
  
  const [formData, setFormData] = useState({
    bio: taskerProfile?.bio || '',
    hourly_rate: taskerProfile?.hourly_rate || '',
    years_experience: taskerProfile?.years_experience || '',
    emergency_contact_name: taskerProfile?.emergency_contact_name || '',
    emergency_contact_phone: taskerProfile?.emergency_contact_phone || '',
  })

  const [availability, setAvailability] = useState(
    taskerProfile?.availability || {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false
    }
  )

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill))
  }

  const addCertification = () => {
    if (newCert.trim() && !certifications.includes(newCert.trim())) {
      setCertifications([...certifications, newCert.trim()])
      setNewCert('')
    }
  }

  const removeCertification = (cert: string) => {
    setCertifications(certifications.filter(c => c !== cert))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      
      // Check if tasker profile exists
      const { data: existingProfile } = await supabase
        .from('tasker_profiles')
        .select('id')
        .eq('profile_id', profile.id)
        .single()

      const taskerData = {
        profile_id: profile.id,
        bio: formData.bio,
        hourly_rate: parseFloat(formData.hourly_rate) || null,
        years_experience: parseInt(formData.years_experience) || null,
        skills,
        certifications,
        availability,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        updated_at: new Date().toISOString()
      }

      let error
      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('tasker_profiles')
          .update(taskerData)
          .eq('profile_id', profile.id)
        error = updateError
      } else {
        // Create new profile
        const { error: insertError } = await supabase
          .from('tasker_profiles')
          .insert(taskerData)
        error = insertError
      }

      if (error) throw error

      toast.success('Tasker profile updated successfully')
      router.refresh()
    } catch (error) {
      toast.error('Error updating tasker profile')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasker Profile</CardTitle>
        <CardDescription>Manage your tasker-specific information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
              <Input
                id="hourly_rate"
                type="number"
                min="0"
                step="0.01"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                placeholder="25.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="years_experience">Years of Experience</Label>
              <Input
                id="years_experience"
                type="number"
                min="0"
                value={formData.years_experience}
                onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                placeholder="5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Describe your experience and what makes you a great tasker..."
              rows={4}
            />
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map((skill) => (
                <div key={skill} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                  <span className="text-sm">{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="space-y-2">
            <Label>Certifications</Label>
            <div className="flex gap-2">
              <Input
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                placeholder="Add a certification"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
              />
              <Button type="button" onClick={addCertification} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {certifications.map((cert) => (
                <div key={cert} className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full">
                  <span className="text-sm">{cert}</span>
                  <button
                    type="button"
                    onClick={() => removeCertification(cert)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <Label>Availability</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(availability).map(([day, available]) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={day}
                    checked={available}
                    onCheckedChange={(checked) => 
                      setAvailability({ ...availability, [day]: checked })
                    }
                  />
                  <Label htmlFor={day} className="capitalize">
                    {day}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
              <Input
                id="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
              <Input
                id="emergency_contact_phone"
                type="tel"
                value={formData.emergency_contact_phone}
                onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Tasker Profile'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}