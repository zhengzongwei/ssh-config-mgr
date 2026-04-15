import { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ServerIcon, FolderIcon, FolderOpenIcon, PlusIcon, TrashIcon } from './Icons';

interface Group {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface SidebarProps {
  darkMode: boolean;
  selectedGroupId: string | null;
  onSelectGroup: (id: string | null) => void;
  refreshTrigger: number;
  onGroupChange?: () => void;
}

const Sidebar = ({ darkMode, selectedGroupId, onSelectGroup, refreshTrigger, onGroupChange }: SidebarProps) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [hostCount, setHostCount] = useState(0);
  const [addingGroup, setAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#4f46e5');
  const [savingGroup, setSavingGroup] = useState(false);
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  const GROUP_COLORS = [
    '#4f46e5', // 靛蓝
    '#0891b2', // 青色
    '#059669', // 绿色
    '#d97706', // 橙色
    '#dc2626', // 红色
    '#7c3aed', // 紫色
    '#db2777', // 粉色
    '#65a30d', // 草绿
  ];

  const loadGroups = () => {
    invoke<Group[]>('get_groups')
      .then(setGroups)
      .catch(console.error);
    invoke<any[]>('get_hosts')
      .then(h => setHostCount(h.length))
      .catch(() => {});
  };

  useEffect(loadGroups, [refreshTrigger]);

  useEffect(() => {
    if (addingGroup) {
      setTimeout(() => addInputRef.current?.focus(), 50);
    }
  }, [addingGroup]);

  const handleAddGroup = async () => {
    const name = newGroupName.trim();
    if (!name) { setAddingGroup(false); return; }
    setSavingGroup(true);
    try {
      await invoke('add_group', {
        group: {
          id: crypto.randomUUID(),
          name,
          parentId: null,
          icon: null,
          color: newGroupColor,
          order: groups.length,
          children: null,
        }
      });
      setNewGroupName('');
      setNewGroupColor('#4f46e5');
      setAddingGroup(false);
      loadGroups();
      onGroupChange?.();
    } catch (e) {
      alert('创建分组失败: ' + e);
    } finally {
      setSavingGroup(false);
    }
  };

  const handleDeleteGroup = async (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    if (!confirm('确认删除该分组？分组内的主机将变为未分组状态。')) return;
    try {
      await invoke('delete_group', { id: groupId });
      if (selectedGroupId === groupId) onSelectGroup(null);
      loadGroups();
      onGroupChange?.();
    } catch (e) {
      alert('删除分组失败: ' + e);
    }
  };

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
          <ServerIcon size={16} style={{ color: selectedGroupId === null ? activeColor : mutedColor }} />
          <span style={{ flex: 1 }}>全部主机</span>
          <span style={{
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '10px',
            background: selectedGroupId === null ? (darkMode ? '#312e81' : '#eef2ff') : (darkMode ? '#374151' : '#e5e7eb'),
            color: selectedGroupId === null ? activeColor : mutedColor,
          }}>{hostCount}</span>
        </button>

        {/* 分组列表 */}
        <div style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '4px 12px', marginBottom: '2px' }}>
            <span style={{ flex: 1, fontSize: '11px', fontWeight: 600, color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              分组
            </span>
            <button
              title="新建分组"
              onClick={() => setAddingGroup(true)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '20px', height: '20px', borderRadius: '4px',
                background: 'transparent', border: 'none',
                color: mutedColor, cursor: 'pointer',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = '#4f46e5'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = mutedColor; }}
            >
              <PlusIcon size={14} />
            </button>
          </div>

          {/* 内联新建分组输入框 */}
          {addingGroup && (
            <div style={{ padding: '4px 8px' }}>
              <input
                ref={addInputRef}
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !savingGroup) handleAddGroup();
                  if (e.key === 'Escape') { setAddingGroup(false); setNewGroupName(''); setNewGroupColor('#4f46e5'); }
                }}
                disabled={savingGroup}
                placeholder={savingGroup ? '创建中...' : '分组名称...'}
                style={{
                  width: '100%', padding: '6px 10px', borderRadius: '7px',
                  border: `1px solid ${newGroupColor}`,
                  background: darkMode ? '#0f172a' : '#f8fafc',
                  color: darkMode ? '#e2e8f0' : '#1a1a2e',
                  fontSize: '13px', outline: 'none',
                  boxSizing: 'border-box',
                  opacity: savingGroup ? 0.7 : 1,
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                <span style={{ fontSize: '11px', color: mutedColor }}>颜色：</span>
                {GROUP_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => !savingGroup && setNewGroupColor(color)}
                    disabled={savingGroup}
                    style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: color,
                      border: newGroupColor === color ? '2px solid white' : '2px solid transparent',
                      boxShadow: newGroupColor === color ? `0 0 0 1px ${color}` : 'none',
                      cursor: savingGroup ? 'not-allowed' : 'pointer', padding: 0,
                      opacity: savingGroup ? 0.5 : 1,
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: '11px', color: mutedColor, marginTop: '3px', paddingLeft: '2px' }}>
                {savingGroup ? '创建中...' : 'Enter 确认 · Esc 取消'}
              </div>
            </div>
          )}

          {groups.map(group => (
            <div
              key={group.id}
              style={{ position: 'relative' }}
              onMouseEnter={() => setHoveredGroupId(group.id)}
              onMouseLeave={() => setHoveredGroupId(null)}
            >
              <button
                style={itemStyle(selectedGroupId === group.id)}
                onClick={() => onSelectGroup(group.id)}
                onMouseEnter={e => { if (selectedGroupId !== group.id) e.currentTarget.style.background = hoverBg; }}
                onMouseLeave={e => { if (selectedGroupId !== group.id) e.currentTarget.style.background = 'transparent'; }}
              >
                {selectedGroupId === group.id
                  ? <FolderOpenIcon size={16} style={{ color: group.color || activeColor }} />
                  : <FolderIcon size={16} style={{ color: group.color || mutedColor }} />
                }
                <span style={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: group.color || 'inherit',
                }}>{group.name}</span>
              </button>
              {/* 删除按钮 */}
              {hoveredGroupId === group.id && (
                <button
                  title="删除分组"
                  onClick={e => handleDeleteGroup(e, group.id)}
                  style={{
                    position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '20px', height: '20px', borderRadius: '4px',
                    background: darkMode ? '#2d3748' : '#f1f5f9',
                    border: '1px solid transparent', color: '#ef4444',
                    cursor: 'pointer', zIndex: 1,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = darkMode ? '#2d3748' : '#f1f5f9'; e.currentTarget.style.borderColor = 'transparent'; }}
                >
                  <TrashIcon size={12} />
                </button>
              )}
            </div>
          ))}

          {groups.length === 0 && !addingGroup && (
            <div style={{ fontSize: '12px', color: mutedColor, padding: '6px 12px', fontStyle: 'italic' }}>
              暂无分组，点击 + 新建
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
