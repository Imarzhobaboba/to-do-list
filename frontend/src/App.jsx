import React from 'react';
import { ConfigProvider } from 'antd';
import TaskPage from './pages/TaskPage';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00b96b',
        },
      }}
    >
      <div className="App">
        <TaskPage />
      </div>
    </ConfigProvider>
  );
}

export default App;