import { cn } from '@/lib/cn/cn';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const buttonVariants = {
  default: 'bg-blue-500 text-white hover:bg-blue-600',
  outline: 'border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white',
};

const buttonSizes = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', className, ...props }, ref) => {
    const variantClass = buttonVariants[variant];
    const sizeClass = buttonSizes[size];
    const combinedClasses = cn('rounded transition-all focus:outline-none', variantClass, sizeClass, className);

    return <button ref={ref} className={combinedClasses} {...props} />;
  }
);

Button.displayName = 'Button';

export default Button;
