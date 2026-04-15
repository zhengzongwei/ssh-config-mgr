import { invoke } from '@tauri-apps/api/core';
import { useState, useCallback, useEffect } from 'react';
import { save } from '@tauri-apps/plugin-dialog';
import { RefreshCwIcon, SettingsIcon, PlusIcon, XIcon, DownloadIcon, UploadIcon } from './components/Icons';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import StatusBar from './components/StatusBar';
import AddHostDialog from './components/AddHostDialog';
import './App.css';

function App() {
  // 基于系统主题自动检测
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const message = await invoke<string>('sync_ssh_config');
      alert(message);
    } catch (e) {
      alert('同步失败: ' + e);
    } finally {
      setSyncing(false);
    }
  };

  const handleImport = async () => {
    if (importing) return;
    setImporting(true);
    try {
      const result = await invoke<string>('import_ssh_config');
      alert(result);
      setRefreshTrigger(t => t + 1);
    } catch (e) {
      alert('导入失败: ' + e);
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async (format: 'json' | 'toml' | 'ssh') => {
    try {
      const extensions: Record<string, string[]> = {
        json: ['json'],
        toml: ['toml'],
        ssh: ['config'],
      };
      const defaultNames: Record<string, string> = {
        json: 'ssh-hosts-export.json',
        toml: 'ssh-hosts-export.toml',
        ssh: 'ssh-config-export',
      };

      const filePath = await save({
        defaultPath: defaultNames[format],
        filters: [{
          name: format.toUpperCase(),
          extensions: extensions[format],
        }],
      });

      if (!filePath) return;

      let result: string;
      switch (format) {
        case 'json':
          result = await invoke<string>('export_json', { path: filePath });
          break;
        case 'toml':
          result = await invoke<string>('export_toml', { path: filePath });
          break;
        case 'ssh':
          result = await invoke<string>('export_ssh_config', { path: filePath });
          break;
      }
      alert(result);
    } catch (e) {
      alert('导出失败: ' + e);
    }
  };

  const handleHostAdded = useCallback(() => {
    setRefreshTrigger(t => t + 1);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: darkMode ? '#1a1a2e' : '#f8f9fa',
      color: darkMode ? '#e2e8f0' : '#1a1a2e',
    }}>
      {/* 顶部工具栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        background: darkMode ? '#16213e' : '#ffffff',
        borderBottom: `1px solid ${darkMode ? '#2d3748' : '#e2e8f0'}`,
        gap: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          background: darkMode ? '#2d3748' : '#f1f5f9',
          borderRadius: '8px',
          padding: '6px 12px',
          maxWidth: '320px',
          gap: '8px',
          border: `1px solid ${darkMode ? '#4a5568' : '#e2e8f0'}`,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="search"
            placeholder="搜索主机..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '14px',
              color: 'inherit',
              width: '100%',
            }}
          />
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={() => setShowAddDialog(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px',
            background: '#4f46e5',
            color: 'white',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#4338ca')}
          onMouseLeave={e => (e.currentTarget.style.background = '#4f46e5')}
        >
          <PlusIcon size={16} />
          新增主机
        </button>

        <button
          onClick={() => setShowSettingsDialog(true)}
          title="设置"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px',
            background: darkMode ? '#2d3748' : '#f1f5f9',
            borderRadius: '8px',
            border: `1px solid ${darkMode ? '#4a5568' : '#e2e8f0'}`,
            color: 'inherit',
            cursor: 'pointer',
          }}
        >
          <SettingsIcon size={16} color={darkMode ? '#94a3b8' : '#475569'} />
        </button>
      </div>

      {/* 主体内容 */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          darkMode={darkMode}
          selectedGroupId={selectedGroupId}
          onSelectGroup={setSelectedGroupId}
          refreshTrigger={refreshTrigger}
          onGroupChange={handleHostAdded}
        />
        <MainContent
          darkMode={darkMode}
          searchQuery={searchQuery}
          selectedGroupId={selectedGroupId}
          refreshTrigger={refreshTrigger}
          onRefresh={handleHostAdded}
        />
      </div>

      <StatusBar darkMode={darkMode} refreshTrigger={refreshTrigger} />

      <AddHostDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={handleHostAdded}
        darkMode={darkMode}
      />

      {/* 设置对话框 */}
      {showSettingsDialog && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowSettingsDialog(false); }}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(2px)',
          }}
        >
          <div style={{
            background: darkMode ? '#1e2a3a' : '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            width: '400px',
            maxWidth: '90vw',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            border: `1px solid ${darkMode ? '#2d3748' : '#e2e8f0'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: '17px', fontWeight: 600 }}>设置</span>
              <button
                onClick={() => setShowSettingsDialog(false)}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: darkMode ? '#2d3748' : '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: darkMode ? '#94a3b8' : '#64748b', cursor: 'pointer', border: 'none',
                }}
              >
                <XIcon size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* 同步配置 */}
              <button
                onClick={handleSync}
                disabled={syncing}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px',
                  background: darkMode ? '#0f172a' : '#f8fafc',
                  borderRadius: '10px',
                  border: `1px solid ${darkMode ? '#2d3748' : '#e2e8f0'}`,
                  cursor: syncing ? 'not-allowed' : 'pointer',
                  opacity: syncing ? 0.7 : 1,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => !syncing && (e.currentTarget.style.background = darkMode ? '#1e293b' : '#f1f5f9')}
                onMouseLeave={e => (e.currentTarget.style.background = darkMode ? '#0f172a' : '#f8fafc')}
              >
                <RefreshCwIcon size={20} color="#4f46e5" style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: darkMode ? '#e2e8f0' : '#1a1a2e' }}>
                    {syncing ? '同步中...' : '同步配置'}
                  </div>
                  <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                    将主机配置同步到 ~/.ssh/config
                  </div>
                </div>
              </button>

              {/* 导入配置 */}
              <button
                onClick={handleImport}
                disabled={importing}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px',
                  background: darkMode ? '#0f172a' : '#f8fafc',
                  borderRadius: '10px',
                  border: `1px solid ${darkMode ? '#2d3748' : '#e2e8f0'}`,
                  cursor: importing ? 'not-allowed' : 'pointer',
                  opacity: importing ? 0.7 : 1,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => !importing && (e.currentTarget.style.background = darkMode ? '#1e293b' : '#f1f5f9')}
                onMouseLeave={e => (e.currentTarget.style.background = darkMode ? '#0f172a' : '#f8fafc')}
              >
                <DownloadIcon size={20} color="#0891b2" />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: darkMode ? '#e2e8f0' : '#1a1a2e' }}>
                    {importing ? '导入中...' : '导入配置'}
                  </div>
                  <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                    从 ~/.ssh/config 导入主机配置
                  </div>
                </div>
              </button>

              {/* 导出配置 */}
              <div style={{
                padding: '14px 16px',
                background: darkMode ? '#0f172a' : '#f8fafc',
                borderRadius: '10px',
                border: `1px solid ${darkMode ? '#2d3748' : '#e2e8f0'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <UploadIcon size={20} color="#059669" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: darkMode ? '#e2e8f0' : '#1a1a2e' }}>
                      导出配置
                    </div>
                    <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                      选择导出格式
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { label: 'JSON', format: 'json' as const, color: '#f59e0b' },
                    { label: 'TOML', format: 'toml' as const, color: '#7c3aed' },
                    { label: 'SSH Config', format: 'ssh' as const, color: '#4f46e5' },
                  ].map(opt => (
                    <button
                      key={opt.format}
                      onClick={() => handleExport(opt.format)}
                      style={{
                        flex: 1, padding: '8px 12px',
                        borderRadius: '6px', fontSize: '12px', fontWeight: 500,
                        background: opt.color, color: 'white',
                        border: 'none', cursor: 'pointer',
                        transition: 'opacity 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default App;
