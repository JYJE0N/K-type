"use client";

import React from "react";
import { IoGitBranchOutline } from "react-icons/io5";
import { Button } from "@/design-system/ui";

interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`mt-auto bg-gray-900 ${className}`}>
      <div className="w-full max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-muted">
            © 2025 월루타자기. All rights reserved.
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-text-muted">Made by Doomock</span>

            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0"
            >
              <a
                href="https://github.com/JYJE0N"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Profile"
                className="text-text-muted hover:text-white transition-colors"
              >
                <IoGitBranchOutline className="w-6 h-6 text-text-muted" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
