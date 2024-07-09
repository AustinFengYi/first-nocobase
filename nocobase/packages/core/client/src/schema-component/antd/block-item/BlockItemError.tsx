/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import { FC } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { BlockItemCard } from './BlockItemCard';
import { ErrorFallback } from '../error-fallback';
import { SchemaSettings } from '../../../application/schema-settings/SchemaSettings';
import { SchemaToolbar } from '../../../schema-settings/GeneralSchemaDesigner';

const blockDeleteSettings = new SchemaSettings({
  name: 'blockDeleteSettings',
  items: [
    {
      name: 'remove',
      type: 'remove',
      componentProps: {
        removeParentsIfNoChildren: true,
        breakRemoveOn(s) {
          return s['x-component'] === 'Grid'; // 其顶级是 Grid，这一层级不能删
        },
      },
    },
  ],
});

const FallbackComponent: FC<FallbackProps> = (props) => {
  return (
    <BlockItemCard>
      <SchemaToolbar settings={blockDeleteSettings} draggable={false} />
      <ErrorFallback {...props} />
    </BlockItemCard>
  );
};

export const BlockItemError: FC = ({ children }) => {
  const handleErrors = (error) => {
    console.error(error);
  };
  return (
    <ErrorBoundary FallbackComponent={FallbackComponent} onError={handleErrors}>
      {children}
    </ErrorBoundary>
  );
};
