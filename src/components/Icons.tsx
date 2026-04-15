/**
 * 内联 SVG 图标组件
 * 替代 lucide-react，解决 WebKitGTK (Tauri/Linux) 下图标不渲染的问题
 */

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
  className?: string;
}

const svgBase = (size: number, style?: React.CSSProperties) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24' as const,
  fill: 'none' as const,
  xmlns: 'http://www.w3.org/2000/svg',
  style: { display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style },
});

// 月亮 (深色模式)
export const MoonIcon = ({ size = 18, color = '#475569', strokeWidth = 2, style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 太阳 (浅色模式)
export const SunIcon = ({ size = 18, color = '#f59e0b', strokeWidth = 2, style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <circle cx="12" cy="12" r="5" stroke={color} strokeWidth={strokeWidth} />
    <line x1="12" y1="1" x2="12" y2="3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="12" y1="21" x2="12" y2="23" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="1" y1="12" x2="3" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="21" y1="12" x2="23" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

// 设置齿轮
export const SettingsIcon = ({ size = 18, color = '#475569', strokeWidth = 2, style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

// 加号
export const PlusIcon = ({ size = 18, color = 'currentColor', strokeWidth = 2, style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

// 刷新/同步
export const RefreshCwIcon = ({ size = 18, color = 'currentColor', strokeWidth = 2, style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <path d="M21 2v6h-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 22v-6h6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 服务器
export const ServerIcon = ({ size = 18, color = 'currentColor', strokeWidth = 2, style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" stroke={color} strokeWidth={strokeWidth} />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" stroke={color} strokeWidth={strokeWidth} />
    <line x1="6" y1="6" x2="6.01" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="6" y1="18" x2="6.01" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

// 文件夹
export const FolderIcon = ({ size = 18, color = 'currentColor', strokeWidth = 2, style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 打开的文件夹
export const FolderOpenIcon = ({ size = 18, color = 'currentColor', strokeWidth = 2, style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 下载
export const DownloadIcon = ({ size = 18, color = 'currentColor', strokeWidth = 2, style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="7 10 12 15 17 10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="15" x2="12" y2="3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

// 上传
export const UploadIcon = ({ size = 18, color = 'currentColor', strokeWidth = 2, style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="17 8 12 3 7 8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="3" x2="12" y2="15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

// 扳手
export const WrenchIcon = ({ size = 18, color = 'currentColor', strokeWidth = 2, style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 垃圾桶
export const TrashIcon = ({ size = 18, color = 'currentColor', strokeWidth = 2, style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <path d="M3 6h18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <line x1="10" y1="11" x2="10" y2="17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="14" y1="11" x2="14" y2="17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

// 终端
export const TerminalIcon = ({ size = 18, color = 'currentColor', strokeWidth = 2, style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <polyline points="4 17 10 11 4 5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="19" x2="20" y2="19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

// 复制
export const CopyIcon = ({ size = 18, color = 'currentColor', strokeWidth = 2, style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke={color} strokeWidth={strokeWidth} />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 编辑 (铅笔)
export const EditIcon = ({ size = 18, color = 'currentColor', strokeWidth = 2, style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="m15 5 4 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 眼睛 (可见)
export const EyeIcon = ({ size = 18, color = 'currentColor', strokeWidth = 2, style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

// 眼睛关闭 (不可见)
export const EyeOffIcon = ({ size = 18, color = 'currentColor', strokeWidth = 2, style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <line x1="1" y1="1" x2="23" y2="23" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

// 活动/脉搏
export const ActivityIcon = ({ size = 18, color = 'currentColor', strokeWidth = 2, style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 搜索
export const SearchIcon = ({ size = 18, color = 'currentColor', strokeWidth = 2, style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <circle cx="11" cy="11" r="8" stroke={color} strokeWidth={strokeWidth} />
    <path d="m21 21-4.35-4.35" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

// 打勾圆圈
export const CheckCircleIcon = ({ size = 18, color = 'currentColor', strokeWidth = 2, style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="22 4 12 14.01 9 11.01" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 时钟
export const ClockIcon = ({ size = 18, color = 'currentColor', strokeWidth = 2, style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
    <polyline points="12 6 12 12 16 14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 关闭 (X)
export const XIcon = ({ size = 18, color = 'currentColor', strokeWidth = 2, style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

// 调色板
export const PaletteIcon = ({ size = 18, color = 'currentColor', strokeWidth = 2, style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <circle cx="13.5" cy="6.5" r="0.5" fill={color} />
    <circle cx="17.5" cy="10.5" r="0.5" fill={color} />
    <circle cx="8.5" cy="7.5" r="0.5" fill={color} />
    <circle cx="6.5" cy="12.5" r="0.5" fill={color} />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 拖拽手柄
export const GripVerticalIcon = ({ size = 18, color = 'currentColor', style }: IconProps) => (
  <svg {...svgBase(size, style)}>
    <circle cx="9" cy="5" r="1" fill={color} />
    <circle cx="9" cy="12" r="1" fill={color} />
    <circle cx="9" cy="19" r="1" fill={color} />
    <circle cx="15" cy="5" r="1" fill={color} />
    <circle cx="15" cy="12" r="1" fill={color} />
    <circle cx="15" cy="19" r="1" fill={color} />
  </svg>
);

// 应用 Logo - SSH 终端 + 齿轮组合
export const AppLogo = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 背景圆角矩形 */}
    <rect width="512" height="512" rx="108" fill="url(#logoGrad)" />
    {/* 终端窗口外框 */}
    <rect x="80" y="100" width="352" height="280" rx="24" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="12" />
    {/* 标题栏 */}
    <line x1="80" y1="148" x2="432" y2="148" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
    <circle cx="116" cy="125" r="10" fill="#ff5f57" />
    <circle cx="146" cy="125" r="10" fill="#ffbd2e" />
    <circle cx="176" cy="125" r="10" fill="#28c840" />
    {/* SSH 提示符 > */}
    <polyline points="130,210 180,250 130,290" fill="none" stroke="white" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
    {/* 光标横线 */}
    <line x1="200" y1="290" x2="300" y2="290" stroke="white" strokeWidth="18" strokeLinecap="round" />
    {/* 右下角小齿轮 */}
    <g transform="translate(340, 300)">
      <circle cx="40" cy="40" r="16" stroke="rgba(255,255,255,0.9)" strokeWidth="8" fill="none" />
      <line x1="40" y1="14" x2="40" y2="24" stroke="rgba(255,255,255,0.9)" strokeWidth="8" strokeLinecap="round" />
      <line x1="40" y1="56" x2="40" y2="66" stroke="rgba(255,255,255,0.9)" strokeWidth="8" strokeLinecap="round" />
      <line x1="14" y1="40" x2="24" y2="40" stroke="rgba(255,255,255,0.9)" strokeWidth="8" strokeLinecap="round" />
      <line x1="56" y1="40" x2="66" y2="40" stroke="rgba(255,255,255,0.9)" strokeWidth="8" strokeLinecap="round" />
      <line x1="21.6" y1="21.6" x2="28.7" y2="28.7" stroke="rgba(255,255,255,0.9)" strokeWidth="8" strokeLinecap="round" />
      <line x1="51.3" y1="51.3" x2="58.4" y2="58.4" stroke="rgba(255,255,255,0.9)" strokeWidth="8" strokeLinecap="round" />
      <line x1="21.6" y1="58.4" x2="28.7" y2="51.3" stroke="rgba(255,255,255,0.9)" strokeWidth="8" strokeLinecap="round" />
      <line x1="51.3" y1="28.7" x2="58.4" y2="21.6" stroke="rgba(255,255,255,0.9)" strokeWidth="8" strokeLinecap="round" />
    </g>
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#4f46e5" />
      </linearGradient>
    </defs>
  </svg>
);
