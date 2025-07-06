import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  DollarSign, 
  ClipboardList, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Users,
  Plus,
  Search,
  Briefcase,
  AlertCircle
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role || 'customer'

  // Initialize stats variables
  let activeTasks = 0, completedTasks = 0, totalSpent = 0
  let activeJobs = 0, completedJobs = 0, totalEarnings = 0, pendingApplications = 0

  // Customer Stats
  if (userRole === 'customer' || userRole === 'both') {
    const activeTasksResult = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', user.id)
      .in('status', ['open', 'assigned', 'in_progress'])
    activeTasks = activeTasksResult.count || 0

    const completedTasksResult = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', user.id)
      .eq('status', 'completed')
    completedTasks = completedTasksResult.count || 0

    const { data: totalSpentData } = await supabase
      .from('tasks')
      .select('price')
      .eq('customer_id', user.id)
      .eq('status', 'completed')
    totalSpent = totalSpentData?.reduce((sum, task) => sum + (task.price || 0), 0) || 0
  }

  // Tasker Stats
  if (userRole === 'tasker' || userRole === 'both') {
    const activeJobsResult = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('tasker_id', user.id)
      .in('status', ['assigned', 'in_progress'])
    activeJobs = activeJobsResult.count || 0

    const completedJobsResult = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('tasker_id', user.id)
      .eq('status', 'completed')
    completedJobs = completedJobsResult.count || 0

    const { data: earningsData } = await supabase
      .from('tasks')
      .select('price')
      .eq('tasker_id', user.id)
      .eq('status', 'completed')
    totalEarnings = earningsData?.reduce((sum, task) => sum + (task.price || 0), 0) || 0

    const pendingApplicationsResult = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('tasker_id', user.id)
      .eq('status', 'pending')
    pendingApplications = pendingApplicationsResult.count || 0
  }

  // Render based on role
  if (userRole === 'customer') {
    return <CustomerDashboard 
      profile={profile}
      stats={{
        activeTasks,
        completedTasks,
        totalSpent
      }}
    />
  }

  if (userRole === 'tasker') {
    return <TaskerDashboard 
      profile={profile}
      stats={{
        activeJobs,
        completedJobs,
        totalEarnings,
        pendingApplications
      }}
    />
  }

  // Both role - show combined dashboard
  return <CombinedDashboard 
    profile={profile}
    customerStats={{
      activeTasks,
      completedTasks,
      totalSpent
    }}
    taskerStats={{
      activeJobs,
      completedJobs,
      totalEarnings,
      pendingApplications
    }}
  />
}

// Customer Dashboard Component
function CustomerDashboard({ profile, stats }: any) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name}!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your tasks</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime spending</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Action</CardTitle>
            <Plus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <Link href="/tasks/new">
              <Button className="w-full" size="sm">Post New Task</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/tasks/new">
              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Post a New Task
              </Button>
            </Link>
            <Link href="/tasks">
              <Button className="w-full" variant="outline">
                <ClipboardList className="h-4 w-4 mr-2" />
                View My Tasks
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">No recent activity</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Tasker Dashboard Component
function TaskerDashboard({ profile, stats }: any) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name}!</h1>
        <p className="text-gray-600 mt-2">Your tasker dashboard</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground">Currently working on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedJobs}</div>
            <p className="text-xs text-muted-foreground">Total completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/browse-tasks">
              <Button className="w-full" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Browse Available Tasks
              </Button>
            </Link>
            <Link href="/my-jobs">
              <Button className="w-full" variant="outline">
                <Briefcase className="h-4 w-4 mr-2" />
                View My Jobs
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Earnings Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">This month:</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last month:</span>
                <span className="font-semibold">$0.00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Combined Dashboard Component for users with 'both' role
function CombinedDashboard({ profile, customerStats, taskerStats }: any) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name}!</h1>
        <p className="text-gray-600 mt-2">Your combined dashboard</p>
      </div>

      {/* Customer Section */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          As a Customer
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customerStats.activeTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${customerStats.totalSpent.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Link href="/tasks/new">
                <Button size="sm">Post Task</Button>
              </Link>
              <Link href="/tasks">
                <Button size="sm" variant="outline">My Tasks</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tasker Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Briefcase className="h-5 w-5 mr-2" />
          As a Tasker
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskerStats.activeJobs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${taskerStats.totalEarnings.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Link href="/browse-tasks">
                <Button size="sm">Find Work</Button>
              </Link>
              <Link href="/my-jobs">
                <Button size="sm" variant="outline">My Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}