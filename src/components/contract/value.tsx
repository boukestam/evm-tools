import React from 'react';

import { ethers } from 'ethers';

import { useStore } from '../../store';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { formatAddress } from '../../utils/formatAddress';

function numberWithCommas(s: string) {
  const parts = s.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  parts[1] = parts[1].substring(0, 2);
  return parts.join('.');
}

export function ContractValue({ value, shorten }: { value: any; shorten?: boolean }) {
  const { addNotification } = useStore();

  function toString(v: any) {
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';

    return v.toString();
  }

  function toFormat(v: any) {
    if (v instanceof ethers.BigNumber) {
      if (v.gte(ethers.constants.WeiPerEther)) {
        return (
          <span>
            <span className="group-hover:underline">
              {numberWithCommas(ethers.utils.formatEther(v)).replace(/\.0+$/, '')}
            </span>{' '}
            <span className="text-xs text-gray-500">
              × 10<sup>18</sup>
            </span>
          </span>
        );
      }
    }

    if (typeof v === 'string' && v.startsWith('0x') && shorten) {
      return <span className="group-hover:underline">{formatAddress(v)}</span>;
    }

    return <span className="group-hover:underline">{toString(v)}</span>;
  }

  return (
    <div
      title={toString(value)}
      onClick={() => {
        copyToClipboard(toString(value))
          .then(() => {
            addNotification('Copied to clipboard');
          })
          .catch(() => {
            addNotification('Error while copying');
          });
      }}
      className="cursor-pointer group hover:opacity-80"
    >
      {toFormat(value)}
    </div>
  );
}
