/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Field } from '@formily/core';
import { observer, useField } from '@formily/react';
import { isArr, isValid } from '@formily/shared';
import { TableProps } from 'antd';
import React from 'react';
import { TableVoid } from './Table.Void';

type Props = TableProps<any> & { value?: any; onChange?: any; objectValue?: boolean };

const toArr = (value: any) => (isArr(value) ? value : isValid(value) ? [value] : []);

export const TableRowSelection = observer(
  (props: Props) => {
    const { rowKey = 'id', objectValue } = props;
    const field = useField<Field>();
    const rowSelection: any = {
      type: 'checkbox',
      ...props.rowSelection,
      selectedRowKeys: toArr(field.value).map((val) => (typeof val === 'object' ? val[rowKey as any] : val)),
      onChange(selectedRowKeys: any[], selectedRows?: any) {
        if (rowSelection.type === 'checkbox') {
          props.onChange(objectValue ? selectedRows : selectedRowKeys);
        } else {
          props.onChange([...(objectValue ? selectedRows : selectedRowKeys)].shift());
        }
      },
    };
    return <TableVoid {...props} rowSelection={rowSelection} />;
  },
  { displayName: 'TableRowSelection' },
);
