/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { genStyleHook } from '../__builtins__';

const useStyles = genStyleHook('nb-grid-card', (token) => {
  const { componentCls } = token;
  return {
    [componentCls]: {
      '& > .nb-block-item': {
        marginBottom: token.marginLG,
        '& > .nb-action-bar:has(:first-child:not(:empty))': {
          padding: token.marginLG,
          background: token.colorBgContainer,
        },
        '.ant-list-pagination': { padding: token.marginLG, background: token.colorBgContainer },
      },
      '.ant-formily-item-feedback-layout-loose': { marginBottom: token.marginSM },
    },
  };
});

export default useStyles;
