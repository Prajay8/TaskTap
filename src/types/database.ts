export type UserRole = 'customer' | 'tasker' | 'both' | 'admin'
export type TaskStatus = 'draft' | 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
export type VerificationStatus = 'pending' | 'approved' | 'rejected'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface TaskerProfile {
  id: string
  profile_id: string
  bio: string | null
  hourly_rate: number | null
  verification_status: VerificationStatus
  verified_at: string | null
  background_check_completed: boolean
  rating: number
  total_reviews: number
  total_tasks: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  base_price: number | null
  active: boolean
  created_at: string
}

export interface Task {
  id: string
  customer_id: string
  tasker_id: string | null
  category_id: string | null
  title: string
  description: string
  status: TaskStatus
  location_address: string
  location_lat: number | null
  location_lng: number | null
  scheduled_for: string | null
  duration_hours: number | null
  price: number | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  task_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: string
}

export interface Review {
  id: string
  task_id: string
  reviewer_id: string
  reviewed_id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface Application {
  id: string
  task_id: string
  tasker_id: string
  customer_id: string
  message: string | null
  proposed_rate: number | null
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  created_at: string
  updated_at: string
}

export interface ApplicationWithDetails extends Application {
  tasker: {
    id: string
    full_name: string
    avatar_url: string | null
    email: string
  }
  task: {
    id: string
    title: string
    price: number
  }
}

export interface Review {
  id: string
  task_id: string
  reviewer_id: string
  reviewed_id: string
  rating: number
  comment: string | null
  is_visible: boolean
  response: string | null
  created_at: string
}

export interface UserRatingSummary {
  user_id: string
  full_name: string
  role: UserRole
  total_reviews: number
  average_rating: number
  five_star_count: number
  four_star_count: number
  three_star_count: number
  two_star_count: number
  one_star_count: number
}