'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { MapPin, Clock, DollarSign, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { ApplyTaskModal } from '@/components/shared/apply-task-modal'

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
  customer_id: string
  category: {
    name: string
    slug: string
  } | null
  customer: {
    full_name: string
    avatar_url: string | null
  }
}

export default function BrowseTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    search: '',
    category: 'all',
    priceRange: 'all'
  })
  const [categories, setCategories] = useState<any[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [appliedTasks, setAppliedTasks] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadTasks()
    loadCategories()
    loadUserApplications()
  }, [filter])

  const loadCategories = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('name')
    
    if (data) setCategories(data)
  }

  const loadUserApplications = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data } = await supabase
        .from('applications')
        .select('task_id')
        .eq('tasker_id', user.id)
      
      if (data) {
        setAppliedTasks(new Set(data.map(app => app.task_id)))
      }
    }
  }

  const loadTasks = async () => {
    setLoading(true)
    const supabase = createClient()
    
    let query = supabase
      .from('tasks')
      .select(`
        *,
        category:categories(name, slug),
        customer:profiles!customer_id(full_name, avatar_url)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filter.search) {
      query = query.or(`title.ilike.%${filter.search}%,description.ilike.%${filter.search}%`)
    }

    if (filter.category !== 'all') {
      query = query.eq('category_id', filter.category)
    }

    if (filter.priceRange !== 'all') {
      const [min, max] = filter.priceRange.split('-').map(Number)
      if (max) {
        query = query.gte('price', min).lte('price', max)
      } else {
        query = query.gte('price', min)
      }
    }

    const { data, error } = await query

    if (error) {
      toast.error('Error loading tasks')
      console.error(error)
    } else {
      setTasks(data || [])
    }
    setLoading(false)
  }

  const handleApplyClick = (task: Task) => {
    setSelectedTask(task)
    setShowApplyModal(true)
  }

  const handleModalClose = (open: boolean) => {
    setShowApplyModal(open)
    if (!open) {
      // Reload applications to update the UI
      loadUserApplications()
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Available Tasks</h1>
        <p className="text-gray-600">Find tasks that match your skills and availability</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Input
                placeholder="Search tasks..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              />
            </div>
            <div>
              <Select
                value={filter.category}
                onValueChange={(value) => setFilter({ ...filter, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={filter.priceRange}
                onValueChange={(value) => setFilter({ ...filter, priceRange: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Price range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All prices</SelectItem>
                  <SelectItem value="0-50">$0 - $50</SelectItem>
                  <SelectItem value="50-100">$50 - $100</SelectItem>
                  <SelectItem value="100-200">$100 - $200</SelectItem>
                  <SelectItem value="200-0">$200+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      {loading ? (
        <div className="text-center py-8">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No tasks found matching your criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => {
            const hasApplied = appliedTasks.has(task.id)
            
            return (
              <Card key={task.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {task.description}
                      </CardDescription>
                    </div>
                    {task.category && (
                      <Badge variant="secondary" className="ml-2">
                        {task.category.name}
                      </Badge>
                    )}
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
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-gray-500">
                    by {task.customer.full_name}
                  </div>
                  <div className="space-x-2">
                    <Link href={`/tasks/${task.id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                    {hasApplied ? (
                      <Button size="sm" disabled>
                        Applied
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => handleApplyClick(task)}
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Apply Modal */}
      {selectedTask && (
        <ApplyTaskModal
          task={{
            id: selectedTask.id,
            title: selectedTask.title,
            price: selectedTask.price,
            customer_id: selectedTask.customer_id
          }}
          open={showApplyModal}
          onOpenChange={handleModalClose}
        />
      )}
    </div>
  )
}