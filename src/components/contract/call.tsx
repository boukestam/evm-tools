import React, { useState } from 'react';
import { CgSpinner } from 'react-icons/cg';
import { MdCheck, MdClose, MdExpandLess, MdExpandMore } from 'react-icons/md';

import { ContractReceipt, ContractTransaction, ethers } from 'ethers';

import { useChainId, useProvider } from '../../connectors';
import { getExplorerTxUrl } from '../../constants/chains';
import { ImportedContract } from '../../store';
import { ABIFunction } from '../../utils/parseABI';
import Button from '../button';
import { Collapsable } from '../collapsable';
import FormRow from '../form-row';
import { ContractProperty, ContractPropertyTable } from './property';
import { ContractValue } from './value';

interface EthersError {
  code: string | number;
  message: string;
  reason?: string;
  replacement?: ContractTransaction;
  receipt?: ContractReceipt;
}

export default function ContractCall({
  contract,
  call,
  actionLabel,
}: {
  contract: ImportedContract;
  call: ABIFunction;
  actionLabel: string;
}) {
  const provider = useProvider();
  const chainId = useChainId();

  const [inputs, setInputs] = useState<string[]>(new Array(call.inputs.length).fill(''));
  const [outputs, setOutputs] = useState<any[]>([]);

  const [tx, setTx] = useState<ContractTransaction | null>(null);
  const [receipt, setReceipt] = useState<ContractReceipt | null>(null);

  const [error, setError] = useState<EthersError | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  async function fetch() {
    if (!contract || !provider) return;

    setOutputs([]);
    setTx(null);
    setReceipt(null);
    setError(null);
    setLoading(true);

    const contractInstance = new ethers.Contract(
      contract.address,
      contract.abi,
      provider.getSigner(0),
    );

    try {
      const response = await contractInstance.functions[call.name](...inputs);

      if (call.stateMutability !== 'view') {
        const tx: ContractTransaction = response;
        setTx(tx);

        const receipt = await tx.wait();
        setReceipt(receipt);
      } else {
        setOutputs(response);
      }
    } catch (e) {
      const ethersError = e as EthersError;

      if (ethersError.reason === 'repriced') {
        const tx = ethersError.replacement as ContractTransaction;

        setTx(tx);
        setReceipt(ethersError.receipt as ContractReceipt);
      } else {
        console.error(ethersError);
        setError(ethersError);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Collapsable
      className="mb-2"
      header={
        <div className="flex items-center px-4 py-3 text-sm border border-gray-200 rounded cursor-pointer bg-gray-50 collapsable-expanded:rounded-b-none">
          <div className="flex-initial w-64">{call.name}</div>
          <div className="flex-1"></div>
          <div>
            <MdExpandLess size={20} className="hidden collapsable-expanded:block" />
            <MdExpandMore size={20} className="collapsable-expanded:hidden" />
          </div>
        </div>
      }
      key={call.name}
    >
      <div className="p-4 bg-white border-b border-gray-200 rounded-b border-x">
        {call.inputs.map((input, inputIndex) => (
          <FormRow label={`${input.name || 'input' + inputIndex} (${input.type})`} key={inputIndex}>
            <input
              type="text"
              value={inputs[inputIndex]}
              onChange={e => {
                const copy = [...inputs];
                copy[inputIndex] = e.target.value;
                setInputs(copy);
              }}
            />
          </FormRow>
        ))}

        <Button type="primary" className="flex mt-2" onClick={fetch} disabled={loading}>
          {actionLabel}
        </Button>

        <div className="mt-8">
          {outputs.length > 0 && (
            <ContractPropertyTable>
              {outputs.map((output, outputIndex) => (
                <ContractProperty
                  key={outputIndex}
                  name={call.outputs[outputIndex].name || 'output' + outputIndex}
                  values={[output]}
                />
              ))}
            </ContractPropertyTable>
          )}

          {chainId && tx && (
            <div className="flex items-center mt-4">
              <a
                href={getExplorerTxUrl(chainId, tx.hash)}
                target="_blank"
                className="text-blue-400 underline"
              >
                View in explorer
              </a>

              {loading && <CgSpinner size={20} className="ml-2 animate-spin" />}
              {!loading && !error && <MdCheck size={20} className="ml-2 text-green-400" />}
              {!loading && error && <MdClose size={20} className="ml-2 text-red-400" />}
            </div>
          )}

          {error && <div className="text-red-400">{error.reason || error.message}</div>}
        </div>
      </div>
    </Collapsable>
  );
}
