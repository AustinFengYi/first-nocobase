/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/client';
import { Formula } from './components';
import { renderExpressionDescription } from './scopes';
import { FormulaFieldInterface } from './interfaces/formula';
import { FormulaComponentFieldSettings } from './FormulaComponentFieldSettings';

export class PluginFieldFormulaClient extends Plugin {
  async load() {
    this.app.addComponents({
      Formula,
    });
    this.app.addScopes({
      renderExpressionDescription,
    });
    this.app.dataSourceManager.addFieldInterfaces([FormulaFieldInterface]);
    this.app.schemaSettingsManager.add(FormulaComponentFieldSettings);
  }
}

export default PluginFieldFormulaClient;
