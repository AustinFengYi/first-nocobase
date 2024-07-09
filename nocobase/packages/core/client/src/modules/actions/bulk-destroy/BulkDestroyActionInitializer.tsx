/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import { useCollection_deprecated } from '../../../collection-manager';
import { ActionInitializer } from '../../../schema-initializer/items/ActionInitializer';

export const BulkDestroyActionInitializer = (props) => {
  const collection = useCollection_deprecated();
  const schema = {
    title: '{{ t("Delete") }}',
    'x-action': 'destroy',
    'x-component': 'Action',
    'x-use-component-props': 'useBulkDestroyActionProps',
    'x-component-props': {
      icon: 'DeleteOutlined',
      confirm: {
        title: "{{t('Delete record')}}",
        content: "{{t('Are you sure you want to delete it?')}}",
      },
    },
    'x-toolbar': 'ActionSchemaToolbar',
    'x-settings': 'actionSettings:bulkDelete',
    'x-decorator': 'ACLActionProvider',
    'x-acl-action-props': {
      skipScopeCheck: true,
    },
    'x-action-settings': {
      triggerWorkflows: [],
    },
  };
  if (collection) {
    schema['x-acl-action'] = `${collection.name}:destroy`;
  }
  return <ActionInitializer {...props} schema={schema} />;
};
