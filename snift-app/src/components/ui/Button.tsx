import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { cn } from '../../utils/cn';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'disabled';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onPress,
  disabled = false,
  loading = false,
  className = '',
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const baseClasses = 'flex-row items-center justify-center rounded-xl transition-all duration-200';
  
  const variantClasses = {
    primary: isDisabled 
      ? 'bg-muted border border-hairline-borders' 
      : 'bg-brand-accent border border-brand-accent shadow-brand active:shadow-brand-hover',
    secondary: isDisabled
      ? 'bg-transparent border border-hairline-borders'
      : 'bg-transparent border border-brand-accent',
    disabled: 'bg-muted border border-hairline-borders',
  };

  const sizeClasses = {
    sm: 'h-10 px-4',
    md: 'h-12 px-6',
    lg: 'h-14 px-8',
  };

  const textVariantClasses = {
    primary: isDisabled ? 'text-muted-foreground' : 'text-primary-foreground font-semibold',
    secondary: isDisabled ? 'text-muted-foreground' : 'text-brand-accent font-semibold',
    disabled: 'text-muted-foreground',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const handlePress = () => {
    if (!isDisabled && onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        !isDisabled && 'active:scale-95',
        className
      )}
      style={[
        {
          shadowColor: variant === 'primary' && !isDisabled ? '#8A4B2A' : 'transparent',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        },
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' && !isDisabled ? '#FAF7F3' : '#8A4B2A'} 
        />
      ) : (
        <Text
          className={cn(
            textVariantClasses[variant],
            textSizeClasses[size],
            'text-center font-heading'
          )}
          style={textStyle}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
