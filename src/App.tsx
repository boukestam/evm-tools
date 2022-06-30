import React from 'react';

import Contract from './components/contract/contract';
import Contracts from './components/contracts';
import Header from './components/header';
import { useStore } from './store';

function App() {
  const { notifications, removeNotification } = useStore();

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-col flex-initial w-64 bg-gray-100 border-r border-gray-200">
        <div className="flex items-center px-4 py-2 mb-8 text-xl font-bold text-black">
          <img
            src={process.env.PUBLIC_URL + '/android-chrome-192x192.png'}
            alt="logo"
            className="h-12 mr-2"
          />
          EVM Tools
        </div>

        <div className="p-4">
          <Contracts />
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <Header />

        <div className="flex justify-center flex-1 p-4">
          <Contract />
        </div>
      </div>

      <div className="fixed left-4 bottom-4">
        {notifications.map(notification => (
          <div
            className="px-4 py-2 mt-2 text-white bg-gray-800 rounded opacity-80"
            onClick={() => removeNotification(notification)}
          >
            {notification}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
