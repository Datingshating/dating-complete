import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { cn } from '../../utils/cn';

export interface TabHeaderProps {
  tabs: Array<{
    id: string;
    label: string;
    badge?: number;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: ViewStyle;
}

const TabHeader: React.FC<TabHeaderProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  className = '',
  style,
}) => {
  const baseClasses = 'flex-row';
  
  const variantClasses = {
    default: 'bg-card-paper border-b border-hairline-borders',
    pills: 'bg-muted p-1 rounded-xl',
    underline: 'bg-transparent border-b border-hairline-borders',
  };

  const tabBaseClasses = 'flex-row items-center justify-center transition-all duration-200';
  
  const tabVariantClasses = {
    default: {
      active: 'border-b-2 border-brand-accent',
      inactive: 'border-b-2 border-transparent',
    },
    pills: {
      active: 'bg-card-paper shadow-sm',
      inactive: 'bg-transparent',
    },
    underline: {
      active: 'border-b-2 border-brand-accent',
      inactive: 'border-b-2 border-transparent',
    },
  };

  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <View
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      style={style}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            className={cn(
              tabBaseClasses,
              tabVariantClasses[variant][isActive ? 'active' : 'inactive'],
              sizeClasses[size],
              'active:scale-95'
            )}
            activeOpacity={0.8}
          >
            <Text
              className={cn(
                textSizeClasses[size],
                'font-medium font-body',
                isActive 
                  ? 'text-brand-accent' 
                  : 'text-secondary-text'
              )}
            >
              {tab.label}
            </Text>
            
            {tab.badge && tab.badge > 0 && (
              <View className="ml-2">
                <View className="bg-brand-accent rounded-full min-w-5 h-5 flex items-center justify-center">
                  <Text className="text-xs text-primary-foreground font-bold">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default TabHeader;
