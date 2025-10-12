'use client'

import React, { useState, useEffect } from 'react'
import { X, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom';

interface DomainMigrationNotificationProps {
    className?: string
}

export function DomainMigrationNotification({ className }: DomainMigrationNotificationProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)

    useEffect(() => {
            // Check if user is coming from the old Vercel domain
            const isFromOldDomain = window.location.hostname === 'gaza-aid-sync.vercel.app'
            const hasBeenDismissed = localStorage.getItem('domain-migration-dismissed') === 'true'
            
            if (isFromOldDomain && !hasBeenDismissed) {
                setIsVisible(true)
            }
    }, [])

    const handleDismiss = () => {
        setIsVisible(false)
        setIsDismissed(true)
        localStorage.setItem('domain-migration-dismissed', 'true')
    }

    const handleRedirect = () => {
        // Redirect to the new domain
        window.location.href = 'https://www.gaza.family' + window.location.pathname + window.location.search
    }

    if (!isVisible || isDismissed) {
        return null
    }

    // Check if a browser environment exists before creating the portal
    if (typeof window === 'undefined') {
        return null;
    }

    return createPortal(
        <div className={cn(
        "fixed top-0 left-0 right-0 z-[9999] p-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200 shadow-lg animate-in slide-in-from-top-2 duration-500",
        className
        )}>
            <Card className="max-w-4xl mx-auto border-red-200 bg-white/95 backdrop-blur-sm shadow-xl">
                <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-100 to-orange-100 flex items-center justify-center animate-pulse">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {`Important: We've Moved to Our Own Servers`}
                        </h3>
                        
                        <div className="space-y-3 text-sm text-gray-700">
                            <p>
                            <strong>Gaza Aid Sync</strong> has moved to our own infrastructure at{' '}
                            <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                www.gaza.family
                            </span>
                            </p>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-blue-800">
                                <strong>Why we moved:</strong> {`We transitioned away from Vercel following their CEO's 
                                public meeting with Israeli Prime Minister Benjamin Netanyahu, which we view as 
                                incompatible with our mission to support humanitarian aid in Gaza.`}
                            </p>
                            </div>

                            <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">
                                All your data and functionality remains exactly the same on our new platform.
                            </span>
                            </div>
                        </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                        <Button
                            onClick={handleRedirect}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md"
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Visit New Site
                        </Button>
                        
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDismiss}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-4 h-4 mr-1" />
                            Dismiss
                        </Button>
                        </div>
                    </div>
                    </div>
                </div>
                </CardContent>
            </Card>
        </div>,
        document.body // Append the element to the body
    )
}
