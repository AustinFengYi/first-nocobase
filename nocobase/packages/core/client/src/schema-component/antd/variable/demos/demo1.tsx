

import { FormItem } from '@formily/antd-v5';
import { SchemaComponent, SchemaComponentProvider, Variable } from '@nocobase/client';
import React from 'react';

const scope = [
  { label: 'v1', value: 'v1' },
  { label: 'nested', value: 'nested', children: [{ label: 'v2', value: 'v2' }] },
];

const schema = {
  type: 'object',
  properties: {
    input: {
      type: 'string',
      title: `替换模式`,
      'x-decorator': 'FormItem',
      'x-component': 'Variable.Input',
      'x-component-props': {
        scope,
      },
    },
  },
};

export default () => {
  return (
    <SchemaComponentProvider components={{ Variable, FormItem }}>
      <SchemaComponent schema={schema} />
    </SchemaComponentProvider>
  );
};
