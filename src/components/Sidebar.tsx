import { Box } from '@radix-ui/themes';

const Sidebar = () => {
  return (
    <Box width="250px" style={{ borderRight: '1px solid var(--gray-a5)', padding: 'var(--space-3)' }}>
      <ul>
        <li>📁 全部</li>
        <li>📁 生产环境</li>
        <li>📁 测试环境</li>
        <li>📁 开发环境</li>
      </ul>
      <hr style={{ margin: 'var(--space-3) 0' }} />
      <ul>
        <li>🔧 工具</li>
        <li>📥 导入</li>
        <li>📤 导出</li>
        <li>🔄 同步状态</li>
      </ul>
    </Box>
  );
};

export default Sidebar;
