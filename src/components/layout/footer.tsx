'use client';
import React from 'react'

const Footer = () => {
    return (
        <footer className="border-t py-6 md:py-0">
            <div className="w-full px-6 flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
            <p className="text-sm text-muted-foreground">
                Built with ❤️ for humanitarian aid tracking in Gaza
            </p>
            <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Gaza Aid Sync. All rights reserved.
            </p>
            </div>
        </footer>
    )
}

export default Footer