/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { TableOutlined } from '@ant-design/icons';
import React from 'react';

import { useSchemaInitializer, useSchemaInitializerItem } from '../../../../application';
import { createCollapseBlockSchema } from './createFilterCollapseBlockSchema';
import { DataBlockInitializer } from '../../../../schema-initializer/items/DataBlockInitializer';
import { Collection, CollectionFieldOptions } from '../../../../data-source';

export const FilterCollapseBlockInitializer = ({
  filterCollections,
  onlyCurrentDataSource,
  hideChildrenIfSingleCollection,
}: {
  filterCollections: (options: { collection?: Collection; associationField?: CollectionFieldOptions }) => boolean;
  onlyCurrentDataSource: boolean;
  hideChildrenIfSingleCollection?: boolean;
}) => {
  const itemConfig = useSchemaInitializerItem();
  const { insert } = useSchemaInitializer();

  return (
    <DataBlockInitializer
      {...itemConfig}
      onlyCurrentDataSource={onlyCurrentDataSource}
      icon={<TableOutlined />}
      componentType={'FilterCollapse'}
      onCreateBlockSchema={async ({ item }) => {
        const schema = createCollapseBlockSchema({
          dataSource: item.dataSource,
          collectionName: item.collectionName || item.name,
          // 与数据区块做区分
          blockType: 'filter',
        });
        insert(schema);
      }}
      filter={filterCollections}
      hideChildrenIfSingleCollection={hideChildrenIfSingleCollection}
    />
  );
};
