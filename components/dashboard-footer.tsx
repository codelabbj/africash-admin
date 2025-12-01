"use client"

import Link from "next/link"

export function DashboardFooter() {
  return (
    <footer className="border-t border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="flex items-center justify-center px-6 py-4">
        <p className="text-sm text-muted-foreground">
          Développé par{" "}
          <Link
            href="https://codelab.bj/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold hover:text-primary/80 hover:underline transition-colors"
          >
            Code Lab
          </Link>
        </p>
      </div>
    </footer>
  )
}

