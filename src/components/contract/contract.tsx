import React, { useState } from 'react';
import { FaFileContract } from 'react-icons/fa';

import clsx from 'clsx';

import { useStore } from '../../store';
import ContractEvents from './events';
import ContractProperties from './properties';
import ContractRead from './read';
import ContractWrite from './write';

enum ContractTab {
  Properties = 'Properties',
  Read = 'Read',
  Write = 'Write',
  Events = 'Events',
}

function Contract() {
  const { selectedContract } = useStore();

  const [tab, setTab] = useState<ContractTab>(ContractTab.Properties);

  return (
    <div className="flex-1 max-w-4xl bg-white">
      {selectedContract ? (
        <>
          <div className="flex justify-center">
            {Object.keys(ContractTab).map(option => (
              <div
                key={option}
                className={clsx(
                  'p-1 m-2 cursor-pointer font-bold text-gray-600 hover:text-blue-500 transition-all border-b-2',
                  option === tab ? 'border-blue-500 text-blue-500' : 'border-transparent',
                )}
                onClick={() => setTab(option as ContractTab)}
              >
                {option}
              </div>
            ))}
          </div>

          <div className="p-6">
            {tab === ContractTab.Properties && <ContractProperties contract={selectedContract} />}
            {tab === ContractTab.Read && <ContractRead contract={selectedContract} />}
            {tab === ContractTab.Write && <ContractWrite contract={selectedContract} />}
            {tab === ContractTab.Events && <ContractEvents contract={selectedContract} />}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 h-96">
          <FaFileContract size={48} className="mb-4 text-gray-200" />
          <div className="font-bold text-gray-300">No contract selected</div>
        </div>
      )}
    </div>
  );
}

export default Contract;
