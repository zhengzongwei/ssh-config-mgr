import { Box, Flex } from '@radix-ui/themes';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import StatusBar from './components/StatusBar';

import { invoke } from '@tauri-apps/api/core';

// ... existing code

const handleSync = () => {
  invoke('sync_ssh_config')
    .then((message) => {
      alert(message);
      console.log(message);
    })
    .catch(console.error);
};

function App() {
  return (
    <Flex direction="column" style={{ height: '100vh', backgroundColor: 'var(--gray-1)' }}>
      <Box style={{
        padding: 'var(--space-2) var(--space-3)',
        borderBottom: '1px solid var(--gray-a5)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <input type="search" placeholder="🔍 搜索..." style={{ width: '300px', padding: '4px 8px', borderRadius: 'var(--radius-2)' }} />
        <div>
          <button onClick={handleSync} style={{ marginRight: '8px' }}>🔄 同步</button>
          <button style={{ marginRight: '8px' }}>⚙️</button>
          <button>🌙</button>
        </div>
      </Box>
      <Flex style={{ flexGrow: 1, overflow: 'hidden' }}>
        <Sidebar />
        <MainContent />
      </Flex>
      <StatusBar />
    </Flex>
  );
}

export default App;
