import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ServerIcon, CopyIcon, TerminalIcon, EditIcon, TrashIcon, EyeIcon, EyeOffIcon } from './Icons';

interface HostConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  user: string;
  authType: string;
  identityFile?: string;
  group?: string;
  notes?: string;
  showInVscode: boolean;
}

interface MainContentProps {
  darkMode: boolean;
  searchQuery: string;
  selectedGroupId: string | null;
  refreshTrigger: number;
  onRefresh: () => void;
}

const HostCard = ({
  host,
  darkMode,
  onDelete,
  onUpdate,
}: {
  host: HostConfig;
  darkMode: boolean;
  onDelete: (id: string) => void;
  onUpdate: () => void;
}) => {
  const [hovered, setHovered] = useState(false);

  const cardBg = darkMode ? '#1e2a3a' : '#ffffff';
  const cardBorder = darkMode ? '#2d3748' : '#e2e8f0';
  const cardShadow = hovered
    ? '0 4px 16px rgba(79,70,229,0.15)'
    : '0 1px 4px rgba(0,0,0,0.06)';

  const copySSHCommand = () => {
    const cmd = `ssh ${host.user}@${host.host} -p ${host.port}${host.identityFile ? ` -i ${host.identityFile}` : ''}`;
    navigator.clipboard.writeText(cmd).then(() => alert(`已复制: ${cmd}`));
  };

  const handleDelete = () => {
    if (confirm(`确认删除主机 "${host.name}"？`)) {
      invoke('delete_host', { id: host.id })
        .then(() => onDelete(host.id))
        .catch(e => alert('删除失败: ' + e));
    }
  };

  const handleToggleVscode = async () => {
    try {
      await invoke('set_host_vscode', { id: host.id, show: !host.showInVscode });
      onUpdate();
    } catch (e) {
      alert('更新失败: ' + e);
    }
  };

  const authColor = host.authType === 'key' ? '#10b981' : host.authType === 'password' ? '#f59e0b' : '#6366f1';
  const authLabel = host.authType === 'key' ? '密钥' : host.authType === 'password' ? '密码' : 'Agent';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: cardBg,
        border: `1px solid ${hovered ? '#4f46e5' : cardBorder}`,
        borderRadius: '12px',
        padding: '16px',
        boxShadow: cardShadow,
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        minWidth: '230px',
        maxWidth: '260px',
        flex: '1 1 230px',
      }}
    >
      {/* 顶部标题行 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px', height: '36px',
          background: darkMode ? '#312e81' : '#eef2ff',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <ServerIcon size={18} color="#4f46e5" />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontWeight: 600, fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {host.name}
          </div>
          <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>
            {host.host}:{host.port}
          </div>
        </div>
      </div>

      {/* 信息行 */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{
          padding: '2px 8px', borderRadius: '99px', fontSize: '12px',
          background: darkMode ? '#1e3a2e' : '#f0fdf4', color: '#16a34a', border: '1px solid #86efac'
        }}>
          {host.user}
        </span>
        <span style={{
          padding: '2px 8px', borderRadius: '99px', fontSize: '12px',
          background: darkMode ? '#2a1f14' : '#fffbeb', color: authColor, border: `1px solid ${authColor}44`
        }}>
          {authLabel}
        </span>
      </div>

      {host.notes && (
        <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {host.notes}
        </div>
      )}

      {/* VS Code 可见性开关 */}
      <div
        onClick={handleToggleVscode}
        title={host.showInVscode ? '当前在 VS Code Remote SSH 中显示 · 点击隐藏' : '已从 VS Code Remote SSH 隐藏 · 点击显示'}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '3px 8px', borderRadius: '6px', fontSize: '11px',
          cursor: 'pointer', userSelect: 'none',
          background: host.showInVscode
            ? (darkMode ? '#1e3a2e' : '#f0fdf4')
            : (darkMode ? '#1f1f1f' : '#f3f4f6'),
          color: host.showInVscode ? '#16a34a' : (darkMode ? '#4b5563' : '#9ca3af'),
          border: `1px solid ${host.showInVscode ? '#86efac' : (darkMode ? '#374151' : '#e5e7eb')}`,
          transition: 'all 0.15s',
          alignSelf: 'flex-start',
        }}
      >
        {host.showInVscode
          ? <EyeIcon size={11} color="#16a34a" />
          : <EyeOffIcon size={11} color={darkMode ? '#4b5563' : '#9ca3af'} />
        }
        VS Code {host.showInVscode ? '显示中' : '已隐藏'}
      </div>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
        <ActionButton icon={<TerminalIcon size={14} />} label="启动" color="#4f46e5" darkMode={darkMode} onClick={() => {}} />
        <ActionButton icon={<CopyIcon size={14} />} label="复制" color="#0ea5e9" darkMode={darkMode} onClick={copySSHCommand} />
        <ActionButton icon={<EditIcon size={14} />} label="编辑" color="#f59e0b" darkMode={darkMode} onClick={() => {}} />
        <ActionButton icon={<TrashIcon size={14} />} label="删除" color="#ef4444" darkMode={darkMode} onClick={handleDelete} />
      </div>
    </div>
  );
};

const ActionButton = ({ icon, label, color, darkMode, onClick }: {
  icon: React.ReactNode; label: string; color: string; darkMode: boolean; onClick: () => void;
}) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      title={label}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flex: 1, padding: '6px 4px', borderRadius: '7px', gap: '4px',
        fontSize: '12px', fontWeight: 500,
        background: hov ? `${color}18` : darkMode ? '#2d3748' : '#f8fafc',
        color: hov ? color : darkMode ? '#94a3b8' : '#64748b',
        border: `1px solid ${hov ? color + '44' : darkMode ? '#374151' : '#e2e8f0'}`,
        transition: 'all 0.15s',
        cursor: 'pointer',
      }}
    >
      {icon}
    </button>
  );
};

const MainContent = ({ darkMode, searchQuery, selectedGroupId, refreshTrigger, onRefresh }: MainContentProps) => {
  const [hosts, setHosts] = useState<HostConfig[]>([]);

  const loadHosts = () => {
    invoke<HostConfig[]>('get_hosts')
      .then(setHosts)
      .catch(console.error);
  };

  useEffect(loadHosts, [refreshTrigger]);

  const filtered = hosts.filter(h => {
    const matchesGroup = selectedGroupId ? h.group === selectedGroupId : true;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || h.name.toLowerCase().includes(q) || h.host.toLowerCase().includes(q) || h.user.toLowerCase().includes(q);
    return matchesGroup && matchesSearch;
  });

  const bg = darkMode ? '#0f172a' : '#f8f9fa';

  return (
    <div style={{ flex: 1, background: bg, overflowY: 'auto', padding: '20px' }}>
      {filtered.length > 0 ? (
        <>
          <div style={{ fontSize: '13px', color: darkMode ? '#94a3b8' : '#64748b', marginBottom: '16px' }}>
            共 {filtered.length} 台主机
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {filtered.map(host => (
              <HostCard
                key={host.id}
                host={host}
                darkMode={darkMode}
                onDelete={() => { loadHosts(); onRefresh(); }}
                onUpdate={() => { loadHosts(); onRefresh(); }}
              />
            ))}
          </div>
        </>
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100%', gap: '16px', color: darkMode ? '#4b5563' : '#9ca3af',
        }}>
          <ServerIcon size={48} strokeWidth={1} />
          <div style={{ fontSize: '16px', fontWeight: 500 }}>
            {searchQuery ? '没有找到匹配的主机' : '暂无主机，点击「新增主机」开始添加'}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainContent;
