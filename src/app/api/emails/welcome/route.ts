import { NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/email-service'

export async function POST(request: Request) {
  try {
    const { userId, email, name, userType } = await request.json()
    
    await EmailService.sendWelcomeEmail(userId, email, name, userType)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Welcome email API error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}