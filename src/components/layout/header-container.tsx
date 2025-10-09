'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '../ui/button'
import { Menu, HelpCircle, Settings, Github } from 'lucide-react'
import { MainNav } from '../main-nav'
import { CommandMenu } from '../command-menu'
import { UserNav } from '../user-nav'
import { MobileNav } from '../mobile-nav'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from '@/lib/utils'

const HeaderContainer = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [stats, setStats] = useState({ stars: 0, forks: 0 })
  const [displayStats, setDisplayStats] = useState({ stars: 0, forks: 0 })
  const [hover, setHover] = useState(false)
  const [autoFlip, setAutoFlip] = useState(false)

  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || 'barhouum7/gazaaidsync'
  const repoApiUrl = `https://api.github.com/repos/${repo}`
  const repoUrl = `https://github.com/${repo}`

  useEffect(() => setIsMounted(true), [])
  
  // Fetch GitHub repo stats with caching
  useEffect(() => {
    const controller = new AbortController()
    const cacheKey = `github_repo_stats_${repo}`
    const cacheTTL = 1000 * 60 * 60 // 1 hour

    const fetchRepoStats = async () => {
      try {
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          const { stars, forks, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < cacheTTL) {
            setStats({ stars, forks })
            return
          }
        }

        const res = await fetch(repoApiUrl, {
          headers: { Accept: 'application/vnd.github+json' },
          signal: controller.signal,
        })
        if (!res.ok) return

        const data = await res.json()
        const stars = Number(data.stargazers_count) || 0
        const forks = Number(data.forks_count) || 0
        setStats({ stars, forks })
        localStorage.setItem(cacheKey, JSON.stringify({ stars, forks, timestamp: Date.now() }))
      } catch {
        /* silent fail */
      }
    }

    fetchRepoStats()
    return () => controller.abort()
  }, [repo, repoApiUrl])

  // Animate number counter
  useEffect(() => {
    if (!stats.stars && !stats.forks) return
    const duration = 700
    const steps = 30
    let frame = 0

    const animate = () => {
      frame++
      const progress = frame / steps
      setDisplayStats({
        stars: Math.round(stats.stars * progress),
        forks: Math.round(stats.forks * progress),
      })
      if (frame < steps) requestAnimationFrame(animate)
      else setDisplayStats(stats)
    }
    animate()
  }, [stats])

  // Auto-flip effect (smooth fade instead of toggle glitch)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!hover) {
        setAutoFlip(true)
        setTimeout(() => setAutoFlip(false), 12000)
      }
    }, 18000)
    return () => clearInterval(interval)
  }, [hover])
  if (!isMounted) return null

  return (
    <>
      <header
        className="relative sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        style={{
          backgroundImage: 'url("/assets/keffiyeh-bg.svg")',
          backgroundSize: 'cover',
        }}
      >

        <div className="flex items-center justify-between h-14 px-6">
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Navigation */}
          <MainNav />

          {/* Actions */}
            <div className="flex items-center space-x-3">
                <TooltipProvider>
                    <div className="hidden md:flex items-center space-x-2">
                        {/* Help */}
                        <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" asChild>
                            <Link href="/help" aria-label="Help">
                                <HelpCircle className="h-4 w-4" />
                            </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Help</TooltipContent>
                        </Tooltip>

                        {/* Settings */}
                        <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" asChild>
                            <Link href="/settings" aria-label="Settings">
                                <Settings className="h-4 w-4" />
                            </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Settings</TooltipContent>
                        </Tooltip>

                    </div>
                    
                    {/* GitHub CTA */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                            href={repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                            aria-label={`View ${repo} on GitHub`}
                            className={cn(
                                "flex items-center px-3 py-1.5 rounded-full border border-border text-xs font-medium transition-all duration-300 select-none",
                                (hover || autoFlip)
                                ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white shadow-md"
                                : "bg-background text-muted-foreground hover:border-green-500 hover:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                            )}
                            >
                            <Github className="h-4 w-4 mr-2" />
                            <span className="transition-all duration-300">
                                {(hover || autoFlip)
                                ? "⭐ Star on GitHub"
                                : `${displayStats.stars.toLocaleString()} ★ | ${displayStats.forks.toLocaleString()} ⑂`}
                            </span>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent>View & contribute on GitHub</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <CommandMenu />
                <UserNav />
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  )
}

export default HeaderContainer
