import React from 'react';
import { View, ViewStyle } from 'react-native';
import { cn } from '../../utils/cn';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  style,
  onPress,
  disabled = false,
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-card-paper border border-hairline-borders shadow-card',
    elevated: 'bg-card-paper border border-hairline-borders shadow-lg',
    outlined: 'bg-transparent border-2 border-hairline-borders',
    flat: 'bg-card-paper',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const interactiveClasses = onPress && !disabled 
    ? 'active:scale-98 active:shadow-md' 
    : '';

  return (
    <View
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        interactiveClasses,
        className
      )}
      style={[
        {
          shadowColor: variant === 'elevated' ? '#000' : 'rgba(17, 24, 39, 0.08)',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: variant === 'elevated' ? 0.1 : 0.05,
          shadowRadius: variant === 'elevated' ? 8 : 4,
          elevation: variant === 'elevated' ? 4 : 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default Card;
