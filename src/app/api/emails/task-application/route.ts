import { NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/email-service'

export async function POST(request: Request) {
  try {
    const { taskId, applicantId, message } = await request.json()
    
    await EmailService.sendTaskApplicationEmail(taskId, applicantId, message)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Application email API error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}