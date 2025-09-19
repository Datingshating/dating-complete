import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { cn } from '../../utils/cn';

export interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'selected' | 'disabled';
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Chip: React.FC<ChipProps> = ({
  children,
  variant = 'default',
  size = 'md',
  onPress,
  disabled = false,
  className = '',
  style,
  textStyle,
}) => {
  const isDisabled = disabled || variant === 'disabled';

  const baseClasses = 'flex-row items-center justify-center rounded-full border transition-all duration-200';
  
  const variantClasses = {
    default: isDisabled
      ? 'bg-card-paper border-hairline-borders'
      : 'bg-card-paper border-hairline-borders active:bg-hover-bg',
    selected: 'bg-brand-accent border-brand-accent shadow-chip',
    disabled: 'bg-muted border-hairline-borders',
  };

  const sizeClasses = {
    sm: 'h-7 px-3',
    md: 'h-9 px-4',
    lg: 'h-11 px-5',
  };

  const textVariantClasses = {
    default: isDisabled ? 'text-muted-foreground' : 'text-secondary-text',
    selected: 'text-primary-foreground font-medium',
    disabled: 'text-muted-foreground',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
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
          shadowColor: variant === 'selected' ? '#8A4B2A' : 'transparent',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: variant === 'selected' ? 0.25 : 0,
          shadowRadius: variant === 'selected' ? 3 : 0,
          elevation: variant === 'selected' ? 2 : 0,
        },
        style,
      ]}
      activeOpacity={0.8}
    >
      <Text
        className={cn(
          textVariantClasses[variant],
          textSizeClasses[size],
          'text-center font-body'
        )}
        style={textStyle}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};

export default Chip;
