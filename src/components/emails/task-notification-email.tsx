import * as React from 'react'
import { Text, Button, Section, Hr } from '@react-email/components'
import { BaseEmail } from './base-email'

interface TaskNotificationEmailProps {
  recipientName: string
  taskTitle: string
  taskLocation: string
  taskPrice: number
  taskId: string
  notificationType: 'new-application' | 'application-accepted' | 'task-completed'
  applicantName?: string
  message?: string
}

export function TaskNotificationEmail({
  recipientName,
  taskTitle,
  taskLocation,
  taskPrice,
  taskId,
  notificationType,
  applicantName,
  message,
}: TaskNotificationEmailProps) {
  const getHeading = () => {
    switch (notificationType) {
      case 'new-application':
        return 'New Application Received!'
      case 'application-accepted':
        return 'Your Application Was Accepted!'
      case 'task-completed':
        return 'Task Completed Successfully!'
    }
  }

  const getMessage = () => {
    switch (notificationType) {
      case 'new-application':
        return `${applicantName} has applied for your task "${taskTitle}".`
      case 'application-accepted':
        return `Congratulations! Your application for "${taskTitle}" has been accepted.`
      case 'task-completed':
        return `The task "${taskTitle}" has been marked as completed.`
    }
  }

  const getButtonText = () => {
    switch (notificationType) {
      case 'new-application':
        return 'Review Application'
      case 'application-accepted':
        return 'View Task Details'
      case 'task-completed':
        return 'Leave a Review'
    }
  }

  return (
    <BaseEmail
      preview={getHeading()}
      heading={getHeading()}
    >
      <Text style={text}>Hi {recipientName},</Text>
      
      <Text style={text}>{getMessage()}</Text>

      {message && (
        <Section style={messageBox}>
          <Text style={messageText}>Message: "{message}"</Text>
        </Section>
      )}

      <Section style={taskDetails}>
        <Text style={detailsTitle}>Task Details:</Text>
        <Text style={detailsText}>
          <strong>Task:</strong> {taskTitle}
        </Text>
        <Text style={detailsText}>
          <strong>Location:</strong> {taskLocation}
        </Text>
        <Text style={detailsText}>
          <strong>Budget:</strong> ${taskPrice.toFixed(2)}
        </Text>
      </Section>

      <Section style={buttonContainer}>
        <Button
          style={button}
          href={`https://tasktap.com/tasks/${taskId}`}
        >
          {getButtonText()}
        </Button>
      </Section>
    </BaseEmail>
  )
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
}

const messageBox = {
  backgroundColor: '#f4f4f4',
  borderRadius: '4px',
  padding: '16px',
  margin: '16px 0',
}

const messageText = {
  color: '#333',
  fontSize: '14px',
  fontStyle: 'italic',
  margin: '0',
}

const taskDetails = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const detailsTitle = {
  color: '#111',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
}

const detailsText = {
  color: '#666',
  fontSize: '14px',
  margin: '0 0 8px',
}

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}