'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { MapPin, Clock, DollarSign, Calendar, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface Job {
  id: string
  title: string
  description: string
  location_address: string
  scheduled_for: string | null
  duration_hours: number
  price: number
  status: string
  created_at: string
  category: {
    name: string
    slug: string
  } | null
  customer: {
    full_name: string
    avatar_url: string | null
    phone: string | null
  }
}

export default function MyJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error('Please login to view your jobs')
      return
    }

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        category:categories(name, slug),
        customer:profiles!customer_id(full_name, avatar_url, phone)
      `)
      .eq('tasker_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Error loading jobs')
      console.error(error)
    } else {
      setJobs(data || [])
    }
    setLoading(false)
  }

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', jobId)

    if (error) {
      toast.error('Error updating job status')
    } else {
      toast.success(`Job marked as ${newStatus.replace('_', ' ')}`)
      loadJobs()
    }
  }

  const activeJobs = jobs.filter(j => ['assigned', 'in_progress'].includes(j.status))
  const completedJobs = jobs.filter(j => j.status === 'completed')
  const cancelledJobs = jobs.filter(j => j.status === 'cancelled')

  const statusColors = {
    assigned: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  const JobCard = ({ job }: { job: Job }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {job.description}
            </CardDescription>
          </div>
          <Badge className={statusColors[job.status as keyof typeof statusColors]}>
            {job.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {job.location_address}
          </div>
          {job.scheduled_for && (
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              {format(new Date(job.scheduled_for), 'MMM d, yyyy h:mm a')}
            </div>
          )}
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            {job.duration_hours} hours
          </div>
          <div className="flex items-center font-semibold text-green-600">
            <DollarSign className="h-4 w-4 mr-1" />
            {job.price.toFixed(2)}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm text-gray-600">
            Customer: <span className="font-semibold">{job.customer.full_name}</span>
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href={`/tasks/${job.id}`}>
          <Button variant="outline" size="sm">View Details</Button>
        </Link>
        {job.status === 'assigned' && (
          <Button 
            size="sm" 
            onClick={() => updateJobStatus(job.id, 'in_progress')}
          >
            Start Job
          </Button>
        )}
        {job.status === 'in_progress' && (
          <Button 
            size="sm" 
            onClick={() => updateJobStatus(job.id, 'completed')}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Complete
          </Button>
        )}
      </CardFooter>
    </Card>
  )

  // Calculate earnings
  const totalEarnings = completedJobs.reduce((sum, job) => sum + job.price, 0)
  const pendingEarnings = activeJobs.reduce((sum, job) => sum + job.price, 0)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Jobs</h1>
        <p className="text-gray-600">Track and manage your assigned tasks</p>
      </div>

      {/* Earnings Summary */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-gray-500">From completed jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${pendingEarnings.toFixed(2)}</div>
            <p className="text-xs text-gray-500">From active jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Jobs Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedJobs.length}</div>
            <p className="text-xs text-gray-500">Total completed</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading jobs...</div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">
              Active ({activeJobs.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedJobs.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({cancelledJobs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeJobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500 mb-4">No active jobs</p>
                  <Link href="/browse-tasks">
                    <Button>Browse Available Tasks</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedJobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No completed jobs yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="mt-6">
            {cancelledJobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No cancelled jobs</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cancelledJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}