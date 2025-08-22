"use client";

import React from "react";
import { IoGitBranchOutline } from "react-icons/io5";
import { layoutStyles } from '@/utils/styles';

interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`${layoutStyles.footer} ${className}`}>
      <div className="w-full max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-muted">
            © 2025 월루타자기. All rights reserved.
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-text-muted">Made by Doomock</span>

            <a
              href="https://github.com/JYJE0N"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              className="h-10 w-10 p-2 rounded-md text-text-muted hover:text-white hover:bg-gray-800 transition-colors flex items-center justify-center"
            >
              <IoGitBranchOutline className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
