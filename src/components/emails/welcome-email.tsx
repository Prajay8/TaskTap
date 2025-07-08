import * as React from 'react'
import { Text, Button, Section } from '@react-email/components'
import { BaseEmail } from './base-email'

interface WelcomeEmailProps {
  name: string
  userType: 'customer' | 'tasker' | 'both'
}

export function WelcomeEmail({ name, userType }: WelcomeEmailProps) {
  const getWelcomeMessage = () => {
    switch (userType) {
      case 'customer':
        return 'Get started by posting your first task and connecting with skilled taskers in your area.'
      case 'tasker':
        return 'Start browsing available tasks and begin earning money with your skills.'
      case 'both':
        return 'You can now post tasks as a customer and offer your services as a tasker.'
    }
  }

  return (
    <BaseEmail
      preview="Welcome to TaskTap - Get started today!"
      heading={`Welcome to TaskTap, ${name}!`}
    >
      <Text style={text}>
        We're excited to have you join our community of customers and skilled taskers.
      </Text>
      
      <Text style={text}>
        {getWelcomeMessage()}
      </Text>

      <Section style={buttonContainer}>
        <Button
          style={button}
          href={userType === 'tasker' ? 'https://tasktap.com/browse-tasks' : 'https://tasktap.com/tasks/new'}
        >
          {userType === 'tasker' ? 'Browse Tasks' : 'Post Your First Task'}
        </Button>
      </Section>

      <Text style={text}>
        If you have any questions, our support team is here to help!
      </Text>
    </BaseEmail>
  )
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
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