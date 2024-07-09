/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Field } from '@formily/core';
import { observer, useField, useForm } from '@formily/react';
import React from 'react';
import { SchemaComponentOptions } from '../../';
import { useAssociationCreateActionProps as useCAP } from '../../../block-provider/hooks';
import { useCollection_deprecated } from '../../../collection-manager';
import { AssociationFieldProvider } from './AssociationFieldProvider';
import { AssociationSelect } from './AssociationSelect';
import { InternalFileManager } from './FileManager';
import { InternalCascadeSelect } from './InternalCascadeSelect';
import { InternalNester } from './InternalNester';
import { InternalPicker } from './InternalPicker';
import { InternalPopoverNester } from './InternalPopoverNester';
import { InternalSubTable } from './InternalSubTable';
import { CreateRecordAction } from './components/CreateRecordAction';
import { useAssociationFieldContext } from './hooks';

const EditableAssociationField = observer(
  (props: any) => {
    const { multiple } = props;
    const field: Field = useField();
    const form = useForm();
    const { options: collectionField, currentMode } = useAssociationFieldContext();

    const useCreateActionProps = () => {
      const { onClick } = useCAP();
      const actionField: any = useField();
      const { getPrimaryKey } = useCollection_deprecated();
      const primaryKey = getPrimaryKey();
      return {
        async onClick() {
          await onClick();
          const { data } = actionField.data?.data?.data || {};
          if (data) {
            if (['m2m', 'o2m'].includes(collectionField?.interface) && multiple !== false) {
              const values = form.getValuesIn(field.path) || [];
              if (!values.find((v) => v[primaryKey] === data[primaryKey])) {
                values.push(data);
                form.setValuesIn(field.path, values);
                field.onInput(values);
              }
            } else {
              form.setValuesIn(field.path, data);
              field.onInput(data);
            }
          }
        },
      };
    };

    return (
      <SchemaComponentOptions scope={{ useCreateActionProps }} components={{ CreateRecordAction }}>
        {currentMode === 'Picker' && <InternalPicker {...props} />}
        {currentMode === 'Nester' && <InternalNester {...props} />}
        {currentMode === 'PopoverNester' && <InternalPopoverNester {...props} />}
        {currentMode === 'Select' && <AssociationSelect {...props} />}
        {currentMode === 'SubTable' && <InternalSubTable {...props} />}
        {currentMode === 'FileManager' && <InternalFileManager {...props} />}
        {currentMode === 'CascadeSelect' && <InternalCascadeSelect {...props} />}
      </SchemaComponentOptions>
    );
  },
  { displayName: 'EditableAssociationField' },
);

export const Editable = observer(
  (props) => {
    return (
      <AssociationFieldProvider>
        <EditableAssociationField {...props} />
      </AssociationFieldProvider>
    );
  },
  { displayName: 'Editable' },
);
