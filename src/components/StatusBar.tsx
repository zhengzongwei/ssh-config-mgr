import { Box, Text } from '@radix-ui/themes';

const StatusBar = () => {
  return (
    <Box style={{
      padding: 'var(--space-2) var(--space-3)',
      borderTop: '1px solid var(--gray-a5)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: 'var(--font-size-1)'
    }}>
      <Text>📋 12 台主机</Text>
      <Text>📁 4 个分组</Text>
      <Text>🔄 已同步</Text>
      <Text>⏱ 2 分钟前</Text>
    </Box>
  );
};

export default StatusBar;
