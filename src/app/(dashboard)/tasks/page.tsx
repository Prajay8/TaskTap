'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { MapPin, Clock, DollarSign, Calendar, Plus } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface Task {
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
  tasker: {
    full_name: string
    avatar_url: string | null
  } | null
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error('Please login to view your tasks')
      return
    }

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        category:categories(name, slug),
        tasker:profiles!tasker_id(full_name, avatar_url)
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Error loading tasks')
      console.error(error)
    } else {
      setTasks(data || [])
    }
    setLoading(false)
  }

  const cancelTask = async (taskId: string) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'cancelled' })
      .eq('id', taskId)

    if (error) {
      toast.error('Error cancelling task')
    } else {
      toast.success('Task cancelled successfully')
      loadTasks()
    }
  }

  const markComplete = async (taskId: string) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'completed' })
      .eq('id', taskId)

    if (error) {
      toast.error('Error completing task')
    } else {
      toast.success('Task marked as complete!')
      loadTasks()
    }
  }

  const activeTasks = tasks.filter(t => ['open', 'assigned', 'in_progress'].includes(t.status))
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const cancelledTasks = tasks.filter(t => t.status === 'cancelled')

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    open: 'bg-blue-100 text-blue-800',
    assigned: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {task.description}
            </CardDescription>
          </div>
          <Badge className={statusColors[task.status as keyof typeof statusColors]}>
            {task.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {task.location_address}
          </div>
          {task.scheduled_for && (
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              {format(new Date(task.scheduled_for), 'MMM d, yyyy h:mm a')}
            </div>
          )}
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            {task.duration_hours} hours
          </div>
          <div className="flex items-center font-semibold text-green-600">
            <DollarSign className="h-4 w-4 mr-1" />
            {task.price.toFixed(2)}
          </div>
        </div>
        {task.tasker && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-gray-600">
              Assigned to: <span className="font-semibold">{task.tasker.full_name}</span>
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href={`/tasks/${task.id}`}>
          <Button variant="outline" size="sm">View Details</Button>
        </Link>
        {task.status === 'open' && (
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => cancelTask(task.id)}
          >
            Cancel
          </Button>
        )}
        {task.status === 'in_progress' && (
          <Button 
            size="sm" 
            onClick={() => markComplete(task.id)}
          >
            Mark Complete
          </Button>
        )}
      </CardFooter>
    </Card>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Tasks</h1>
          <p className="text-gray-600">Manage and track all your posted tasks</p>
        </div>
        <Link href="/tasks/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Post New Task
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading tasks...</div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">
              Active ({activeTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedTasks.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({cancelledTasks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeTasks.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500 mb-4">No active tasks</p>
                  <Link href="/tasks/new">
                    <Button>Post Your First Task</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedTasks.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No completed tasks yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="mt-6">
            {cancelledTasks.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No cancelled tasks</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cancelledTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}