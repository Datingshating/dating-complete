import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { cn } from '../../utils/cn';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  style,
  textStyle,
}) => {
  const baseClasses = 'flex-row items-center justify-center rounded-full';
  
  const variantClasses = {
    default: 'bg-muted border border-hairline-borders',
    primary: 'bg-brand-accent',
    secondary: 'bg-teal-accent',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-error-color',
  };

  const sizeClasses = {
    sm: 'h-5 px-2 min-w-5',
    md: 'h-6 px-2.5 min-w-6',
    lg: 'h-7 px-3 min-w-7',
  };

  const textVariantClasses = {
    default: 'text-secondary-text',
    primary: 'text-primary-foreground',
    secondary: 'text-white',
    success: 'text-white',
    warning: 'text-white',
    error: 'text-white',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <View
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      style={[
        {
          shadowColor: variant === 'primary' || variant === 'secondary' ? '#000' : 'transparent',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 1,
        },
        style,
      ]}
    >
      <Text
        className={cn(
          textVariantClasses[variant],
          textSizeClasses[size],
          'text-center font-medium font-body'
        )}
        style={textStyle}
      >
        {children}
      </Text>
    </View>
  );
};

export default Badge;
