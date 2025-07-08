import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components'

interface BaseEmailProps {
  preview: string
  heading: string
  children: React.ReactNode
  footerText?: string
}

export function BaseEmail({
  preview,
  heading,
  children,
  footerText = 'You received this email because you are registered on TaskTap.',
}: BaseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>
              Task<span style={logoBlue}>Tap</span>
            </Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>{heading}</Heading>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerTextStyle}>{footerText}</Text>
            <Hr style={hr} />
            <Text style={footerLinks}>
              <Link href="https://tasktap.com/help" style={link}>
                Help Center
              </Link>
              {' • '}
              <Link href="https://tasktap.com/privacy" style={link}>
                Privacy Policy
              </Link>
              {' • '}
              <Link href="https://tasktap.com/unsubscribe" style={link}>
                Unsubscribe
              </Link>
            </Text>
            <Text style={copyright}>
              © {new Date().getFullYear()} TaskTap. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 48px 24px',
  textAlign: 'center' as const,
}

const logo = {
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
}

const logoBlue = {
  color: '#2563eb',
}

const content = {
  padding: '0 48px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  padding: '0',
}

const footer = {
  padding: '32px 48px',
  textAlign: 'center' as const,
}

const footerTextStyle = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const footerLinks = {
  color: '#666',
  fontSize: '12px',
  lineHeight: '24px',
  margin: '0 0 8px',
}

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const copyright = {
  color: '#8898aa',
  fontSize: '12px',
  margin: '0',
}