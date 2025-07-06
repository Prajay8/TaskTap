'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types/database'
import { 
  Home, 
  Plus, 
  ClipboardList, 
  Search, 
  Briefcase
} from 'lucide-react'

interface DashboardNavProps {
  userRole: UserRole
}

export function DashboardNav({ userRole }: DashboardNavProps) {
  const pathname = usePathname()

  const customerLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/tasks/new', label: 'Post Task', icon: Plus },
    { href: '/tasks', label: 'My Tasks', icon: ClipboardList },
  ]

  const taskerLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/browse-tasks', label: 'Browse Tasks', icon: Search },
    { href: '/my-jobs', label: 'My Jobs', icon: Briefcase },
  ]

  const bothRoleLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/tasks/new', label: 'Post Task', icon: Plus },
    { href: '/tasks', label: 'My Tasks', icon: ClipboardList },
    { href: '/browse-tasks', label: 'Browse Tasks', icon: Search },
    { href: '/my-jobs', label: 'My Jobs', icon: Briefcase },
  ]

  const links = userRole === 'both' ? bothRoleLinks : 
                userRole === 'tasker' ? taskerLinks : 
                customerLinks

  return (
    <div className="flex space-x-1">
      {links.map((link) => {
        const Icon = link.icon
        const isActive = pathname === link.href
        
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{link.label}</span>
          </Link>
        )
      })}
    </div>
  )
}