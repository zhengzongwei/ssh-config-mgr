import { Box, Flex, Card, Text } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

// Assuming HostConfig is defined in a types file
interface HostConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  user: string;
  notes?: string;
}

const HostCard = ({ name, host, port, user, notes }: HostConfig) => (
  <Card style={{ width: '200px', margin: 'var(--space-2)' }}>
    <Flex direction="column">
      <Text weight="bold">{name}</Text>
      <Text size="2" color="gray">📍 {host}:{port}</Text>
      <Text size="2" color="gray">👤 {user} 🔑 id_rsa</Text>
      <Text size="2" color="gray" mt="2">💬 {notes || 'No notes'}</Text>
      <Flex mt="3" gap="2">
        <button>⚡ 启动</button>
        <button>📋 复制</button>
        <button>📝 编辑</button>
      </Flex>
    </Flex>
  </Card>
);


const MainContent = () => {
  const [hosts, setHosts] = useState<HostConfig[]>([]);

  useEffect(() => {
    invoke<HostConfig[]>('get_hosts')
      .then(setHosts)
      .catch(console.error);
  }, []);

  return (
    <Box style={{ flexGrow: 1, padding: 'var(--space-3)', overflowY: 'auto' }}>
      <Flex wrap="wrap">
        {hosts.length > 0 ? (
          hosts.map(host => <HostCard key={host.id} {...host} />)
        ) : (
          <Text>No hosts found. Add one to get started!</Text>
        )}
      </Flex>
    </Box>
  );
};

export default MainContent;
