import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ServerIcon, FolderIcon } from './Icons';

interface StatusBarProps {
  darkMode: boolean;
  refreshTrigger: number;
}

const StatusBar = ({ darkMode, refreshTrigger }: StatusBarProps) => {
  const [hostCount, setHostCount] = useState(0);
  const [groupCount, setGroupCount] = useState(0);

  useEffect(() => {
    invoke<any[]>('get_hosts').then(h => setHostCount(h.length)).catch(() => {});
    invoke<any[]>('get_groups').then(g => setGroupCount(g.length)).catch(() => {});
  }, [refreshTrigger]);

  const bg = darkMode ? '#0d1117' : '#f1f5f9';
  const border = darkMode ? '#2d3748' : '#e2e8f0';
  const color = darkMode ? '#64748b' : '#94a3b8';

  const Item = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color }}>
      {icon}
      {label}
    </div>
  );

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      padding: '5px 16px',
      background: bg,
      borderTop: `1px solid ${border}`,
      fontSize: '12px',
    }}>
      <Item icon={<ServerIcon size={13} color={color} />} label={`${hostCount} 台主机`} />
      <Item icon={<FolderIcon size={13} color={color} />} label={`${groupCount} 个分组`} />
      <div style={{ flex: 1 }} />
      <div style={{
        fontSize: '11px',
        color: darkMode ? '#374151' : '#cbd5e1',
        fontFamily: 'monospace',
        letterSpacing: '0.03em',
      }}>
        v{__APP_VERSION__}-beta
      </div>
    </div>
  );
};

export default StatusBar;
