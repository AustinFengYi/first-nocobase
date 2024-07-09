/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { MockServer } from '@nocobase/test';
import { createApp } from '../index';

describe('collections repository', () => {
  let app: MockServer;
  let agent;
  let db;

  beforeEach(async () => {
    app = await createApp();
    db = app.db;

    agent = app.agent();
  });

  afterEach(async () => {
    await app.destroy();
  });

  it('should update belongs to many field sortable option', async () => {
    await agent.resource('collections').create({
      values: {
        name: 'users',
        fields: [
          {
            type: 'hasMany',
            name: 'posts',
            target: 'posts',
            foreignKey: 'userId',
          },
        ],
      },
    });

    await agent.resource('collections').create({
      values: {
        name: 'posts',
      },
    });

    const postField = await db.getRepository('fields').findOne({
      filter: {
        name: 'posts',
      },
    });

    // update has many field
    const response = await agent.resource('collections.fields', 'users').update({
      values: {
        sortable: true,
      },
      filter: {
        key: postField.get('key'),
      },
    });

    expect(response.body.data[0].sortable).toBe(true);
    expect(response.body.data[0].sortBy).toBe('userIdSort');
  });
});
