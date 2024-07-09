/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Migration } from '@nocobase/server';

export default class extends Migration {
  appVersion = '<0.14.0-alpha.8';
  async up() {
    const match = await this.app.version.satisfies('<0.14.0-alpha.8');
    if (!match) {
      return;
    }
    const { db } = this.context;
    const WorkflowRepo = db.getRepository('workflows');
    await db.sequelize.transaction(async (transaction) => {
      const workflows = await WorkflowRepo.find({
        transaction,
      });

      await workflows.reduce(
        (promise, workflow) =>
          promise.then(() => {
            if (!workflow.useTransaction) {
              return;
            }
            workflow.set('options', {
              useTransaction: workflow.get('useTransaction'),
            });
            workflow.changed('options', true);
            return workflow.save({
              silent: true,
              transaction,
            });
          }),
        Promise.resolve(),
      );
    });
  }
}
