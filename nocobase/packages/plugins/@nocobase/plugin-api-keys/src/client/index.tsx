/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/client';
import { NAMESPACE } from '../constants';
import { Configuration } from './Configuration';

export class PluginAPIKeysClient extends Plugin {
  async load() {
    this.pluginSettingsManager.add(NAMESPACE, {
      icon: 'KeyOutlined',
      title: this.t('API keys'),
      Component: Configuration,
      aclSnippet: 'pm.api-keys.configuration',
    });
  }
}

export default PluginAPIKeysClient;
