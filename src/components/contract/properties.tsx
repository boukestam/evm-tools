import React, { useEffect } from 'react';

import { BigNumber, ContractFunction, ethers } from 'ethers';

import { useProvider } from '../../connectors';
import { ImportedContract } from '../../store';
import { getProperties } from '../../utils/parseABI';
import { ContractProperty, ContractPropertyTable } from './property';

async function fetchProperty(f: ContractFunction) {
  try {
    const result = await f();
    return result;
  } catch (e: any) {
    console.error(e);
    return e.reason || e.message || 'Unknown error';
  }
}

function ContractProperties({ contract }: { contract: ImportedContract }) {
  const provider = useProvider();

  const [balance, setBalance] = React.useState<BigNumber | null>(null);
  const [outputs, setOutputs] = React.useState<any[][]>([]);

  useEffect(() => {
    if (!provider) return;

    const views = getProperties(contract.abi);

    const contractInstance = new ethers.Contract(contract.address, contract.abi, provider);

    provider.getBalance(contract.address).then(balance => {
      setBalance(balance);
    });

    const promises = views.map(view => fetchProperty(contractInstance.functions[view.name]));

    Promise.all(promises).then(results => {
      setOutputs(results);
    });
  }, [contract, provider]);

  return (
    <>
      <ContractPropertyTable className="mb-8">
        <ContractProperty name="Address" values={[contract.address]} />
        <ContractProperty name="Balance" values={[balance]} />
      </ContractPropertyTable>

      <ContractPropertyTable>
        {getProperties(contract.abi).map((view, viewIndex) => (
          <ContractProperty key={view.name} name={view.name} values={outputs[viewIndex]} />
        ))}
      </ContractPropertyTable>
    </>
  );
}

export default ContractProperties;
