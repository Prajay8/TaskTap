import { NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/email-service'

export async function POST(request: Request) {
  try {
    const { taskId, taskerId } = await request.json()
    
    await EmailService.sendApplicationAcceptedEmail(taskId, taskerId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Acceptance email API error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}