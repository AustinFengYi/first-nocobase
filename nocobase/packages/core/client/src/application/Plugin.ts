/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { TFuncKey, TOptions } from 'i18next';
import type { Application } from './Application';

export class Plugin<T = any> {
  constructor(
    protected options: T,
    protected app: Application,
  ) {
    this.options = options;
    this.app = app;
  }

  get pluginManager() {
    return this.app.pluginManager;
  }

  get pm() {
    return this.app.pm;
  }

  get router() {
    return this.app.router;
  }

  get pluginSettingsManager() {
    return this.app.pluginSettingsManager;
  }

  get schemaInitializerManager() {
    return this.app.schemaInitializerManager;
  }

  get schemaSettingsManager() {
    return this.app.schemaSettingsManager;
  }

  get dataSourceManager() {
    return this.app.dataSourceManager;
  }

  async afterAdd() {}

  async beforeLoad() {}

  async load() {}

  t(text: TFuncKey | TFuncKey[], options: TOptions = {}) {
    return this.app.i18n.t(text, { ns: this.options?.['packageName'], ...(options as any) });
  }
}
