/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

export * from './application';
export { Application as default } from './application';
export * as middlewares from './middlewares';
export * from './migration';
export * from './plugin';
export * from './plugin-manager';
export * from './gateway';
export * from './app-supervisor';
export const OFFICIAL_PLUGIN_PREFIX = '@nocobase/plugin-';
