import { invoke } from '@tauri-apps/api/core';
import { useState, useCallback } from 'react';
import { RefreshCw, Settings, Moon, Sun, Plus } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import StatusBar from './components/StatusBar';
import AddHostDialog from './components/AddHostDialog';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [syncing, setSyncing] = useState(false);

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
          <Plus size={16} />
          新增主机
        </button>

        <button
          onClick={handleSync}
          disabled={syncing}
          title="同步到 ~/.ssh/config"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px',
            background: darkMode ? '#2d3748' : '#f1f5f9',
            borderRadius: '8px',
            fontSize: '14px',
            border: `1px solid ${darkMode ? '#4a5568' : '#e2e8f0'}`,
            color: 'inherit',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = darkMode ? '#4a5568' : '#e2e8f0')}
          onMouseLeave={e => (e.currentTarget.style.background = darkMode ? '#2d3748' : '#f1f5f9')}
        >
          <RefreshCw size={16} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
          同步
        </button>

        <button
          onClick={() => setDarkMode(d => !d)}
          title={darkMode ? '切换浅色模式' : '切换深色模式'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px',
            background: darkMode ? '#2d3748' : '#f1f5f9',
            borderRadius: '8px',
            border: `1px solid ${darkMode ? '#4a5568' : '#e2e8f0'}`,
          }}
        >
          {darkMode ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#475569" />}
        </button>

        <button
          title="设置"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px',
            background: darkMode ? '#2d3748' : '#f1f5f9',
            borderRadius: '8px',
            border: `1px solid ${darkMode ? '#4a5568' : '#e2e8f0'}`,
            color: 'inherit',
          }}
        >
          <Settings size={16} color={darkMode ? '#94a3b8' : '#475569'} />
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

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default App;
