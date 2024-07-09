/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { css, cx } from '@emotion/css';
import { IFormItemProps, FormItem as Item } from '@formily/antd-v5';
import { Field } from '@formily/core';
import { observer, useField, useFieldSchema } from '@formily/react';
import React, { useEffect, useMemo } from 'react';
import { ACLCollectionFieldProvider } from '../../../acl/ACLProvider';
import { useApp } from '../../../application';
import { useFormActiveFields } from '../../../block-provider/hooks/useFormActiveFields';
import { Collection_deprecated } from '../../../collection-manager';
import { CollectionFieldProvider } from '../../../data-source/collection-field/CollectionFieldProvider';
import { withDynamicSchemaProps } from '../../../hoc/withDynamicSchemaProps';
import { GeneralSchemaDesigner } from '../../../schema-settings';
import { useVariables } from '../../../variables';
import useContextVariable from '../../../variables/hooks/useContextVariable';
import { BlockItem } from '../block-item';
import { HTMLEncode } from '../input/shared';
import { FilterFormDesigner } from './FormItem.FilterFormDesigner';
import { useEnsureOperatorsValid } from './SchemaSettingOptions';
import useLazyLoadDisplayAssociationFieldsOfForm from './hooks/useLazyLoadDisplayAssociationFieldsOfForm';
import useParseDefaultValue from './hooks/useParseDefaultValue';

Item.displayName = 'FormilyFormItem';

const formItemWrapCss = css`
  & .ant-space {
    flex-wrap: wrap;
  }
`;

const formItemLabelCss = css`
  > .ant-formily-item-label {
    display: none;
  }
`;

export const FormItem: any = withDynamicSchemaProps(
  observer((props: IFormItemProps) => {
    useEnsureOperatorsValid();
    const field = useField<Field>();
    const schema = useFieldSchema();
    const contextVariable = useContextVariable();
    const variables = useVariables();
    const { addActiveFieldName } = useFormActiveFields() || {};

    useEffect(() => {
      variables?.registerVariable(contextVariable);
    }, [contextVariable]);

    // 需要放在注冊完变量之后
    useParseDefaultValue();
    useLazyLoadDisplayAssociationFieldsOfForm();

    useEffect(() => {
      addActiveFieldName?.(schema.name as string);
    }, [addActiveFieldName, schema.name]);

    const showTitle = schema['x-decorator-props']?.showTitle ?? true;
    const extra = useMemo(() => {
      if (field.description && field.description !== '') {
        return typeof field.description === 'string' ? (
          <div
            dangerouslySetInnerHTML={{
              __html: HTMLEncode(field.description).split('\n').join('<br/>'),
            }}
          />
        ) : (
          field.description
        );
      }
    }, [field.description]);
    const className = useMemo(() => {
      return cx(formItemWrapCss, {
        [formItemLabelCss]: showTitle === false,
      });
    }, [showTitle]);

    return (
      <CollectionFieldProvider allowNull={true}>
        <BlockItem className={'nb-form-item'}>
          <ACLCollectionFieldProvider>
            <Item className={className} {...props} extra={extra} />
          </ACLCollectionFieldProvider>
        </BlockItem>
      </CollectionFieldProvider>
    );
  }),
  { displayName: 'FormItem' },
);

FormItem.Designer = function Designer() {
  const app = useApp();
  const fieldSchema = useFieldSchema();
  const settingsName = `FormItemSettings:${fieldSchema['x-interface']}`;
  const defaultActionSettings = 'FormItemSettings';
  const hasFieldItem = app.schemaSettingsManager.has(settingsName);
  return (
    <GeneralSchemaDesigner schemaSettings={hasFieldItem ? settingsName : defaultActionSettings}></GeneralSchemaDesigner>
  );
};

export function isFileCollection(collection: Collection_deprecated) {
  return collection?.template === 'file';
}

FormItem.FilterFormDesigner = FilterFormDesigner;
