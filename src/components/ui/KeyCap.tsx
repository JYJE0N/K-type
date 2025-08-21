"use client";

interface KeyCapProps {
  children: React.ReactNode;
  size?: 'sm' | 'base' | 'lg';
  variant?: 'default' | 'accent' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function KeyCap({ 
  children, 
  size = 'base', 
  variant = 'default',
  className = '' 
}: KeyCapProps) {
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs min-w-[28px] h-6',
    base: 'px-3 py-1 text-sm min-w-[36px] h-7',
    lg: 'px-4 py-1.5 text-base min-w-[44px] h-9'
  };

  const variantClasses = {
    default: 'bg-[#3f3f3f]/80 text-gray-400 border-[#5d5d5d]',
    accent: 'bg-[#c395fd]/20 text-[#c395fd] border-[#c395fd]/50',
    primary: 'bg-[#c395fd]/25 text-[#d4b0ff] border-[#c395fd]/60',
    success: 'bg-[#1adfcc]/20 text-[#1adfcc] border-[#1adfcc]/50',
    warning: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
    danger: 'bg-red-500/20 text-red-300 border-red-500/50',
    info: 'bg-[#1adfcc]/15 text-[#4de8d9] border-[#1adfcc]/40'
  };

  return (
    <kbd 
      className={`
        inline-flex items-center justify-center
        border rounded-md
        font-mono font-semibold
        transition-all duration-200
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      style={{
        boxShadow: '0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.5)',
        textShadow: '0 1px 0 rgba(0,0,0,0.5)'
      }}
    >
      {children}
    </kbd>
  );
}