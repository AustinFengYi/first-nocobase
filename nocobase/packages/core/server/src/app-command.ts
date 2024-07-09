/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Command } from 'commander';

export class AppCommand extends Command {
  private _handleByIPCServer = false;
  public _preload = false;

  ipc() {
    this._handleByIPCServer = true;
    return this;
  }

  auth() {
    this['_authenticate'] = true;
    return this;
  }

  preload() {
    this['_authenticate'] = true;
    this._preload = true;
    return this;
  }

  hasCommand(name: string) {
    const names = this.commands.map((c) => c.name());
    return names.includes(name);
  }

  isHandleByIPCServer() {
    return this._handleByIPCServer;
  }

  createCommand(name?: string): AppCommand {
    return new AppCommand(name);
  }

  parseHandleByIPCServer(argv, parseOptions?): Boolean {
    //@ts-ignore
    const userArgs = this._prepareUserArgs(argv, parseOptions);

    if (userArgs[0] === 'nocobase') {
      userArgs.shift();
    }

    let lastCommand = this;

    for (const arg of userArgs) {
      // @ts-ignore
      const subCommand = lastCommand._findCommand(arg);
      if (subCommand) {
        lastCommand = subCommand;
      } else {
        break;
      }
    }

    return lastCommand && lastCommand.isHandleByIPCServer();
  }
}
