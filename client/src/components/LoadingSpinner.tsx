interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  overlay?: boolean
  message?: string
}

export function LoadingSpinner({ size = 'medium', overlay = false, message }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  }

  const borderWidth = {
    small: '1px',
    medium: '2px',
    large: '3px'
  }

  const containerClass = overlay ? 'loading-overlay' : 'section-loading'
  const spinnerClass = overlay ? 'loading-container' : 'loading-container'

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        <div className={spinnerClass} style={{ width: size === 'small' ? '32px' : size === 'medium' ? '48px' : '64px', height: size === 'small' ? '32px' : size === 'medium' ? '48px' : '64px' }}>
          <div 
            className="loading-inner one" 
            style={{ borderBottomWidth: borderWidth[size] }}
          ></div>
          <div 
            className="loading-inner two" 
            style={{ borderRightWidth: borderWidth[size] }}
          ></div>
          <div 
            className="loading-inner three" 
            style={{ borderTopWidth: borderWidth[size] }}
          ></div>
        </div>
        {message && (
          <p className="text-muted-foreground text-sm font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
