/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { ISchema, Schema } from '@formily/react';
import { uid } from '@formily/shared';
export const gridItemWrap = (schema: ISchema) => {
  return {
    type: 'void',
    'x-component': 'MGrid.Item',
    properties: {
      [schema.name || uid()]: schema,
    },
  };
};

export const findSchema = (schema: Schema, component: string) => {
  const gridSchema = schema.reduceProperties(
    (schema, next) => schema || (next['x-component'] === component && next),
  ) as Schema;
  return gridSchema;
};
export const findGridSchema = (schema: Schema) => {
  return findSchema(schema, 'Grid');
};

const allowComponents = ['Grid', 'Grid.Row'];
const plusComponent = ['Grid.Col'];
export const countGridCol = (schema: Schema, countToStop?: number) => {
  if (!schema) return 0;
  let count = 0;
  if (plusComponent.includes(schema['x-component'])) {
    count += 1;
  }
  if (typeof countToStop === 'number' && count >= countToStop) return count;
  if (allowComponents.includes(schema['x-component'])) {
    schema.mapProperties((schema) => {
      count += countGridCol(schema, countToStop);
    });
  }
  return count;
};
