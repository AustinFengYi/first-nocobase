/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { theme } from 'antd';
import { useFieldSchema } from '@formily/react';
import { useDataBlockHeight } from '../../hooks/useBlockSize';
import { useDesignable } from '../../';
import { useDataBlockRequest } from '../../../data-source';
import { useFormDataTemplates } from './Templates';
import { useBlockHeightProps } from '../../../block-provider/hooks/useBlockHeightProps';

export const useFormBlockHeight = () => {
  const height = useDataBlockHeight();
  const schema = useFieldSchema();
  const { token } = theme.useToken();
  const { designable } = useDesignable();
  const { heightProps } = useBlockHeightProps() || {};
  const { title } = heightProps || {};
  const { display, enabled } = useFormDataTemplates();
  const actionSchema: any = schema.reduceProperties((buf, s) => {
    if (s['x-component'] === 'ActionBar') {
      return s;
    }
    return buf;
  });

  const hasFormActions = Object.keys(actionSchema?.properties || {}).length > 0;
  const isFormBlock = schema?.parent?.['x-decorator']?.includes?.('FormBlockProvider');
  const actionBarHeight =
    hasFormActions || designable ? token.controlHeight + (isFormBlock ? 1 : 2) * token.marginLG : token.marginLG;
  const blockTitleHeaderHeight = title ? token.fontSizeLG * token.lineHeightLG + token.padding * 2 - 1 : 0;
  const { data } = useDataBlockRequest() || {};
  const { count, pageSize } = (data as any)?.meta || ({} as any);
  const hasPagination = count > pageSize;
  const paginationHeight = hasPagination ? token.controlHeightSM + 1 * token.paddingLG : 0;
  const dataTemplateHeight = display && enabled ? token.controlHeight + 2 * token.padding + token.margin : 0;
  return height - actionBarHeight - token.paddingLG - blockTitleHeaderHeight - paginationHeight - dataTemplateHeight;
};
