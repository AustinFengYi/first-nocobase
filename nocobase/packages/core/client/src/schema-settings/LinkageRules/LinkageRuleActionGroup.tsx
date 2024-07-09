/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { ArrayField as ArrayFieldModel, VoidField } from '@formily/core';
import { ArrayField, ObjectField, observer, useField } from '@formily/react';
import { Space } from 'antd';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { withDynamicSchemaProps } from '../../hoc/withDynamicSchemaProps';
import { useProps } from '../../schema-component/hooks/useProps';
import { FormButtonLinkageRuleAction, FormFieldLinkageRuleAction } from './LinkageRuleAction';
import { RemoveActionContext } from './context';
export const LinkageRuleActions = observer(
  (props: any): any => {
    const { type, linkageOptions } = props;
    const field = useField<ArrayFieldModel>();
    return field?.value?.map((item, index) => {
      return (
        <RemoveActionContext.Provider key={index} value={() => field.remove(index)}>
          <ObjectField
            name={index}
            component={[
              type === 'button' ? FormButtonLinkageRuleAction : FormFieldLinkageRuleAction,
              { ...props, options: linkageOptions },
            ]}
          />
        </RemoveActionContext.Provider>
      );
    });
  },
  { displayName: 'LinkageRuleActions' },
);

interface LinkageRuleActionGroupProps {
  type: 'button' | 'field';
  linkageOptions: any;
  collectionName: string;
}

export const LinkageRuleActionGroup = withDynamicSchemaProps(
  (props: LinkageRuleActionGroupProps) => {
    const { t } = useTranslation();
    const field = useField<VoidField>();
    const logic = 'actions';

    // 新版 UISchema（1.0 之后）中已经废弃了 useProps，这里之所以继续保留是为了兼容旧版的 UISchema
    const { type, linkageOptions, collectionName } = useProps(props);

    const style = useMemo(() => ({ marginLeft: 10 }), []);
    const components = useMemo(
      () => [LinkageRuleActions, { type, linkageOptions, collectionName }],
      [collectionName, linkageOptions, type],
    );
    const spaceStyle = useMemo(() => ({ marginTop: 8, marginBottom: 8 }), []);
    const onClick = useCallback(() => {
      const f = field.query('.actions').take() as ArrayFieldModel;
      const items = f.value || [];
      items.push({});
      f.value = items;
    }, [field]);

    return (
      <div style={style}>
        <ArrayField name={logic} component={components} disabled={false} />
        <Space size={16} style={spaceStyle}>
          <a onClick={onClick}>{t('Add property')}</a>
        </Space>
      </div>
    );
  },
  { displayName: 'LinkageRuleActionGroup' },
);
