/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/* istanbul ignore file -- @preserve */

import { Migration } from '../migration';
import { PluginManager } from '../plugin-manager';

export default class extends Migration {
  on = 'afterSync'; // 'beforeLoad' or 'afterLoad'
  appVersion = '<0.14.0-alpha.2';

  async up() {
    const plugins = await this.pm.repository.find();
    for (const plugin of plugins) {
      const { name } = plugin;
      if (plugin.packageName) {
        continue;
      }
      try {
        const packageName = await PluginManager.getPackageName(name);
        await this.pm.repository.update({
          filter: {
            name,
          },
          values: {
            packageName,
          },
        });
        this.app.log.info(`update ${packageName}`);
      } catch (error) {
        this.app.log.warn(error.message);
      }
    }
  }
}
