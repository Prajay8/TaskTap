import { resend, FROM_EMAIL } from './resend'
import { createClient } from '@/lib/supabase/server'
import { WelcomeEmail } from '@/components/emails/welcome-email'
import { TaskNotificationEmail } from '@/components/emails/task-notification-email'
import { NotificationPreferences } from '@/types/email'

export class EmailService {
  static async sendWelcomeEmail(userId: string, email: string, name: string, userType: 'customer' | 'tasker' | 'both') {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Welcome to TaskTap!',
        react: WelcomeEmail({ name, userType }),
      })
      
      console.log(`Welcome email sent to ${email}`)
    } catch (error) {
      console.error('Error sending welcome email:', error)
    }
  }

  static async sendTaskApplicationEmail(
    taskId: string,
    applicantId: string,
    message?: string
  ) {
    try {
      const supabase = createClient()
      
      // Get task details
      const { data: task } = await supabase
        .from('tasks')
        .select(`
          *,
          customer:profiles!customer_id(email, full_name, notification_preferences)
        `)
        .eq('id', taskId)
        .single()

      if (!task) return

      // Get applicant details
      const { data: applicant } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', applicantId)
        .single()

      if (!applicant) return

      // Check notification preferences
      const prefs = task.customer.notification_preferences as NotificationPreferences
      if (!prefs?.email || prefs.application_update?.email === false) {
        return
      }

      await resend.emails.send({
        from: FROM_EMAIL,
        to: task.customer.email,
        subject: `New application for "${task.title}"`,
        react: TaskNotificationEmail({
          recipientName: task.customer.full_name,
          taskTitle: task.title,
          taskLocation: task.location_address,
          taskPrice: task.price,
          taskId: task.id,
          notificationType: 'new-application',
          applicantName: applicant.full_name,
          message,
        }),
      })
    } catch (error) {
      console.error('Error sending application email:', error)
    }
  }

  static async sendApplicationAcceptedEmail(
    taskId: string,
    taskerId: string
  ) {
    try {
      const supabase = createClient()
      
      // Get task and tasker details
      const { data: task } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single()

      const { data: tasker } = await supabase
        .from('profiles')
        .select('email, full_name, notification_preferences')
        .eq('id', taskerId)
        .single()

      if (!task || !tasker) return

      // Check notification preferences
      const prefs = tasker.notification_preferences as NotificationPreferences
      if (!prefs?.email || prefs.application_update?.email === false) {
        return
      }

      await resend.emails.send({
        from: FROM_EMAIL,
        to: tasker.email,
        subject: `Your application was accepted!`,
        react: TaskNotificationEmail({
          recipientName: tasker.full_name,
          taskTitle: task.title,
          taskLocation: task.location_address,
          taskPrice: task.price,
          taskId: task.id,
          notificationType: 'application-accepted',
        }),
      })
    } catch (error) {
      console.error('Error sending acceptance email:', error)
    }
  }

  static async sendTaskCompletedEmail(taskId: string) {
    try {
      const supabase = createClient()
      
      // Get task details with both customer and tasker
      const { data: task } = await supabase
        .from('tasks')
        .select(`
          *,
          customer:profiles!customer_id(email, full_name, notification_preferences),
          tasker:profiles!tasker_id(email, full_name, notification_preferences)
        `)
        .eq('id', taskId)
        .single()

      if (!task || !task.tasker) return

      // Send to both parties if they have notifications enabled
      const recipients = [
        { ...task.customer, type: 'customer' },
        { ...task.tasker, type: 'tasker' }
      ]

      for (const recipient of recipients) {
        const prefs = recipient.notification_preferences as NotificationPreferences
        if (!prefs?.email || prefs.task_status?.email === false) continue

        await resend.emails.send({
          from: FROM_EMAIL,
          to: recipient.email,
          subject: `Task "${task.title}" completed!`,
          react: TaskNotificationEmail({
            recipientName: recipient.full_name,
            taskTitle: task.title,
            taskLocation: task.location_address,
            taskPrice: task.price,
            taskId: task.id,
            notificationType: 'task-completed',
          }),
        })
      }
    } catch (error) {
      console.error('Error sending completion emails:', error)
    }
  }
}