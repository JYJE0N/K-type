"use client";

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
            Ⓒ2025 K Types. 한글을 위한 타자연습 사이트 by Doomock.
          </div>

          <div className="flex items-center space-x-4 text-sm text-text-secondary">
            <button className="hover:text-text-primary transition-colors">
              Help
            </button>
            <button className="hover:text-text-primary transition-colors">
              Info
            </button>
            <button className="hover:text-text-primary transition-colors">
              GitHub
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
