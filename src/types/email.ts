export type EmailTemplate = 
  | 'welcome'
  | 'task-posted'
  | 'application-received'
  | 'application-accepted'
  | 'application-rejected'
  | 'task-completed'
  | 'review-reminder'
  | 'new-message'
  | 'password-reset'

export interface EmailData {
  to: string
  subject: string
  template: EmailTemplate
  data: Record<string, any>
}

export interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  new_task_match?: {
    email: boolean
    push: boolean
  }
  application_update?: {
    email: boolean
    push: boolean
    sms: boolean
  }
  task_status?: {
    email: boolean
    push: boolean
  }
  new_message?: {
    email: boolean
    push: boolean
  }
  review_reminder?: {
    email: boolean
  }
  marketing?: {
    email: boolean
  }
}