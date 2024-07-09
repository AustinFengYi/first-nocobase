/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { CollectionOptions } from '@nocobase/database';

export default {
  dumpRules: 'required',
  name: 'uiSchemas',
  autoGenId: false,
  timestamps: false,
  repository: 'UiSchemaRepository',
  model: 'UiSchemaModel',
  magicAttribute: 'schema',
  fields: [
    {
      type: 'uid',
      name: 'x-uid',
      primaryKey: true,
    },
    {
      type: 'string',
      name: 'name',
    },
    {
      type: 'hasMany',
      name: 'serverHooks',
      target: 'uiSchemaServerHooks',
      foreignKey: 'uid',
    },
    {
      type: 'json',
      name: 'schema',
      defaultValue: {},
    },
  ],
} as CollectionOptions;
