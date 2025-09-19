import React, { useState } from 'react';
import { TextInput, Text, View, ViewStyle, TextStyle } from 'react-native';
import { cn } from '../../utils/cn';

export interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  className?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helperText,
  disabled = false,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  className = '',
  style,
  inputStyle,
  labelStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const baseInputClasses = 'border rounded-xl px-4 py-3 text-base font-body transition-all duration-200';
  
  const inputVariantClasses = error
    ? 'border-error-color bg-white'
    : isFocused
    ? 'border-brand-accent bg-white shadow-sm'
    : disabled
    ? 'border-hairline-borders bg-muted'
    : 'border-hairline-borders bg-white';

  const textColorClasses = disabled 
    ? 'text-muted-foreground' 
    : 'text-primary-text';

  const placeholderColorClasses = 'text-placeholder-color';

  return (
    <View className={cn('w-full', className)} style={style}>
      {label && (
        <Text
          className="text-sm font-medium text-secondary-text mb-2 font-body"
          style={labelStyle}
        >
          {label}
        </Text>
      )}
      
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#7C7C7C"
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={!disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          baseInputClasses,
          inputVariantClasses,
          textColorClasses,
          multiline && 'min-h-20 text-top'
        )}
        style={[
          {
            shadowColor: isFocused && !error ? '#8A4B2A' : 'transparent',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: isFocused ? 1 : 0,
          },
          inputStyle,
        ]}
      />
      
      {(error || helperText) && (
        <Text
          className={cn(
            'text-xs mt-1 font-body',
            error ? 'text-error-color' : 'text-helper-text'
          )}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

export default Input;
