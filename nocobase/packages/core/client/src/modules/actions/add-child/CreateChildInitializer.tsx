/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import { ActionInitializerItem } from '../../../schema-initializer/items/ActionInitializerItem';
export const CreateChildInitializer = (props) => {
  const schema = {
    type: 'void',
    title: '{{ t("Add child") }}',
    'x-action': 'create',
    'x-toolbar': 'ActionSchemaToolbar',
    'x-settings': 'actionSettings:addChild',
    'x-component': 'Action',
    'x-visible': '{{treeTable}}',
    'x-component-props': {
      openMode: 'drawer',
      type: 'link',
      addChild: true,
      style: { height: 'auto', lineHeight: 'normal' },
      component: 'CreateRecordAction',
    },
    properties: {
      drawer: {
        type: 'void',
        title: '{{ t("Add record") }}',
        'x-component': 'Action.Container',
        'x-component-props': {
          className: 'nb-action-popup',
        },
        properties: {
          tabs: {
            type: 'void',
            'x-component': 'Tabs',
            'x-component-props': {},
            'x-initializer': 'popup:addTab',
            'x-initializer-props': {
              gridInitializer: 'popup:addNew:addBlock',
            },
            properties: {
              tab1: {
                type: 'void',
                title: '{{t("Add new")}}',
                'x-component': 'Tabs.TabPane',
                'x-designer': 'Tabs.Designer',
                'x-component-props': {},
                properties: {
                  grid: {
                    type: 'void',
                    'x-component': 'Grid',
                    'x-initializer': 'popup:addNew:addBlock',
                    properties: {},
                  },
                },
              },
            },
          },
        },
      },
    },
  };
  return <ActionInitializerItem {...props} schema={schema} />;
};
