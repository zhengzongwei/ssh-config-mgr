// 国际化支持 - 基于系统语言自动切换

type Language = 'zh-CN' | 'en-US';

// 获取系统语言
function getSystemLanguage(): Language {
  if (typeof window !== 'undefined') {
    const lang = navigator.language || (navigator as any).userLanguage;
    if (lang.startsWith('zh')) return 'zh-CN';
  }
  return 'en-US';
}

// 翻译文本
const translations: Record<Language, Record<string, string>> = {
  'zh-CN': {
    // 通用
    search: '搜索主机...',
    addHost: '新增主机',
    sync: '同步',
    settings: '设置',
    cancel: '取消',
    confirm: '确认',
    delete: '删除',
    edit: '编辑',
    copy: '复制',
    close: '关闭',

    // 侧边栏
    allHosts: '全部主机',
    groups: '分组',
    noGroups: '暂无分组，点击 + 新建',

    // 新增主机对话框
    addHostTitle: '新增主机',
    hostAlias: '主机别名',
    hostIp: 'IP / 域名',
    port: '端口',
    username: '用户名',
    authMethod: '认证方式',
    sshKey: 'SSH 密钥',
    password: '密码',
    sshAgent: 'SSH Agent',
    selectGroup: '所属分组',
    noGroup: '-- 不分组 --',
    keyFilePath: '密钥文件路径',
    notes: '备注',
    addHostBtn: '添加主机',
    adding: '添加中...',
    requiredFields: '主机别名、IP/域名和用户名为必填项',

    // 设置对话框
    settingsTitle: '设置',
    syncConfig: '同步配置',
    syncConfigDesc: '将主机配置同步到 ~/.ssh/config',
    importConfig: '导入配置',
    importConfigDesc: '从 ~/.ssh/config 导入主机配置',
    exportConfig: '导出配置',
    exportConfigDesc: '选择导出格式',
    syncing: '同步中...',
    importing: '导入中...',

    // 主机卡片
    launch: '启动',
    copySSH: '复制SSH命令',
    showInVSCode: 'VS Code 显示',
    hideInVSCode: 'VS Code 隐藏',
    confirmDelete: '确认删除该主机？',

    // 分组
    groupName: '分组名称',
    createGroup: '新建分组',
    enterConfirm: 'Enter 确认',
    escCancel: 'Esc 取消',
    confirmDeleteGroup: '确认删除该分组？分组内的主机将变为未分组状态。',
    color: '颜色',

    // 导出格式
    jsonFormat: 'JSON 格式',
    tomlFormat: 'TOML 格式',
    sshConfigFormat: 'SSH Config',

    // 主机列表
    noHosts: '暂无主机，点击「新增主机」开始添加',
    noHostsFound: '没有找到匹配的主机',

    // 状态栏
    hosts: '台主机',
    groupCount: '个分组',
    ready: '已就绪',
    notSynced: '未同步',

    // 提示
    syncSuccess: '同步成功',
    syncFailed: '同步失败',
    importSuccess: '导入成功',
    importFailed: '导入失败',
    exportSuccess: '导出成功',
    exportFailed: '导出失败',
    createGroupFailed: '创建分组失败',
    deleteGroupFailed: '删除分组失败',

    // 远程同步
    remoteSync: '远程同步',
    remoteSyncDesc: '同步配置到远程服务器',
    remoteHost: '远程主机',
    remoteUser: '远程用户',
    remotePath: '远程路径',
    syncToRemote: '同步到远程',
  },
  'en-US': {
    // Common
    search: 'Search hosts...',
    addHost: 'Add Host',
    sync: 'Sync',
    settings: 'Settings',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    copy: 'Copy',
    close: 'Close',

    // Sidebar
    allHosts: 'All Hosts',
    groups: 'Groups',
    noGroups: 'No groups, click + to create',

    // Add Host Dialog
    addHostTitle: 'Add Host',
    hostAlias: 'Host Alias',
    hostIp: 'IP / Domain',
    port: 'Port',
    username: 'Username',
    authMethod: 'Auth Method',
    sshKey: 'SSH Key',
    password: 'Password',
    sshAgent: 'SSH Agent',
    selectGroup: 'Group',
    noGroup: '-- No Group --',
    keyFilePath: 'Key File Path',
    notes: 'Notes',
    addHostBtn: 'Add Host',
    adding: 'Adding...',
    requiredFields: 'Host alias, IP/domain and username are required',

    // Settings Dialog
    settingsTitle: 'Settings',
    syncConfig: 'Sync Config',
    syncConfigDesc: 'Sync host config to ~/.ssh/config',
    importConfig: 'Import Config',
    importConfigDesc: 'Import hosts from ~/.ssh/config',
    exportConfig: 'Export Config',
    exportConfigDesc: 'Select export format',
    syncing: 'Syncing...',
    importing: 'Importing...',

    // Host Card
    launch: 'Launch',
    copySSH: 'Copy SSH Command',
    showInVSCode: 'Show in VS Code',
    hideInVSCode: 'Hide in VS Code',
    confirmDelete: 'Confirm delete this host?',

    // Group
    groupName: 'Group Name',
    createGroup: 'Create Group',
    enterConfirm: 'Enter to confirm',
    escCancel: 'Esc to cancel',
    confirmDeleteGroup: 'Delete this group? Hosts will become ungrouped.',
    color: 'Color',

    // Export formats
    jsonFormat: 'JSON Format',
    tomlFormat: 'TOML Format',
    sshConfigFormat: 'SSH Config',

    // Host List
    noHosts: 'No hosts, click "Add Host" to get started',
    noHostsFound: 'No matching hosts found',

    // Status Bar
    hosts: 'hosts',
    groupCount: 'groups',
    ready: 'Ready',
    notSynced: 'Not synced',

    // Messages
    syncSuccess: 'Sync successful',
    syncFailed: 'Sync failed',
    importSuccess: 'Import successful',
    importFailed: 'Import failed',
    exportSuccess: 'Export successful',
    exportFailed: 'Export failed',
    createGroupFailed: 'Failed to create group',
    deleteGroupFailed: 'Failed to delete group',

    // Remote Sync
    remoteSync: 'Remote Sync',
    remoteSyncDesc: 'Sync config to remote server',
    remoteHost: 'Remote Host',
    remoteUser: 'Remote User',
    remotePath: 'Remote Path',
    syncToRemote: 'Sync to Remote',
  }
};

// 当前语言
let currentLanguage: Language = getSystemLanguage();

// 获取翻译
export function t(key: string): string {
  return translations[currentLanguage][key] || key;
}

// 获取当前语言
export function getCurrentLanguage(): Language {
  return currentLanguage;
}

// 切换语言
export function setLanguage(lang: Language): void {
  currentLanguage = lang;
}

// 导出语言检测函数
export { getSystemLanguage };
export type { Language };
