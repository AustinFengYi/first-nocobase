/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Migration } from '@nocobase/server';

export default class AddUsersPhoneMigration extends Migration {
  appVersion = '<0.7.5-alpha.1';

  async up() {
    const Field = this.context.db.getRepository('fields');
    const existed = await Field.count({
      filter: {
        name: 'phone',
        collectionName: 'users',
      },
    });
    if (!existed) {
      await Field.create({
        values: {
          name: 'phone',
          collectionName: 'users',
          type: 'string',
          unique: true,
          interface: 'phone',
          uiSchema: {
            type: 'string',
            title: '{{t("Phone")}}',
            'x-component': 'Input',
            'x-validator': 'phone',
            require: true,
          },
        },
      });
    }
  }

  async down() {}
}
