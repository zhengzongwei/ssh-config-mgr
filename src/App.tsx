import { invoke } from '@tauri-apps/api/core';
import { useState, useCallback, useEffect } from 'react';
import { save } from '@tauri-apps/plugin-dialog';
import { RefreshCwIcon, SettingsIcon, PlusIcon, XIcon, DownloadIcon, UploadIcon, ServerIcon } from './components/Icons';
import { t, getSystemLanguage } from './i18n';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import StatusBar from './components/StatusBar';
import AddHostDialog from './components/AddHostDialog';
import './App.css';

// 远程同步配置接口
interface RemoteSyncConfig {
  host: string;
  user: string;
  remote_path: string;
  port: number;
}

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
  const [showRemoteSyncDialog, setShowRemoteSyncDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [remoteSyncing, setRemoteSyncing] = useState(false);

  // 禁用右键菜单
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // 远程同步配置
  const [remoteConfig, setRemoteConfig] = useState<RemoteSyncConfig>({
    host: '',
    user: '',
    remote_path: '/root/.ssh/config',
    port: 22,
  });

  const handleSync = async () => {
    setSyncing(true);
    try {
      const message = await invoke<string>('sync_ssh_config');
      alert(message);
    } catch (e) {
      alert(t('syncFailed') + ': ' + e);
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
      alert(t('importFailed') + ': ' + e);
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
      alert(t('exportFailed') + ': ' + e);
    }
  };

  const handleRemoteSync = async () => {
    if (!remoteConfig.host || !remoteConfig.user) {
      alert(getSystemLanguage() === 'zh-CN' ? '请填写远程主机和用户名' : 'Please fill in remote host and username');
      return;
    }
    setRemoteSyncing(true);
    try {
      const result = await invoke<string>('sync_to_remote', { config: remoteConfig });
      alert(result);
      setShowRemoteSyncDialog(false);
    } catch (e) {
      alert(getSystemLanguage() === 'zh-CN' ? '远程同步失败: ' : 'Remote sync failed: ' + e);
    } finally {
      setRemoteSyncing(false);
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
      fontSize: '15px',
    }}>
      {/* 顶部工具栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 20px',
        background: darkMode ? '#16213e' : '#ffffff',
        borderBottom: `1px solid ${darkMode ? '#2d3748' : '#e2e8f0'}`,
        gap: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          background: darkMode ? '#2d3748' : '#f1f5f9',
          borderRadius: '12px',
          padding: '10px 16px',
          maxWidth: '400px',
          gap: '12px',
          border: `1px solid ${darkMode ? '#4a5568' : '#e2e8f0'}`,
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: darkMode ? '#64748b' : '#94a3b8', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="search"
            placeholder={t('search')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '15px',
              color: 'inherit',
              width: '100%',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: darkMode ? '#4a5568' : '#d1d5db',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={darkMode ? '#e2e8f0' : '#374151'} strokeWidth="3">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={() => setShowAddDialog(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px',
            background: '#4f46e5',
            color: 'white',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 500,
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#4338ca')}
          onMouseLeave={e => (e.currentTarget.style.background = '#4f46e5')}
        >
          <PlusIcon size={18} />
          {t('addHost')}
        </button>

        <button
          onClick={() => setShowSettingsDialog(true)}
          title={t('settings')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '42px', height: '42px',
            background: darkMode ? '#2d3748' : '#f1f5f9',
            borderRadius: '10px',
            border: `1px solid ${darkMode ? '#4a5568' : '#e2e8f0'}`,
            color: 'inherit',
            cursor: 'pointer',
          }}
        >
          <SettingsIcon size={20} color={darkMode ? '#94a3b8' : '#475569'} />
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
            width: '420px',
            maxWidth: '90vw',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            border: `1px solid ${darkMode ? '#2d3748' : '#e2e8f0'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: '17px', fontWeight: 600 }}>{t('settingsTitle')}</span>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* 同步配置 */}
              <button
                onClick={handleSync}
                disabled={syncing}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px',
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
                <RefreshCwIcon size={18} color="#4f46e5" style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: darkMode ? '#e2e8f0' : '#1a1a2e' }}>
                    {syncing ? t('syncing') : t('syncConfig')}
                  </div>
                  <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                    {t('syncConfigDesc')}
                  </div>
                </div>
              </button>

              {/* 远程同步 */}
              <button
                onClick={() => setShowRemoteSyncDialog(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px',
                  background: darkMode ? '#0f172a' : '#f8fafc',
                  borderRadius: '10px',
                  border: `1px solid ${darkMode ? '#2d3748' : '#e2e8f0'}`,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = darkMode ? '#1e293b' : '#f1f5f9')}
                onMouseLeave={e => (e.currentTarget.style.background = darkMode ? '#0f172a' : '#f8fafc')}
              >
                <ServerIcon size={18} color="#0891b2" />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: darkMode ? '#e2e8f0' : '#1a1a2e' }}>
                    {t('remoteSync')}
                  </div>
                  <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                    {t('remoteSyncDesc')}
                  </div>
                </div>
              </button>

              {/* 导入配置 */}
              <button
                onClick={handleImport}
                disabled={importing}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px',
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
                <DownloadIcon size={18} color="#059669" />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: darkMode ? '#e2e8f0' : '#1a1a2e' }}>
                    {importing ? t('importing') : t('importConfig')}
                  </div>
                  <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                    {t('importConfigDesc')}
                  </div>
                </div>
              </button>

              {/* 导出配置 */}
              <div style={{
                padding: '12px 14px',
                background: darkMode ? '#0f172a' : '#f8fafc',
                borderRadius: '10px',
                border: `1px solid ${darkMode ? '#2d3748' : '#e2e8f0'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <UploadIcon size={18} color="#dc2626" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: darkMode ? '#e2e8f0' : '#1a1a2e' }}>
                      {t('exportConfig')}
                    </div>
                    <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                      {t('exportConfigDesc')}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { label: 'JSON', format: 'json' as const, color: '#f59e0b' },
                    { label: 'TOML', format: 'toml' as const, color: '#7c3aed' },
                    { label: 'SSH', format: 'ssh' as const, color: '#4f46e5' },
                  ].map(opt => (
                    <button
                      key={opt.format}
                      onClick={() => handleExport(opt.format)}
                      style={{
                        flex: 1, padding: '6px 10px',
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

      {/* 远程同步对话框 */}
      {showRemoteSyncDialog && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowRemoteSyncDialog(false); }}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1001,
            backdropFilter: 'blur(2px)',
          }}
        >
          <div style={{
            background: darkMode ? '#1e2a3a' : '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            width: '380px',
            maxWidth: '90vw',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            border: `1px solid ${darkMode ? '#2d3748' : '#e2e8f0'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: '17px', fontWeight: 600 }}>{t('remoteSync')}</span>
              <button
                onClick={() => setShowRemoteSyncDialog(false)}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                  {t('remoteHost')} *
                </label>
                <input
                  value={remoteConfig.host}
                  onChange={e => setRemoteConfig(c => ({ ...c, host: e.target.value }))}
                  placeholder="192.168.1.100"
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    border: `1px solid ${darkMode ? '#2d3748' : '#e2e8f0'}`,
                    background: darkMode ? '#0f172a' : '#f8fafc',
                    color: darkMode ? '#e2e8f0' : '#1a1a2e',
                    fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                    {t('remoteUser')} *
                  </label>
                  <input
                    value={remoteConfig.user}
                    onChange={e => setRemoteConfig(c => ({ ...c, user: e.target.value }))}
                    placeholder="root"
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px',
                      border: `1px solid ${darkMode ? '#2d3748' : '#e2e8f0'}`,
                      background: darkMode ? '#0f172a' : '#f8fafc',
                      color: darkMode ? '#e2e8f0' : '#1a1a2e',
                      fontSize: '14px', outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                    {t('port')}
                  </label>
                  <input
                    type="number"
                    value={remoteConfig.port}
                    onChange={e => setRemoteConfig(c => ({ ...c, port: parseInt(e.target.value) || 22 }))}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px',
                      border: `1px solid ${darkMode ? '#2d3748' : '#e2e8f0'}`,
                      background: darkMode ? '#0f172a' : '#f8fafc',
                      color: darkMode ? '#e2e8f0' : '#1a1a2e',
                      fontSize: '14px', outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                  {t('remotePath')}
                </label>
                <input
                  value={remoteConfig.remote_path}
                  onChange={e => setRemoteConfig(c => ({ ...c, remote_path: e.target.value }))}
                  placeholder="/root/.ssh/config"
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    border: `1px solid ${darkMode ? '#2d3748' : '#e2e8f0'}`,
                    background: darkMode ? '#0f172a' : '#f8fafc',
                    color: darkMode ? '#e2e8f0' : '#1a1a2e',
                    fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  onClick={() => setShowRemoteSyncDialog(false)}
                  style={{
                    flex: 1, padding: '10px',
                    borderRadius: '8px', fontSize: '14px', fontWeight: 500,
                    background: darkMode ? '#2d3748' : '#f1f5f9',
                    color: 'inherit', border: `1px solid ${darkMode ? '#4a5568' : '#e2e8f0'}`, cursor: 'pointer',
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleRemoteSync}
                  disabled={remoteSyncing}
                  style={{
                    flex: 2, padding: '10px',
                    borderRadius: '8px', fontSize: '14px', fontWeight: 500,
                    background: remoteSyncing ? '#818cf8' : '#4f46e5',
                    color: 'white', border: 'none', cursor: remoteSyncing ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  {remoteSyncing ? (getSystemLanguage() === 'zh-CN' ? '同步中...' : 'Syncing...') : t('syncToRemote')}
                </button>
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
