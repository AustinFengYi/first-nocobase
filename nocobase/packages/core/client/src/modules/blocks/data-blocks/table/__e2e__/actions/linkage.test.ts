/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { expect, test } from '@nocobase/test/e2e';
import { T4334 } from '../templatesOfBug';

// fix https://nocobase.height.app/T-2187
test('action linkage by row data', async ({ page, mockPage }) => {
  await mockPage(T4334).goto();
  const adminEditAction = await page.getByLabel('action-Action.Link-Edit-update-roles-table-admin');
  const adminEditActionStyle = await adminEditAction.evaluate((element) => {
    const computedStyle = window.getComputedStyle(element);
    return {
      opacity: computedStyle.opacity,
    };
  });
  const rootEditAction = await page.getByLabel('action-Action.Link-Edit-update-roles-table-root');
  const rootEditActionStyle = await rootEditAction.evaluate((element) => {
    const computedStyle = window.getComputedStyle(element);
    return {
      opacity: computedStyle.opacity,
      // 添加其他你需要的样式属性
    };
  });

  await expect(adminEditActionStyle.opacity).not.toBe('0.1');
  await expect(rootEditActionStyle.opacity).not.toBe('1');
});
