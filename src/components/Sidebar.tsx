import { Box, Text } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface Group {
  id: string;
  name: string;
  icon?: string;
}

const Sidebar = () => {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    invoke<Group[]>('get_groups')
      .then(setGroups)
      .catch(console.error);
  }, []);

  return (
    <Box width="250px" style={{ borderRight: '1px solid var(--gray-a5)', padding: 'var(--space-3)' }}>
      <ul>
        <li>📁 全部</li>
        {groups.map(group => (
          <li key={group.id}>{group.icon || '📁'} {group.name}</li>
        ))}
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
