/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

export interface RegistryOptions {
  override: boolean;
}

export class Registry<T> {
  private map = new Map<string, T>();
  options: RegistryOptions;

  constructor(options: RegistryOptions = { override: false }) {
    this.options = options;
  }

  public register(key: string, value: T): void {
    if (!this.options.override && this.map.has(key)) {
      throw new Error(`this registry does not allow to override existing keys: "${key}"`);
    }

    this.map.set(key, value);
  }

  // async import({ directory, extensions = ['.js', '.ts', '.json'] }) {
  //   const files = await fs.readdir(directory);
  //   return files.filter(file => extensions.includes(path.extname(file)))
  // }

  public get(key: string): T {
    return this.map.get(key);
  }

  public getKeys(): Iterable<string> {
    return this.map.keys();
  }

  public getValues(): Iterable<T> {
    return this.map.values();
  }

  public getEntities(): Iterable<[string, T]> {
    return this.map.entries();
  }
}

export default Registry;
