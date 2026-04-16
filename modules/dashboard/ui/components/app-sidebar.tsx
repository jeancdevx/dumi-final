'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  ChevronRight,
  ChevronsUpDown,
  FileText,
  LayoutDashboard,
  LogOut,
  PackageIcon,
  Settings,
  Shirt,
  UserRound,
  Users
} from 'lucide-react'

import { signOut } from '@/modules/auth/actions/sign-out'
import type { Role } from '@/modules/auth/types'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavGroup {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: NavItem[]
}

interface AppSidebarProps {
  user: {
    names: string
    lastNames: string
    email: string
    roles: Role[]
  }
}

const adminNavGroups: NavGroup[] = [
  {
    title: 'General',
    icon: LayoutDashboard,
    items: [
      {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard
      }
    ]
  },
  {
    title: 'Gestión',
    icon: Settings,
    items: [
      {
        title: 'Empleados',
        href: '/admin/employees',
        icon: Users
      },
      {
        title: 'Clientes',
        href: '/admin/clients',
        icon: UserRound
      },
      {
        title: 'Prendas',
        href: '/admin/clothes',
        icon: Shirt
      },
      {
        title: 'Cotizaciones',
        href: '/admin/quotations',
        icon: FileText
      },
      {
        title: 'Órdenes',
        href: '/admin/orders',
        icon: PackageIcon
      }
    ]
  }
]

const sellerNavGroups: NavGroup[] = [
  {
    title: 'General',
    icon: LayoutDashboard,
    items: [
      {
        title: 'Dashboard',
        href: '/seller',
        icon: LayoutDashboard
      }
    ]
  },
  {
    title: 'Gestión',
    icon: Settings,
    items: [
      {
        title: 'Clientes',
        href: '/seller/clients',
        icon: UserRound
      },
      {
        title: 'Prendas',
        href: '/seller/clothes',
        icon: Shirt
      },
      {
        title: 'Cotizaciones',
        href: '/seller/quotations',
        icon: FileText
      },
      {
        title: 'Órdenes',
        href: '/seller/orders',
        icon: PackageIcon
      }
    ]
  }
]

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()

  const isAdmin = user.roles.includes('owner')
  const navGroups = isAdmin ? adminNavGroups : sellerNavGroups

  const initials =
    `${user.names.charAt(0)}${user.lastNames.charAt(0)}`.toUpperCase()
  const fullName = `${user.names} ${user.lastNames}`

  function isGroupActive(group: NavGroup) {
    return group.items.some(item => pathname === item.href)
  }

  return (
    <Sidebar>
      <SidebarHeader className='border-b p-4'>
        <Link href='/' className='flex items-center gap-2'>
          <div className='bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold'>
            D
          </div>
          <span className='text-lg font-semibold'>TELAR</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map(group => (
          <Collapsible
            key={group.title}
            defaultOpen={isGroupActive(group)}
            className='group/collapsible'
          >
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className='flex w-full items-center'>
                  <group.icon className='mr-2 h-4 w-4' />
                  {group.title}
                  <ChevronRight className='ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90' />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {group.items.map(item => (
                    <SidebarMenuSubItem key={item.href}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={pathname === item.href}
                      >
                        <Link href={item.href}>
                          <item.icon className='h-4 w-4' />
                          {item.title}
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>

      <SidebarFooter className='border-t p-2'>
        <Popover>
          <PopoverTrigger asChild>
            <button className='hover:bg-sidebar-accent flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors'>
              <Avatar className='h-9 w-9'>
                <AvatarFallback className='bg-primary/10 text-primary text-sm'>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-1 flex-col overflow-hidden'>
                <span className='truncate text-sm font-medium'>{fullName}</span>
                <span className='text-muted-foreground truncate text-xs'>
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className='text-muted-foreground h-4 w-4 shrink-0' />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className='w-64 p-0'
            side='top'
            align='start'
            sideOffset={8}
          >
            <div className='p-3'>
              <div className='flex items-center gap-3'>
                <Avatar className='h-10 w-10'>
                  <AvatarFallback className='bg-primary/10 text-primary'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className='flex flex-col overflow-hidden'>
                  <span className='truncate text-sm font-medium'>
                    {fullName}
                  </span>
                  <span className='text-muted-foreground truncate text-xs'>
                    {user.email}
                  </span>
                </div>
              </div>
            </div>
            <Separator />
            <div className='p-1'>
              <form action={signOut} className='w-full'>
                <button
                  type='submit'
                  className='text-destructive hover:bg-destructive/10 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors'
                >
                  <LogOut className='h-4 w-4' />
                  <span>Cerrar sesión</span>
                </button>
              </form>
            </div>
          </PopoverContent>
        </Popover>
      </SidebarFooter>
    </Sidebar>
  )
}
