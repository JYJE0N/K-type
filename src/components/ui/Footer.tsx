"use client";

import { HelpCircle, Info, Github } from "lucide-react";

interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  return (
    <footer
      className={`footer mt-auto border-t border-text-secondary border-opacity-20 flex justify-center ${className}`}
    >
      <div className="w-full max-w-5xl px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <div className="text-sm text-text-secondary">
            Ⓒ2025 한글타입. 한글을 위한 타자연습 사이트 by Doomock.
          </div>

          <div className="flex items-center space-x-4 text-sm text-text-secondary">
            <button className="flex items-center space-x-2 hover:text-text-primary transition-colors">
              <HelpCircle size={16} />
              <span>Help</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-text-primary transition-colors">
              <Info size={16} />
              <span>Info</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-text-primary transition-colors">
              <Github size={16} />
              <span>GitHub</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
