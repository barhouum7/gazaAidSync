'use client'
import React from 'react'

const Footer = () => {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || 'v0.1.15'
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || 'barhouum7/gazaaidsync'
  const repoUrl = `https://github.com/${repo}`

  return (
    <footer className="border-t py-6 md:py-0">
      <div className="w-full px-6 flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
        <p className="text-sm text-muted-foreground text-center md:text-left leading-relaxed max-w-xl">
          Built with 
            <span className="loader inline-block mt-2 -mr-2.5 ml-1 align-middle">
              <span className='animate-pulse'></span>
            </span>
            <span className='inline-block align-middle text-red-500 mb-0.5 mr-0.5 ml-1'>
              ❤️
            </span>
          by{" "}
          <a
            href="https://www.linkedin.com/in/ibrahimbs/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline text-primary"
          >
            IbrahimBS
          </a>. <br className="md:hidden" />
          Empowering transparency and humanitarian aid tracking for Gaza.{" "}
          If this project inspires you, please{" "}
          <a
            href="https://donate.unrwa.org/int/en/gaza"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline text-primary"
          >
            support displaced families in Gaza
          </a>.
        </p>

        <p className="text-sm text-muted-foreground text-center md:text-right">
          © {new Date().getFullYear()} <b>GazaAidSync {version}</b>
          <span className="mx-2">·</span>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline text-primary"
          >
            Open source
          </a>
        </p>
      </div>
    </footer>
  )
}

export default Footer
