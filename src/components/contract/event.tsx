import React, { useState } from 'react';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';

import { ethers, Event } from 'ethers';

import { useProvider } from '../../connectors';
import { ImportedContract } from '../../store';
import { formatDate } from '../../utils/formatDate';
import { ABIEvent } from '../../utils/parseABI';
import Button from '../button';
import { Collapsable } from '../collapsable';
import { ContractValue } from './value';

interface ExtendedEvent extends Event {
  timestamp: number;
}

export default function ContractEvent({
  contract,
  event,
}: {
  contract: ImportedContract;
  event: ABIEvent;
}) {
  const provider = useProvider();

  const [outputs, setOutputs] = useState<ExtendedEvent[]>([]);

  async function fetch() {
    if (!contract || !provider) return;

    const contractInstance = new ethers.Contract(
      contract.address,
      contract.abi,
      provider.getSigner(0),
    );

    try {
      const blocksToAverage = 10000;
      const block = await provider.getBlock('latest');
      const blockAgo = await provider.getBlock(block.number - blocksToAverage);
      const averageBlockTime = (block.timestamp - blockAgo.timestamp) / blocksToAverage;
      const timeSpan = 3600 * 4;
      const numBlocks = 1500; //Math.floor(timeSpan / averageBlockTime);

      const filter = contractInstance.filters[event.name]();
      const events = await contractInstance.queryFilter(
        filter,
        block.number - numBlocks,
        block.number,
      );

      const extendedEvents: ExtendedEvent[] = events.map(event => {
        const timestamp = block.timestamp - (block.number - event.blockNumber) * averageBlockTime;
        return { ...event, timestamp };
      });

      console.log('Events', extendedEvents);

      setOutputs(extendedEvents);
    } catch (e) {
      console.error(e);
      setOutputs([(e as any).toString()]);
    }
  }

  return (
    <Collapsable
      className="mb-1"
      header={
        <div className="flex items-center px-4 py-3 text-sm border border-gray-200 cursor-pointer bg-gray-50">
          <div className="flex-initial w-64">{event.name}</div>
          <div className="flex-1"></div>
          <div>
            <MdExpandLess size={20} className="hidden collapsable-expanded:block" />
            <MdExpandMore size={20} className="collapsable-expanded:hidden" />
          </div>
        </div>
      }
      key={event.name}
    >
      <div className="p-4 bg-white border-b border-gray-200 border-x">
        <Button type="secondary" className="mt-2" onClick={fetch}>
          Fetch
        </Button>

        <div className="mt-2">
          <table className="overflow-hidden text-sm rounded shadow-md">
            <thead className="font-bold text-white bg-blue-500">
              <tr>
                <th className="p-2">Date</th>

                {event.inputs.map(input => (
                  <th key={input.name} className="p-2">
                    {input.name}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {outputs.map((output, outputIndex) => (
                <tr
                  key={outputIndex}
                  className="text-sm bg-white border-b border-gray-200 even:bg-gray-50 odd:bg-gray-100"
                >
                  <td className="p-2 text-center">
                    {formatDate(new Date(output.timestamp * 1000))}
                  </td>

                  {output.args?.map((arg, argIndex) => (
                    <td key={argIndex} className="pr-4 text-center">
                      <ContractValue value={arg} shorten={true} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Collapsable>
  );
}
