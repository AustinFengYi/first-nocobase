/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

const { resolve } = require('path');
const { Command } = require('commander');
const { readFileSync, writeFileSync } = require('fs');

/**
 *
 * @param {Command} cli
 */
module.exports = (cli) => {
  cli.command('create-nginx-conf').action(async (name, options) => {
    const file = resolve(__dirname, '../../nocobase.conf.tpl');
    const data = readFileSync(file, 'utf-8');
    const replaced = data
      .replace(/\{\{cwd\}\}/g, '/app/nocobase')
      .replace(/\{\{publicPath\}\}/g, process.env.APP_PUBLIC_PATH)
      .replace(/\{\{apiPort\}\}/g, process.env.APP_PORT);

    const targetFile = resolve(process.cwd(), 'storage', 'nocobase.conf');
    writeFileSync(targetFile, replaced);
  });
};
