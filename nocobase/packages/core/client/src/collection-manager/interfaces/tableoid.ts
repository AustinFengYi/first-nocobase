/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { CollectionFieldInterface } from '../../data-source/collection-field-interface/CollectionFieldInterface';
import { operators } from './properties';

export class TableoidFieldInterface extends CollectionFieldInterface {
  name = 'tableoid';
  type = 'object';
  group = 'systemInfo';
  order = 0;
  title = '{{t("Table OID")}}';
  sortable = true;
  default = {
    name: '__collection',
    type: 'virtual',
    uiSchema: {
      type: 'string',
      title: '{{t("Table OID")}}',
      'x-component': 'CollectionSelect',
      'x-component-props': {
        isTableOid: true,
      },
      'x-read-pretty': true,
    },
  };
  properties = {
    'uiSchema.title': {
      type: 'string',
      title: '{{t("Field display name")}}',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'Input',
    },
    name: {
      type: 'string',
      title: '{{t("Field name")}}',
      required: true,
      'x-disabled': true,
      'x-decorator': 'FormItem',
      'x-component': 'Input',
    },
  };
  filterable = {
    operators: operators.tableoid,
  };
}
