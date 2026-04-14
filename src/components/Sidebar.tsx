import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Server, Folder, FolderOpen, Download, Upload, RefreshCw, Wrench } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  icon?: string;
}

interface SidebarProps {
  darkMode: boolean;
  selectedGroupId: string | null;
  onSelectGroup: (id: string | null) => void;
  refreshTrigger: number;
}

const Sidebar = ({ darkMode, selectedGroupId, onSelectGroup, refreshTrigger }: SidebarProps) => {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    invoke<Group[]>('get_groups')
      .then(setGroups)
      .catch(console.error);
  }, [refreshTrigger]);

  const bg = darkMode ? '#16213e' : '#ffffff';
  const border = darkMode ? '#2d3748' : '#e2e8f0';
  const hoverBg = darkMode ? '#2d3748' : '#f1f5f9';
  const activeBg = darkMode ? '#312e81' : '#eef2ff';
  const activeColor = '#4f46e5';
  const mutedColor = darkMode ? '#94a3b8' : '#64748b';

  const itemStyle = (active: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: active ? 600 : 400,
    color: active ? activeColor : 'inherit',
    background: active ? activeBg : 'transparent',
    transition: 'background 0.15s, color 0.15s',
    border: 'none',
    width: '100%',
    textAlign: 'left' as const,
  });

  return (
    <div style={{
      width: '220px',
      minWidth: '220px',
      background: bg,
      borderRight: `1px solid ${border}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        {/* 全部 */}
        <button
          style={itemStyle(selectedGroupId === null)}
          onClick={() => onSelectGroup(null)}
          onMouseEnter={e => { if (selectedGroupId !== null) e.currentTarget.style.background = hoverBg; }}
          onMouseLeave={e => { if (selectedGroupId !== null) e.currentTarget.style.background = 'transparent'; }}
        >
          <Server size={16} style={{ color: selectedGroupId === null ? activeColor : mutedColor }} />
          全部主机
        </button>

        {/* 分组列表 */}
        {groups.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: mutedColor, padding: '4px 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              分组
            </div>
            {groups.map(group => (
              <button
                key={group.id}
                style={itemStyle(selectedGroupId === group.id)}
                onClick={() => onSelectGroup(group.id)}
                onMouseEnter={e => { if (selectedGroupId !== group.id) e.currentTarget.style.background = hoverBg; }}
                onMouseLeave={e => { if (selectedGroupId !== group.id) e.currentTarget.style.background = 'transparent'; }}
              >
                {selectedGroupId === group.id
                  ? <FolderOpen size={16} style={{ color: activeColor }} />
                  : <Folder size={16} style={{ color: mutedColor }} />
                }
                {group.name}
              </button>
            ))}
          </div>
        )}

        {/* 工具区域 */}
        <div style={{ marginTop: '16px', borderTop: `1px solid ${border}`, paddingTop: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: mutedColor, padding: '4px 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            工具
          </div>
          {[
            { icon: <Download size={16} />, label: '导入配置' },
            { icon: <Upload size={16} />, label: '导出配置' },
            { icon: <RefreshCw size={16} />, label: '同步状态' },
            { icon: <Wrench size={16} />, label: '工具' },
          ].map(item => (
            <button
              key={item.label}
              style={{ ...itemStyle(false), color: mutedColor }}
              onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = 'inherit'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = mutedColor; }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
