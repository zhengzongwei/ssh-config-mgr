import { Box, Flex, Card, Text } from '@radix-ui/themes';

const HostCard = ({ name, ip, user, notes }: { name: string, ip: string, user: string, notes: string }) => (
  <Card style={{ width: '200px', margin: 'var(--space-2)' }}>
    <Flex direction="column">
      <Text weight="bold">{name}</Text>
      <Text size="2" color="gray">📍 {ip}</Text>
      <Text size="2" color="gray">👤 {user} 🔑 id_rsa</Text>
      <Text size="2" color="gray" mt="2">💬 {notes}</Text>
      <Flex mt="3" gap="2">
        <button>⚡ 启动</button>
        <button>📋 复制</button>
        <button>📝 编辑</button>
      </Flex>
    </Flex>
  </Card>
);


const MainContent = () => {
  return (
    <Box style={{ flexGrow: 1, padding: 'var(--space-3)', overflowY: 'auto' }}>
      <Flex wrap="wrap">
        <HostCard name="web-prod-01" ip="192.168.1.101:22" user="ubuntu" notes="Web Server 01" />
        <HostCard name="db-prod-01" ip="192.168.1.102:22" user="ubuntu" notes="Database Server" />
        <HostCard name="api-prod-01" ip="192.168.1.103:22" user="ubuntu" notes="API Server" />
        <HostCard name="test-server" ip="192.168.2.101:22" user="developer" notes="Test Server" />
        <HostCard name="dev-local" ip="127.0.0.1:2222" user="dev" notes="Local Dev Machine" />
      </Flex>
    </Box>
  );
};

export default MainContent;
