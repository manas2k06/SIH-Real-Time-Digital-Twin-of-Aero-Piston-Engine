import React from 'react';
import { SystemStatus, MotorStatus } from '../../types/telemetry';
import { AnomalySeverity } from '../../types/prediction';

type StatusType = SystemStatus | MotorStatus | AnomalySeverity | 'LIVE' | 'CONNECTED' | 'SYNCED' | 'DISCONNECTED' | 'STANDBY' | 'PAUSED' | 'FAILSAFE' | 'AUTO';

interface StatusBadgeProps {
  status: StatusType | string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const s = status.toUpperCase();

  let containerClasses = 'bg-[#efeae2] text-[#5c544d] border-[#ded5c7]';
  let indicatorColor = 'bg-[#786c5f]';

  if (s === 'NORMAL' || s === 'LIVE' || s === 'CONNECTED' || s === 'SYNCED' || s === 'AUTO') {
    containerClasses = 'bg-[#2d6a4f]/10 text-[#2d6a4f] border-[#2d6a4f]/20 font-bold';
    indicatorColor = 'bg-[#2d6a4f]';
  } else if (s === 'WARNING' || s === 'DEGRADED' || s === 'LOW_RISK' || s === 'PAUSED' || s === 'STANDBY') {
    containerClasses = 'bg-[#fef3c7] text-[#d97706] border-[#fde68a] font-bold';
    indicatorColor = 'bg-[#d97706]';
  } else if (s === 'CRITICAL' || s === 'FAULT' || s === 'DISCONNECTED' || s === 'FAILSAFE') {
    containerClasses = 'bg-[#fee2e2] text-[#dc2626] border-[#fca5a5] font-bold';
    indicatorColor = 'bg-[#dc2626]';
  } else if (s === 'OFFLINE') {
    containerClasses = 'bg-[#efeae2] text-[#8c8074] border-[#ded5c7]';
    indicatorColor = 'bg-[#8c8074]';
  }

  const sizeClasses = size === 'sm' 
    ? 'text-[9px] px-2 py-0.5 tracking-wider' 
    : 'text-[10px] px-2.5 py-1 tracking-wider';

  return (
    <span
      className={`inline-flex items-center space-x-1.5 font-mono rounded-full border ${sizeClasses} ${containerClasses} select-none shadow-2xs`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${indicatorColor}`} />
      <span>{s}</span>
    </span>
  );
};
