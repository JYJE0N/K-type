"use client";

import { IoGitBranchOutline } from "react-icons/io5";

interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  return (
    <footer
      className={`footer mt-auto border-t border-text-secondary border-opacity-10 flex justify-center ${className}`}
    >
      <div
        className="w-full max-w-5xl"
        style={{ padding: "var(--spacing-lg) var(--spacing-xl)" }}
      >
        <div className="flex items-center justify-between">
          <div className="text-caption text-text-tertiary">
            Ⓒ 2025 월루타자기. All rights reserved.
          </div>
          <div className="flex items-center gap-3">
            <span className="text-caption text-text-tertiary">Made by Doomock</span>
            <a
              href="https://github.com/JYJE0N"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-text-tertiary hover:text-interactive-primary transition-colors"
              aria-label="GitHub"
            >
              <IoGitBranchOutline className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
