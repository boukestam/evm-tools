import React from 'react';

import clsx from 'clsx';

import { ContractValue } from './value';

export function ContractProperty({ name, values }: { name: string; values: any }) {
  return (
    <div className="flex px-4 py-3 text-sm bg-white border-b border-gray-200 even:bg-gray-50 odd:bg-gray-100">
      <div className="flex-initial w-64">{name}</div>
      <div>
        {Array.isArray(values) &&
          values.map((value, valueIndex) => <ContractValue value={value} key={valueIndex} />)}
      </div>
    </div>
  );
}

export function ContractPropertyTable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('overflow-hidden rounded shadow-md', className)}>
      <div className="flex px-4 py-2 font-bold text-white bg-blue-500">
        <div className="flex-initial w-64">Name</div>
        <div className="flex-1">Value</div>
      </div>

      <div>{children}</div>
    </div>
  );
}
