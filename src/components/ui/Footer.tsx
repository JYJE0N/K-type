"use client";

import { Github } from 'lucide-react';

interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  return (
    <footer
      className={`footer mt-auto border-t border-text-secondary border-opacity-10 flex justify-center ${className}`}
    >
      <div className="w-full max-w-5xl" style={{ padding: 'var(--spacing-lg) var(--spacing-xl)' }}>
        <div className="flex items-center justify-between">
          <div className="caption text-muted">
            © 2025 K-Types
          </div>
          <div className="flex items-center gap-3">
            <span className="caption text-muted">Made by Doomock</span>
            <a 
              href="https://github.com/Doomock"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-muted hover:text-primary transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}