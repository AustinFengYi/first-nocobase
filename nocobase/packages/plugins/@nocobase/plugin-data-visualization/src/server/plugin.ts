/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Cache } from '@nocobase/cache';
import { InstallOptions, Plugin } from '@nocobase/server';
import { query } from './actions/query';
import { resolve } from 'path';

export class PluginDataVisualizationServer extends Plugin {
  cache: Cache;

  afterAdd() {}

  beforeLoad() {
    this.app.resource({
      name: 'charts',
      actions: {
        query,
      },
    });
    this.app.acl.allow('charts', 'query', 'loggedIn');
  }

  async load() {
    this.cache = await this.app.cacheManager.createCache({
      name: 'data-visualization',
      store: 'memory',
      ttl: 30 * 1000, // millseconds
      max: 1000,
    });
  }

  async install(options?: InstallOptions) {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default PluginDataVisualizationServer;
