"use client";

interface KeyCapProps {
  children: React.ReactNode;
  size?: 'sm' | 'base' | 'lg';
  variant?: 'default' | 'accent';
  className?: string;
}

export function KeyCap({ 
  children, 
  size = 'base', 
  variant = 'default',
  className = '' 
}: KeyCapProps) {
  
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs min-w-[24px] h-5',
    base: 'px-2 py-1 text-xs min-w-[28px] h-6',
    lg: 'px-3 py-1.5 text-sm min-w-[32px] h-8'
  };

  const variantClasses = {
    default: 'bg-background-secondary border-text-tertiary text-text-secondary',
    accent: 'bg-interactive-primary border-interactive-primary text-text-inverse'
  };

  return (
    <kbd 
      className={`
        inline-flex items-center justify-center
        border border-opacity-40 rounded
        font-mono font-medium
        shadow-sm
        transition-all duration-150
        transform
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      style={{
        // 키캡 3D 효과
        boxShadow: variant === 'accent' 
          ? '0 2px 0 var(--color-interactive-primary-hover), 0 2px 4px rgba(0,0,0,0.1)'
          : '0 2px 0 var(--color-text-tertiary), 0 2px 4px rgba(0,0,0,0.1)',
        borderBottomWidth: '2px'
      }}
    >
      {children}
    </kbd>
  );
}