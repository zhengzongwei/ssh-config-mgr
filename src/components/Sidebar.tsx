import { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Server, Folder, FolderOpen, Download, Upload, RefreshCw, Wrench, Plus, Trash2 } from 'lucide-react';

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
  onGroupChange?: () => void;
}

const Sidebar = ({ darkMode, selectedGroupId, onSelectGroup, refreshTrigger, onGroupChange }: SidebarProps) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [addingGroup, setAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [savingGroup, setSavingGroup] = useState(false);
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const addInputRef = useRef<HTMLInputElement>(null);

  const loadGroups = () => {
    invoke<Group[]>('get_groups')
      .then(setGroups)
      .catch(console.error);
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
          color: null,
          order: groups.length,
          children: null,
        }
      });
      setNewGroupName('');
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

  const handleImport = async () => {
    if (importing) return;
    setImporting(true);
    try {
      const result = await invoke<string>('import_ssh_config');
      alert(result);
      onGroupChange?.();
    } catch (e) {
      alert('导入失败: ' + e);
    } finally {
      setImporting(false);
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
          <Server size={16} style={{ color: selectedGroupId === null ? activeColor : mutedColor }} />
          全部主机
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
              <Plus size={14} />
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
                  if (e.key === 'Enter') handleAddGroup();
                  if (e.key === 'Escape') { setAddingGroup(false); setNewGroupName(''); }
                }}
                onBlur={() => { if (!savingGroup) { setAddingGroup(false); setNewGroupName(''); } }}
                placeholder="分组名称..."
                style={{
                  width: '100%', padding: '6px 10px', borderRadius: '7px',
                  border: `1px solid #4f46e5`,
                  background: darkMode ? '#0f172a' : '#f8fafc',
                  color: darkMode ? '#e2e8f0' : '#1a1a2e',
                  fontSize: '13px', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ fontSize: '11px', color: mutedColor, marginTop: '3px', paddingLeft: '2px' }}>
                Enter 确认 · Esc 取消
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
                  ? <FolderOpen size={16} style={{ color: activeColor }} />
                  : <Folder size={16} style={{ color: mutedColor }} />
                }
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group.name}</span>
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
                  <Trash2 size={12} />
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

        {/* 工具区域 */}
        <div style={{ marginTop: '16px', borderTop: `1px solid ${border}`, paddingTop: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: mutedColor, padding: '4px 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            工具
          </div>
          {[
            { icon: <Download size={16} color={importing ? '#9ca3af' : undefined} />, label: importing ? '导入中...' : '导入配置', onClick: handleImport },
            { icon: <Upload size={16} />, label: '导出配置', onClick: () => {} },
            { icon: <RefreshCw size={16} />, label: '同步状态', onClick: () => {} },
            { icon: <Wrench size={16} />, label: '工具', onClick: () => {} },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.onClick}
              disabled={importing && item.label.includes('导入')}
              style={{ ...itemStyle(false), color: mutedColor, opacity: importing && item.label.includes('导入') ? 0.6 : 1 }}
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
