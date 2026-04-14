import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Server, Folder, CheckCircle, Clock } from 'lucide-react';

interface StatusBarProps {
  darkMode: boolean;
  refreshTrigger: number;
}

const StatusBar = ({ darkMode, refreshTrigger }: StatusBarProps) => {
  const [hostCount, setHostCount] = useState(0);
  const [groupCount, setGroupCount] = useState(0);
  const [lastSync] = useState('未同步');

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
      <Item icon={<Server size={13} color={color} />} label={`${hostCount} 台主机`} />
      <Item icon={<Folder size={13} color={color} />} label={`${groupCount} 个分组`} />
      <Item icon={<CheckCircle size={13} color="#10b981" />} label="已就绪" />
      <div style={{ flex: 1 }} />
      <Item icon={<Clock size={13} color={color} />} label={lastSync} />
    </div>
  );
};

export default StatusBar;
