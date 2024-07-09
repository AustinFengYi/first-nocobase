/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { expect, formBlockDefaultValueTemplate, test } from '@nocobase/test/e2e';

test.describe('variables with default value', () => {
  test('current form', async ({ page, mockPage, mockRecord }) => {
    const nocoPage = await mockPage(formBlockDefaultValueTemplate).waitForInit();
    await mockRecord('general', 2);
    await nocoPage.goto();

    await page.getByRole('button', { name: 'Add new' }).click();
    await page
      .getByLabel('block-item-CollectionField-general-form-general.m2oField0-m2oField0')
      .getByTestId('select-object-single')
      .click();
    await page.getByRole('option', { name: '1', exact: true }).click();

    await expect(
      page
        .getByLabel('block-item-CollectionField-general-form-general.singleLineText-singleLineText')
        .getByRole('textbox'),
    ).toHaveValue('1');

    // https://nocobase.height.app/T-2805 ----------------------------------------------------------------------
    await page
      .getByLabel('block-item-CollectionField-general-form-general.m2oField0-m2oField0')
      .getByTestId('select-object-single')
      .hover();
    await page.getByLabel('icon-close-select').click();
    // 等待值消失
    await page.waitForTimeout(500);
    await expect(
      page
        .getByLabel('block-item-CollectionField-general-form-general.singleLineText-singleLineText')
        .getByRole('textbox'),
    ).toHaveValue('');

    await page
      .getByLabel('block-item-CollectionField-general-form-general.m2oField0-m2oField0')
      .getByTestId('select-object-single')
      .click();
    await page.getByRole('option', { name: '1', exact: true }).click();

    await expect(
      page
        .getByLabel('block-item-CollectionField-general-form-general.singleLineText-singleLineText')
        .getByRole('textbox'),
    ).toHaveValue('1');
  });
});
