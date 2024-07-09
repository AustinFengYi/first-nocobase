/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import Database from '@nocobase/database';

export function beforeCreateForChildrenCollection(db: Database) {
  return async (model, { transaction, context }) => {
    const Collection = db.getCollection('collections');
    const Field = db.getCollection('fields');

    const parentKey = model.get('parentKey');
    if (!parentKey) {
      return;
    }
    const parent = await Field.model.findByPk(parentKey, { transaction });
    const parentTarget = parent.get('target');
    model.set('collectionName', parentTarget);
    const collection = await Collection.model.findOne({
      transaction,
      where: {
        name: parentTarget,
      },
    });
    if (!collection) {
      await Collection.repository.create({
        values: {
          name: parentTarget,
          createdBy: true,
          updatedBy: true,
          sortable: true,
          inherit: true,
        },
        transaction,
        context,
      });
    }
  };
}
