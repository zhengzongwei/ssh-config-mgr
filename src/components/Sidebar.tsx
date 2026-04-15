import { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ServerIcon, FolderIcon, FolderOpenIcon, PlusIcon, TrashIcon, EditIcon } from './Icons';
import { t, getSystemLanguage } from '../i18n';

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
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupColor, setEditGroupColor] = useState('#4f46e5');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#4f46e5');
  const [savingGroup, setSavingGroup] = useState(false);
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (editingGroupId && editInputRef.current) {
      setTimeout(() => editInputRef.current?.focus(), 50);
    }
  }, [editingGroupId]);

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
      alert(t('createGroupFailed') + ': ' + e);
    } finally {
      setSavingGroup(false);
    }
  };

  const handleDeleteGroup = async (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    if (!confirm(t('confirmDeleteGroup'))) return;
    try {
      await invoke('delete_group', { id: groupId });
      if (selectedGroupId === groupId) onSelectGroup(null);
      loadGroups();
      onGroupChange?.();
    } catch (e) {
      alert(t('deleteGroupFailed') + ': ' + e);
    }
  };

  const startEditGroup = (e: React.MouseEvent, group: Group) => {
    e.stopPropagation();
    setEditingGroupId(group.id);
    setEditGroupName(group.name);
    setEditGroupColor(group.color || '#4f46e5');
  };

  const handleUpdateGroup = async () => {
    if (!editingGroupId) return;
    const name = editGroupName.trim();
    if (!name) return;

    setSavingGroup(true);
    try {
      await invoke('update_group', {
        group: {
          id: editingGroupId,
          name,
          parentId: null,
          icon: null,
          color: editGroupColor,
          order: groups.findIndex(g => g.id === editingGroupId),
          children: null,
        }
      });
      setEditingGroupId(null);
      loadGroups();
      onGroupChange?.();
    } catch (e) {
      alert(getSystemLanguage() === 'zh-CN' ? '更新分组失败: ' : 'Failed to update group: ' + e);
    } finally {
      setSavingGroup(false);
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
    gap: '10px',
    padding: '10px 14px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '15px',
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
      width: '260px',
      minWidth: '260px',
      background: bg,
      borderRight: `1px solid ${border}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 10px' }}>
        {/* 全部 */}
        <button
          style={itemStyle(selectedGroupId === null)}
          onClick={() => onSelectGroup(null)}
          onMouseEnter={e => { if (selectedGroupId !== null) e.currentTarget.style.background = hoverBg; }}
          onMouseLeave={e => { if (selectedGroupId !== null) e.currentTarget.style.background = 'transparent'; }}
        >
          <ServerIcon size={18} style={{ color: selectedGroupId === null ? activeColor : mutedColor }} />
          <span style={{ flex: 1 }}>{t('allHosts')}</span>
          <span style={{
            fontSize: '12px',
            padding: '3px 8px',
            borderRadius: '12px',
            background: selectedGroupId === null ? (darkMode ? '#312e81' : '#eef2ff') : (darkMode ? '#374151' : '#e5e7eb'),
            color: selectedGroupId === null ? activeColor : mutedColor,
          }}>{hostCount}</span>
        </button>

        {/* 分组列表 */}
        <div style={{ marginTop: '16px' }}>
          {/* 分组标题 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 14px',
            marginBottom: '6px',
          }}>
            <span style={{
              flex: 1,
              fontSize: '12px',
              fontWeight: 600,
              color: mutedColor,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {t('groups')}
            </span>
            <button
              title={t('createGroup')}
              onClick={() => setAddingGroup(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                background: 'transparent',
                border: 'none',
                color: mutedColor,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = hoverBg;
                e.currentTarget.style.color = '#4f46e5';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = mutedColor;
              }}
            >
              <PlusIcon size={16} />
            </button>
          </div>

          {/* 新建分组输入框 */}
          {addingGroup && (
            <div style={{
              padding: '10px',
              margin: '0 4px 8px',
              background: darkMode ? '#0f172a' : '#f8fafc',
              borderRadius: '12px',
              border: `1px solid ${darkMode ? '#2d3748' : '#e2e8f0'}`,
            }}>
              <input
                ref={addInputRef}
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !savingGroup) handleAddGroup();
                  if (e.key === 'Escape') {
                    setAddingGroup(false);
                    setNewGroupName('');
                    setNewGroupColor('#4f46e5');
                  }
                }}
                disabled={savingGroup}
                placeholder={savingGroup
                  ? (getSystemLanguage() === 'zh-CN' ? '创建中...' : 'Creating...')
                  : t('groupName') + '...'
                }
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${newGroupColor}`,
                  background: darkMode ? '#1e293b' : '#ffffff',
                  color: darkMode ? '#e2e8f0' : '#1a1a2e',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  opacity: savingGroup ? 0.7 : 1,
                }}
              />
              {/* 颜色选择器 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '10px',
                flexWrap: 'wrap',
              }}>
                {GROUP_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => !savingGroup && setNewGroupColor(color)}
                    disabled={savingGroup}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '8px',
                      background: color,
                      border: newGroupColor === color
                        ? '2px solid white'
                        : '2px solid transparent',
                      boxShadow: newGroupColor === color
                        ? `0 0 0 2px ${color}`
                        : 'none',
                      cursor: savingGroup ? 'not-allowed' : 'pointer',
                      padding: 0,
                      opacity: savingGroup ? 0.5 : 1,
                      transition: 'transform 0.1s',
                    }}
                    onMouseEnter={e => {
                      if (!savingGroup) e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                ))}
              </div>
              {/* 提示文字 */}
              <div style={{
                fontSize: '12px',
                color: mutedColor,
                marginTop: '8px',
              }}>
                {savingGroup
                  ? (getSystemLanguage() === 'zh-CN' ? '创建中...' : 'Creating...')
                  : `↵ ${t('enterConfirm')} · Esc ${t('escCancel')}`
                }
              </div>
            </div>
          )}

          {/* 分组列表 */}
          {groups.map(group => (
            <div key={group.id}>
              {/* 编辑模式 */}
              {editingGroupId === group.id ? (
                <div style={{
                  padding: '10px',
                  margin: '0 4px 8px',
                  background: darkMode ? '#0f172a' : '#f8fafc',
                  borderRadius: '12px',
                  border: `1px solid ${editGroupColor}`,
                }}>
                  <input
                    ref={editInputRef}
                    value={editGroupName}
                    onChange={e => setEditGroupName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !savingGroup) handleUpdateGroup();
                      if (e.key === 'Escape') setEditingGroupId(null);
                    }}
                    disabled={savingGroup}
                    placeholder={t('groupName') + '...'}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${darkMode ? '#2d3748' : '#e2e8f0'}`,
                      background: darkMode ? '#1e293b' : '#ffffff',
                      color: darkMode ? '#e2e8f0' : '#1a1a2e',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      opacity: savingGroup ? 0.7 : 1,
                    }}
                  />
                  {/* 颜色选择器 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '10px',
                    flexWrap: 'wrap',
                  }}>
                    {GROUP_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => !savingGroup && setEditGroupColor(color)}
                        disabled={savingGroup}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '8px',
                          background: color,
                          border: editGroupColor === color
                            ? '2px solid white'
                            : '2px solid transparent',
                          boxShadow: editGroupColor === color
                            ? `0 0 0 2px ${color}`
                            : 'none',
                          cursor: savingGroup ? 'not-allowed' : 'pointer',
                          padding: 0,
                          opacity: savingGroup ? 0.5 : 1,
                          transition: 'transform 0.1s',
                        }}
                        onMouseEnter={e => {
                          if (!savingGroup) e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      />
                    ))}
                  </div>
                  {/* 操作按钮 */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '10px',
                  }}>
                    <button
                      onClick={() => setEditingGroupId(null)}
                      disabled={savingGroup}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: darkMode ? '#2d3748' : '#e5e7eb',
                        color: darkMode ? '#e2e8f0' : '#1a1a2e',
                        border: 'none',
                        fontSize: '13px',
                        cursor: savingGroup ? 'not-allowed' : 'pointer',
                        opacity: savingGroup ? 0.5 : 1,
                      }}
                    >
                      {t('cancel')}
                    </button>
                    <button
                      onClick={handleUpdateGroup}
                      disabled={savingGroup}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: '#4f46e5',
                        color: 'white',
                        border: 'none',
                        fontSize: '13px',
                        cursor: savingGroup ? 'not-allowed' : 'pointer',
                        opacity: savingGroup ? 0.7 : 1,
                      }}
                    >
                      {savingGroup ? (getSystemLanguage() === 'zh-CN' ? '保存中...' : 'Saving...') : t('confirm')}
                    </button>
                  </div>
                </div>
              ) : (
                /* 普通显示模式 */
                <div
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setHoveredGroupId(group.id)}
                  onMouseLeave={() => setHoveredGroupId(null)}
                >
                  <button
                    style={itemStyle(selectedGroupId === group.id)}
                    onClick={() => onSelectGroup(group.id)}
                  >
                    {selectedGroupId === group.id
                      ? <FolderOpenIcon size={18} style={{ color: group.color || activeColor }} />
                      : <FolderIcon size={18} style={{ color: group.color || mutedColor }} />
                    }
                    <span style={{
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: group.color || 'inherit',
                    }}>{group.name}</span>
                  </button>
                  {/* 操作按钮 */}
                  {hoveredGroupId === group.id && (
                    <div style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      gap: '6px',
                      zIndex: 1,
                    }}>
                      <button
                        title={t('edit')}
                        onClick={e => startEditGroup(e, group)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '26px',
                          height: '26px',
                          borderRadius: '8px',
                          background: darkMode ? '#2d3748' : '#f1f5f9',
                          border: '1px solid transparent',
                          color: '#4f46e5',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = darkMode ? '#312e81' : '#eef2ff';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = darkMode ? '#2d3748' : '#f1f5f9';
                        }}
                      >
                        <EditIcon size={14} />
                      </button>
                      <button
                        title={t('delete')}
                        onClick={e => handleDeleteGroup(e, group.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '26px',
                          height: '26px',
                          borderRadius: '8px',
                          background: darkMode ? '#2d3748' : '#f1f5f9',
                          border: '1px solid transparent',
                          color: '#ef4444',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#fef2f2';
                          e.currentTarget.style.borderColor = '#fca5a5';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = darkMode ? '#2d3748' : '#f1f5f9';
                          e.currentTarget.style.borderColor = 'transparent';
                        }}
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* 空状态 */}
          {groups.length === 0 && !addingGroup && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 12px',
              margin: '0 4px',
              background: darkMode ? '#0f172a' : '#f8fafc',
              borderRadius: '12px',
              border: `1px dashed ${darkMode ? '#2d3748' : '#e2e8f0'}`,
            }}>
              <FolderIcon size={28} style={{ color: mutedColor, marginBottom: '10px' }} />
              <span style={{ fontSize: '13px', color: mutedColor }}>
                {t('noGroups')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
