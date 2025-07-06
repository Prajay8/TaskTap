import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, DollarSign, Calendar, User, Users } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { TaskApplicationsList } from '@/components/customer/task-applications-list'
import { ApplyButton } from '@/components/tasker/apply-button'

export default async function TaskDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  const { data: task, error } = await supabase
    .from('tasks')
    .select(`
      *,
      category:categories(name, slug),
      customer:profiles!customer_id(full_name, avatar_url, email),
      tasker:profiles!tasker_id(full_name, avatar_url, email)
    `)
    .eq('id', params.id)
    .single()

  if (error || !task) {
    notFound()
  }

  const { data: { user } } = await supabase.auth.getUser()
  const isCustomer = user?.id === task.customer_id
  const isTasker = user?.id === task.tasker_id

  // Get applications if user is the customer
  let applications = []
  if (isCustomer && task.status === 'open') {
    const { data } = await supabase
      .from('applications')
      .select(`
        *,
        tasker:profiles!tasker_id(id, full_name, avatar_url, email)
      `)
      .eq('task_id', task.id)
      .order('created_at', { ascending: false })
    
    applications = data || []
  }

  // Check if current user has applied (for taskers)
  let hasApplied = false
  if (user && !isCustomer && task.status === 'open') {
    const { data } = await supabase
      .from('applications')
      .select('id')
      .eq('task_id', task.id)
      .eq('tasker_id', user.id)
      .single()
    
    hasApplied = !!data
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    open: 'bg-blue-100 text-blue-800',
    assigned: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/tasks">
          <Button variant="ghost" size="sm">← Back to Tasks</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Task Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{task.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    {task.category && (
                      <Badge variant="secondary">{task.category.name}</Badge>
                    )}
                    <Badge className={statusColors[task.status as keyof typeof statusColors]}>
                      {task.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
              </div>

              <div className="grid gap-3 pt-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-3" />
                  <span>{task.location_address}</span>
                </div>
                {task.scheduled_for && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-3" />
                    <span>{format(new Date(task.scheduled_for), 'MMMM d, yyyy h:mm a')}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-3" />
                  <span>Estimated duration: {task.duration_hours} hours</span>
                </div>
                <div className="flex items-center text-green-600 font-semibold text-lg">
                  <DollarSign className="h-5 w-5 mr-3" />
                  <span>${task.price.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications Section for Customers */}
          {isCustomer && task.status === 'open' && applications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Applications ({applications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskApplicationsList 
                  applications={applications} 
                  taskId={task.id}
                />
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {isCustomer && task.status === 'open' && (
            <Card>
              <CardHeader>
                <CardTitle>Manage Task</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">Edit Task</Button>
                <Button className="w-full" variant="destructive">Cancel Task</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Posted by</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold">{task.customer.full_name}</p>
                  <p className="text-sm text-gray-500">Customer</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Tasker */}
          {task.tasker && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assigned to</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{task.tasker.full_name}</p>
                    <p className="text-sm text-gray-500">Tasker</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Apply Button for Taskers */}
          {!isCustomer && !isTasker && task.status === 'open' && user && (
            <Card>
              <CardContent className="pt-6">
                <ApplyButton 
                  task={{
                    id: task.id,
                    title: task.title,
                    price: task.price,
                    customer_id: task.customer_id
                  }}
                  hasApplied={hasApplied}
                />
                {hasApplied && (
                  <p className="text-xs text-center text-gray-500 mt-2">
                    You've already applied to this task
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Task Stats */}
          {isCustomer && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Applications:</span>
                    <span className="font-semibold">{applications.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posted:</span>
                    <span className="font-semibold">
                      {format(new Date(task.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}