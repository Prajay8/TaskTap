import { NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/email-service'

export async function POST(request: Request) {
  try {
    const { taskId } = await request.json()
    
    await EmailService.sendTaskCompletedEmail(taskId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Completion email API error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}