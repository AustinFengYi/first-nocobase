/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/* istanbul ignore file -- @preserve */

import { Migration } from '@nocobase/server';
import { afterCreateForForeignKeyField } from '../hooks/afterCreateForForeignKeyField';

export default class DropForeignKeysMigration extends Migration {
  appVersion = '<0.8.0-alpha.9';

  async up() {
    const result = await this.app.version.satisfies('<0.8.0');

    if (!result) {
      return;
    }

    const transaction = await this.app.db.sequelize.transaction();
    const callback = afterCreateForForeignKeyField(this.app.db);

    try {
      const fields = await this.app.db.getCollection('fields').repository.find({
        filter: {
          interface: {
            $in: ['oho', 'o2m', 'obo', 'm2o', 'linkTo', 'm2m'],
          },
          collectionName: {
            $not: null,
          },
        },
      });

      for (const field of fields) {
        try {
          await callback(field, {
            transaction,
            context: {},
          });
        } catch (error) {
          if (error.message.includes('collection not found')) {
            continue;
          }

          throw error;
        }
      }

      await transaction.commit();
    } catch (error) {
      console.log(error);
      await transaction.rollback();
    }
  }
}
