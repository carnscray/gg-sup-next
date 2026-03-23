// components/app-sidebar.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { GalleryVerticalEnd } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { useSidebar } from "@/components/ui/sidebar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { navConfig } from "@/lib/nav-config"

type SidebarUser = {
  name: string
  email: string
  avatar?: string
}

type NavSubItem = {
  title: string
  url: string
  requiresAdmin?: boolean
}

type NavMainItem = {
  title: string
  url: string
  icon?: React.ElementType
  isActive?: boolean
  requiresAdmin?: boolean
  items?: NavSubItem[]
}

type TopLinkItem = {
  title: string
  url: string
  icon?: React.ElementType
  requiresAdmin?: boolean
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  isAdmin: boolean
  user: SidebarUser
}

function SidebarHeaderContent({ isAdmin }: { isAdmin: boolean }) {
  const { state } = useSidebar()

  if (state === "collapsed") {
    return null
  }

  return (
    <TeamSwitcher
      teams={[
        {
          name: "MPPP",
          logo: GalleryVerticalEnd,
          plan: isAdmin ? "Admin" : "Standard",
        },
      ]}
    />
  )
}

function SidebarTopLinks({ items }: { items: TopLinkItem[] }) {
  const { state } = useSidebar()

  if (state === "collapsed" || items.length === 0) {
    return null
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((link) => (
          <SidebarMenuItem key={link.title}>
            <SidebarMenuButton asChild tooltip={link.title}>
              <Link href={link.url}>
                {link.icon ? <link.icon /> : null}
                <span>{link.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function SidebarMainContent({ items }: { items: NavMainItem[] }) {
  const { state } = useSidebar()

  if (state === "collapsed") {
    return null
  }

  return <NavMain items={items} />
}

export function AppSidebar({
  isAdmin,
  user,
  ...props
}: AppSidebarProps) {
  const filteredTopLinks = React.useMemo<TopLinkItem[]>(() => {
    return (navConfig.topLinks as TopLinkItem[]).filter(
      (link) => !link.requiresAdmin || isAdmin
    )
  }, [isAdmin])

  const filteredNavMain = React.useMemo<NavMainItem[]>(() => {
    return (navConfig.navMain as NavMainItem[])
      .map((entry) => {
        if (entry.items) {
          return {
            ...entry,
            items: entry.items.filter(
              (item) => !item.requiresAdmin || isAdmin
            ),
          }
        }

        return entry
      })
      .filter((entry) => {
        if (entry.requiresAdmin && !isAdmin) return false
        if (entry.items) return entry.items.length > 0
        return true
      })
  }, [isAdmin])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarHeaderContent isAdmin={isAdmin} />
      </SidebarHeader>

      <SidebarContent className="overflow-hidden">
        <SidebarTopLinks items={filteredTopLinks} />
        <SidebarMainContent items={filteredNavMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}