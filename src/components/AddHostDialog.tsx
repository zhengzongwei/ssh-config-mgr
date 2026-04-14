import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { X, Server } from 'lucide-react';

interface AddHostDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  darkMode: boolean;
}

const AddHostDialog = ({ open, onClose, onSuccess, darkMode }: AddHostDialogProps) => {
  const [form, setForm] = useState({
    name: '',
    host: '',
    port: '22',
    user: 'root',
    authType: 'key',
    identityFile: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const bg = darkMode ? '#1e2a3a' : '#ffffff';
  const overlayBg = 'rgba(0,0,0,0.5)';
  const border = darkMode ? '#2d3748' : '#e2e8f0';
  const inputBg = darkMode ? '#0f172a' : '#f8fafc';
  const labelColor = darkMode ? '#94a3b8' : '#64748b';

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: `1px solid ${border}`,
    background: inputBg,
    color: darkMode ? '#e2e8f0' : '#1a1a2e',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: labelColor,
    marginBottom: '4px',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.host.trim() || !form.user.trim()) {
      setError('主机别名、IP/域名和用户名为必填项');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const now = new Date().toISOString();
      await invoke('add_host', {
        host: {
          id: crypto.randomUUID(),
          name: form.name.trim(),
          host: form.host.trim(),
          port: parseInt(form.port) || 22,
          user: form.user.trim(),
          authType: form.authType,
          identityFile: form.identityFile.trim() || null,
          group: null,
          tags: null,
          color: null,
          notes: form.notes.trim() || null,
          customOptions: null,
          createdAt: now,
          updatedAt: now,
        }
      });
      setForm({ name: '', host: '', port: '22', user: 'root', authType: 'key', identityFile: '', notes: '' });
      onSuccess();
      onClose();
    } catch (e) {
      setError('添加失败: ' + e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: overlayBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(2px)',
      }}
    >
      <div style={{
        background: bg,
        borderRadius: '16px',
        padding: '24px',
        width: '460px',
        maxWidth: '90vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: `1px solid ${border}`,
      }}>
        {/* 标题 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: darkMode ? '#312e81' : '#eef2ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Server size={18} color="#4f46e5" />
            </div>
            <span style={{ fontSize: '17px', fontWeight: 600 }}>新增主机</span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: darkMode ? '#2d3748' : '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: labelColor, cursor: 'pointer', border: 'none',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>主机别名 *</label>
              <input
                style={inputStyle}
                placeholder="如: web-prod-01"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                autoFocus
              />
            </div>
            <div>
              <label style={labelStyle}>IP / 域名 *</label>
              <input
                style={inputStyle}
                placeholder="如: 192.168.1.100"
                value={form.host}
                onChange={e => setForm(f => ({ ...f, host: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>端口</label>
              <input
                style={inputStyle}
                type="number"
                placeholder="22"
                value={form.port}
                onChange={e => setForm(f => ({ ...f, port: e.target.value }))}
              />
            </div>
            <div>
              <label style={labelStyle}>用户名 *</label>
              <input
                style={inputStyle}
                placeholder="如: ubuntu, root"
                value={form.user}
                onChange={e => setForm(f => ({ ...f, user: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>认证方式</label>
            <select
              style={{ ...inputStyle, appearance: 'none' }}
              value={form.authType}
              onChange={e => setForm(f => ({ ...f, authType: e.target.value }))}
            >
              <option value="key">SSH 密钥</option>
              <option value="password">密码</option>
              <option value="agent">SSH Agent</option>
            </select>
          </div>

          {form.authType === 'key' && (
            <div>
              <label style={labelStyle}>密钥文件路径</label>
              <input
                style={inputStyle}
                placeholder="如: ~/.ssh/id_rsa"
                value={form.identityFile}
                onChange={e => setForm(f => ({ ...f, identityFile: e.target.value }))}
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>备注</label>
            <input
              style={inputStyle}
              placeholder="可选备注信息"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 12px', borderRadius: '8px',
              background: darkMode ? '#2d1515' : '#fef2f2',
              color: '#ef4444', fontSize: '13px',
              border: '1px solid #fca5a5',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '10px',
                borderRadius: '8px', fontSize: '14px', fontWeight: 500,
                background: darkMode ? '#2d3748' : '#f1f5f9',
                color: 'inherit', border: `1px solid ${border}`, cursor: 'pointer',
              }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2, padding: '10px',
                borderRadius: '8px', fontSize: '14px', fontWeight: 500,
                background: loading ? '#818cf8' : '#4f46e5',
                color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {loading ? '添加中...' : '添加主机'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHostDialog;
