/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { CollectionOptions, ICollection, ICollectionManager, IField, IRepository } from './types';
import { default as lodash } from 'lodash';
import merge from 'deepmerge';
import { CollectionField } from './collection-field';

export class Collection implements ICollection {
  repository: IRepository;
  fields: Map<string, IField> = new Map<string, IField>();

  constructor(
    protected options: CollectionOptions,
    protected collectionManager: ICollectionManager,
  ) {
    this.setRepository(options.repository);
    if (options.fields) {
      this.setFields(options.fields);
    }
  }

  updateOptions(options: CollectionOptions, mergeOptions?: any) {
    let newOptions = lodash.cloneDeep(options);
    newOptions = merge(this.options, newOptions, mergeOptions);
    this.options = newOptions;

    this.setFields(newOptions.fields || []);
    if (options.repository) {
      this.setRepository(options.repository);
    }

    return this;
  }

  setFields(fields: any[]) {
    for (const field of fields) {
      this.setField(field.name, field);
    }
  }

  setField(name: string, options: any) {
    const field = new CollectionField(options);
    this.fields.set(name, field);
    return field;
  }

  removeField(name: string) {
    this.fields.delete(name);
  }

  getField(name: string) {
    return this.fields.get(name);
  }

  getFields() {
    return [...this.fields.values()];
  }

  protected setRepository(repository: any) {
    this.repository = this.collectionManager.getRegisteredRepository(repository || 'Repository');
  }
}
