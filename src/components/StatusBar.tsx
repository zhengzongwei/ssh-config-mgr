import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ServerIcon, FolderIcon } from './Icons';
import { t, getSystemLanguage } from '../i18n';

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

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      padding: '8px 20px',
      background: bg,
      borderTop: `1px solid ${border}`,
      fontSize: '13px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color }}>
        <ServerIcon size={15} color={color} />
        <span>{hostCount} {t('hosts')}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color }}>
        <FolderIcon size={15} color={color} />
        <span>{groupCount} {t('groupCount')}</span>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 12px',
        background: darkMode ? '#1e293b' : '#e2e8f0',
        borderRadius: '14px',
      }}>
        <div style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: '#10b981',
        }} />
        <span style={{
          fontSize: '12px',
          color: darkMode ? '#94a3b8' : '#64748b',
          fontFamily: 'monospace',
        }}>
          v{__APP_VERSION__}
        </span>
      </div>
    </div>
  );
};

export default StatusBar;
