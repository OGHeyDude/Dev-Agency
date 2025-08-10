/**
 * Status Indicator Component - Traffic light style status indicators
 * 
 * @file StatusIndicator.tsx
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import React from 'react';
import clsx from 'clsx';

export type StatusLevel = 'healthy' | 'degraded' | 'unhealthy' | 'critical';
export type AgentStatus = 'running' | 'idle' | 'failed' | 'blocked' | 'recovering';

interface StatusIndicatorProps {
  status: StatusLevel | AgentStatus;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  animated?: boolean;
  onClick?: () => void;
  className?: string;
  label?: string;
}

const statusConfig = {
  // Health levels
  healthy: {
    color: 'bg-green-500',
    textColor: 'text-green-700',
    text: 'Healthy',
    pulse: 'animate-pulse-slow'
  },
  degraded: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    text: 'Degraded',
    pulse: 'animate-pulse'
  },
  unhealthy: {
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    text: 'Unhealthy',
    pulse: 'animate-ping-slow'
  },
  critical: {
    color: 'bg-red-500',
    textColor: 'text-red-700',
    text: 'Critical',
    pulse: 'animate-ping'
  },
  // Agent statuses
  running: {
    color: 'bg-green-500',
    textColor: 'text-green-700',
    text: 'Running',
    pulse: 'animate-pulse-slow'
  },
  idle: {
    color: 'bg-gray-400',
    textColor: 'text-gray-600',
    text: 'Idle',
    pulse: ''
  },
  failed: {
    color: 'bg-red-500',
    textColor: 'text-red-700',
    text: 'Failed',
    pulse: 'animate-ping'
  },
  blocked: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    text: 'Blocked',
    pulse: 'animate-pulse'
  },
  recovering: {
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    text: 'Recovering',
    pulse: 'animate-bounce-slow'
  }
};

const sizeConfig = {
  sm: {
    dot: 'h-2 w-2',
    text: 'text-xs',
    spacing: 'gap-1'
  },
  md: {
    dot: 'h-3 w-3',
    text: 'text-sm',
    spacing: 'gap-2'
  },
  lg: {
    dot: 'h-4 w-4',
    text: 'text-base',
    spacing: 'gap-2'
  }
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  showText = false,
  animated = true,
  onClick,
  className,
  label
}) => {
  const config = statusConfig[status];
  const sizeClasses = sizeConfig[size];

  if (!config) {
    console.warn(`Unknown status: ${status}`);
    return null;
  }

  const dotClasses = clsx(
    'rounded-full',
    sizeClasses.dot,
    config.color,
    {
      [config.pulse]: animated && status !== 'idle',
      'cursor-pointer hover:scale-110 transition-transform': onClick
    }
  );

  const containerClasses = clsx(
    'flex items-center',
    sizeClasses.spacing,
    className
  );

  const textClasses = clsx(
    'font-medium',
    sizeClasses.text,
    config.textColor
  );

  return (
    <div className={containerClasses} onClick={onClick} role={onClick ? 'button' : undefined}>
      <div 
        className={dotClasses}
        title={label || config.text}
        aria-label={label || config.text}
      />
      {showText && (
        <span className={textClasses}>
          {label || config.text}
        </span>
      )}
    </div>
  );
};

// Traffic light style indicator for overall status
interface TrafficLightProps {
  status: StatusLevel;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TrafficLight: React.FC<TrafficLightProps> = ({
  status,
  size = 'md',
  className
}) => {
  const sizeClasses = sizeConfig[size];

  const getLightOpacity = (lightStatus: StatusLevel) => {
    return status === lightStatus ? 'opacity-100' : 'opacity-20';
  };

  const getLightAnimation = (lightStatus: StatusLevel) => {
    if (status === lightStatus) {
      return statusConfig[lightStatus].pulse;
    }
    return '';
  };

  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {/* Critical - Red */}
      <div
        className={clsx(
          'rounded-full bg-red-500',
          sizeClasses.dot,
          getLightOpacity('critical'),
          getLightAnimation('critical')
        )}
        title="Critical"
      />
      
      {/* Unhealthy - Orange */}
      <div
        className={clsx(
          'rounded-full bg-orange-500',
          sizeClasses.dot,
          getLightOpacity('unhealthy'),
          getLightAnimation('unhealthy')
        )}
        title="Unhealthy"
      />
      
      {/* Degraded - Yellow */}
      <div
        className={clsx(
          'rounded-full bg-yellow-500',
          sizeClasses.dot,
          getLightOpacity('degraded'),
          getLightAnimation('degraded')
        )}
        title="Degraded"
      />
      
      {/* Healthy - Green */}
      <div
        className={clsx(
          'rounded-full bg-green-500',
          sizeClasses.dot,
          getLightOpacity('healthy'),
          getLightAnimation('healthy')
        )}
        title="Healthy"
      />
    </div>
  );
};

// Progress indicator for health scores
interface HealthScoreProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const HealthScore: React.FC<HealthScoreProps> = ({
  score,
  size = 'md',
  showText = true,
  className
}) => {
  const getScoreStatus = (score: number): StatusLevel => {
    if (score >= 90) return 'healthy';
    if (score >= 70) return 'degraded';
    if (score >= 50) return 'unhealthy';
    return 'critical';
  };

  const status = getScoreStatus(score);
  const config = statusConfig[status];
  const sizeClasses = sizeConfig[size];

  const progressWidth = Math.max(0, Math.min(100, score));
  
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className={clsx('flex-1 bg-gray-200 rounded-full overflow-hidden', {
        'h-2': size === 'sm',
        'h-3': size === 'md',
        'h-4': size === 'lg'
      })}>
        <div
          className={clsx('h-full transition-all duration-500 ease-out', config.color)}
          style={{ width: `${progressWidth}%` }}
        />
      </div>
      {showText && (
        <span className={clsx('font-mono font-medium', sizeClasses.text, config.textColor)}>
          {score}%
        </span>
      )}
    </div>
  );
};

export default StatusIndicator;