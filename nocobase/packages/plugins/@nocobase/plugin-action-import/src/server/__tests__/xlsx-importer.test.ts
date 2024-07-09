/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { createMockServer, MockServer } from '@nocobase/test';
import { TemplateCreator } from '../services/template-creator';
import { XlsxImporter } from '../services/xlsx-importer';
import XLSX from 'xlsx';
import * as process from 'node:process';

describe('xlsx importer', () => {
  let app: MockServer;
  beforeEach(async () => {
    app = await createMockServer({
      plugins: ['field-china-region', 'field-sequence'],
    });
  });

  afterEach(async () => {
    await app.destroy();
  });

  describe('import with select fields', () => {
    let User;
    beforeEach(async () => {
      User = app.db.collection({
        name: 'users',
        fields: [
          { type: 'string', name: 'name', title: '姓名' },
          {
            uiSchema: {
              enum: [
                {
                  value: '123',
                  label: 'Label123',
                  color: 'orange',
                },
                {
                  value: '223',
                  label: 'Label223',
                  color: 'lime',
                },
              ],
              type: 'array',
              'x-component': 'Select',
              'x-component-props': {
                mode: 'multiple',
              },
              title: 'multi-select',
            },
            defaultValue: [],
            name: 'multiSelect',
            type: 'array',
            interface: 'multipleSelect',
          },
          {
            uiSchema: {
              enum: [
                {
                  value: '123',
                  label: 'Label123',
                  color: 'orange',
                },
                {
                  value: '223',
                  label: 'Label223',
                  color: 'lime',
                },
              ],
              type: 'string',
              'x-component': 'Select',
              title: 'select',
            },
            name: 'select',
            type: 'string',
            interface: 'select',
          },
        ],
      });

      await app.db.sync();
    });

    it('should import select field with label and value', async () => {
      const columns = [
        {
          dataIndex: ['name'],
          defaultTitle: '姓名',
        },
        {
          dataIndex: ['multiSelect'],
          defaultTitle: '多选',
        },
        {
          dataIndex: ['select'],
          defaultTitle: '单选',
        },
      ];

      const templateCreator = new TemplateCreator({
        collection: User,
        columns,
      });

      const template = await templateCreator.run();

      const worksheet = template.Sheets[template.SheetNames[0]];

      XLSX.utils.sheet_add_aoa(worksheet, [['test', 'Label123,223', 'Label123']], {
        origin: 'A2',
      });

      const importer = new XlsxImporter({
        collectionManager: app.mainDataSource.collectionManager,
        collection: User,
        columns,
        workbook: template,
      });

      await importer.run();

      expect(await User.repository.count()).toBe(1);

      const user = await User.repository.findOne();

      expect(user.get('multiSelect')).toEqual(['123', '223']);
      expect(user.get('select')).toBe('123');
    });

    it('should validate values in multiple select field', async () => {
      const columns = [
        {
          dataIndex: ['name'],
          defaultTitle: '姓名',
        },
        {
          dataIndex: ['multiSelect'],
          defaultTitle: '多选',
        },
      ];

      const templateCreator = new TemplateCreator({
        collection: User,
        columns,
      });

      const template = await templateCreator.run();

      const worksheet = template.Sheets[template.SheetNames[0]];

      XLSX.utils.sheet_add_aoa(worksheet, [['test', 'abc']], {
        origin: 'A2',
      });

      const importer = new XlsxImporter({
        collectionManager: app.mainDataSource.collectionManager,
        collection: User,
        columns,
        workbook: template,
      });

      let error;

      try {
        await importer.run();
      } catch (e) {
        error = e;
      }

      expect(error).toBeTruthy();
    });
    it('should validate values in select field', async () => {
      const columns = [
        {
          dataIndex: ['name'],
          defaultTitle: '姓名',
        },
        {
          dataIndex: ['select'],
          defaultTitle: '单选',
        },
      ];

      const templateCreator = new TemplateCreator({
        collection: User,
        columns,
      });

      const template = await templateCreator.run();

      const worksheet = template.Sheets[template.SheetNames[0]];

      XLSX.utils.sheet_add_aoa(worksheet, [['test', 'abc']], {
        origin: 'A2',
      });

      const importer = new XlsxImporter({
        collectionManager: app.mainDataSource.collectionManager,
        collection: User,
        columns,
        workbook: template,
      });

      let error;

      try {
        await importer.run();
      } catch (e) {
        error = e;
      }

      expect(error).toBeTruthy();
    });
  });

  describe('import with associations', () => {
    let User;
    let Post;
    beforeEach(async () => {
      User = app.db.collection({
        name: 'users',
        fields: [
          {
            type: 'string',
            name: 'name',
          },
          {
            type: 'hasMany',
            name: 'posts',
            target: 'posts',
            interface: 'o2m',
            foreignKey: 'userId',
          },
        ],
      });

      Post = app.db.collection({
        name: 'posts',
        fields: [
          {
            type: 'string',
            name: 'title',
          },
          {
            type: 'belongsTo',
            name: 'user',
            target: 'users',
            interface: 'm2o',
          },
        ],
      });

      await app.db.sync();
    });

    it('should validate to many association', async () => {
      const columns = [
        {
          dataIndex: ['name'],
          defaultTitle: '名称',
        },
        {
          dataIndex: ['posts', 'title'],
          defaultTitle: '标题',
        },
      ];

      const templateCreator = new TemplateCreator({
        collection: User,
        columns,
      });

      const template = await templateCreator.run();

      const worksheet = template.Sheets[template.SheetNames[0]];

      XLSX.utils.sheet_add_aoa(worksheet, [['test', '测试标题']], {
        origin: 'A2',
      });

      const importer = new XlsxImporter({
        collectionManager: app.mainDataSource.collectionManager,
        collection: User,
        columns,
        workbook: template,
      });

      let error;

      try {
        await importer.run();
      } catch (e) {
        error = e;
      }

      expect(error).toBeTruthy();
    });

    it('should validate to one association', async () => {
      const columns = [
        {
          dataIndex: ['title'],
          defaultTitle: '标题',
        },
        {
          dataIndex: ['user', 'name'],
          defaultTitle: '用户名',
        },
      ];

      const templateCreator = new TemplateCreator({
        collection: Post,
        columns,
      });

      const template = await templateCreator.run();

      const worksheet = template.Sheets[template.SheetNames[0]];

      XLSX.utils.sheet_add_aoa(worksheet, [['test title', 'test user']], {
        origin: 'A2',
      });

      const importer = new XlsxImporter({
        collectionManager: app.mainDataSource.collectionManager,
        collection: Post,
        columns,
        workbook: template,
      });

      let error;

      try {
        await importer.run();
      } catch (e) {
        error = e;
      }

      expect(error).toBeTruthy();
    });
  });

  it('should import china region field', async () => {
    const Post = app.db.collection({
      name: 'posts',
      fields: [
        { type: 'string', name: 'title' },
        {
          type: 'belongsToMany',
          target: 'chinaRegions',
          through: 'userRegions',
          targetKey: 'code',
          interface: 'chinaRegion',
          name: 'region',
        },
      ],
    });

    await app.db.sync();

    const columns = [
      { dataIndex: ['title'], defaultTitle: 'Title' },
      {
        dataIndex: ['region'],
        defaultTitle: 'region',
      },
    ];

    const templateCreator = new TemplateCreator({
      collection: Post,
      columns,
    });

    const template = await templateCreator.run();

    const worksheet = template.Sheets[template.SheetNames[0]];

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        ['post0', '山西省/长治市/潞城区'],
        ['post1', ''],
        ['post2', null],
      ],
      {
        origin: 'A2',
      },
    );

    const importer = new XlsxImporter({
      collectionManager: app.mainDataSource.collectionManager,
      collection: Post,
      columns,
      workbook: template,
    });

    await importer.run();

    expect(await Post.repository.count()).toBe(3);

    const post = await Post.repository.findOne({
      appends: ['region'],
    });

    expect(post.get('region').map((item: any) => item.code)).toEqual(['14', '1404', '140406']);
  });

  it.skipIf(process.env['DB_DIALECT'] === 'sqlite')('should import with number field', async () => {
    const User = app.db.collection({
      name: 'users',
      autoGenId: false,
      fields: [
        {
          type: 'bigInt',
          name: 'id',
          primaryKey: true,
          autoIncrement: true,
        },
        {
          type: 'bigInt',
          interface: 'integer',
          name: 'bigInt',
        },
        {
          type: 'float',
          interface: 'percent',
          name: 'percent',
        },
        {
          type: 'float',
          interface: 'float',
          name: 'float',
        },
        {
          type: 'boolean',
          interface: 'boolean',
          name: 'boolean',
        },
      ],
    });

    await app.db.sync();

    const columns = [
      {
        dataIndex: ['id'],
        defaultTitle: 'ID',
      },
      {
        dataIndex: ['bigInt'],
        defaultTitle: 'bigInt',
      },
      {
        dataIndex: ['percent'],
        defaultTitle: '百分比',
      },
      {
        dataIndex: ['float'],
        defaultTitle: '浮点数',
      },
      {
        dataIndex: ['boolean'],
        defaultTitle: '布尔值',
      },
    ];

    const templateCreator = new TemplateCreator({
      collection: User,
      columns,
    });

    const template = await templateCreator.run();

    const worksheet = template.Sheets[template.SheetNames[0]];

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        [1, '1238217389217389217', '10%', 0.1, '是'],
        [2, 123123, '20%', 0.2, '0'],
      ],
      {
        origin: 'A2',
      },
    );

    const importer = new XlsxImporter({
      collectionManager: app.mainDataSource.collectionManager,
      collection: User,
      columns,
      workbook: template,
    });

    await importer.run();

    expect(await User.repository.count()).toBe(2);

    const user1 = await User.repository.findOne({
      filter: {
        id: 1,
      },
    });

    const user1Json = user1.toJSON();

    expect(user1Json['bigInt']).toBe('1238217389217389217');
    expect(user1Json['percent']).toBe(0.1);
    expect(user1Json['float']).toBe(0.1);
    expect(user1Json['boolean']).toBe(true);

    const user2 = await User.repository.findOne({
      filter: {
        id: 2,
      },
    });

    const user2Json = user2.toJSON();
    expect(user2Json['bigInt']).toBe(123123);
    expect(user2Json['percent']).toBe(0.2);
    expect(user2Json['float']).toBe(0.2);
    expect(user2Json['boolean']).toBe(false);
  });

  it('should not reset id seq if not import id field', async () => {
    const User = app.db.collection({
      name: 'users',
      autoGenId: false,
      fields: [
        {
          type: 'bigInt',
          name: 'id',
          primaryKey: true,
          autoIncrement: true,
        },
        {
          type: 'string',
          name: 'name',
        },
        {
          type: 'string',
          name: 'email',
        },
      ],
    });

    await app.db.sync();

    const templateCreator = new TemplateCreator({
      collection: User,
      columns: [
        {
          dataIndex: ['name'],
          defaultTitle: '姓名',
        },
        {
          dataIndex: ['email'],
          defaultTitle: '邮箱',
        },
      ],
    });

    const template = await templateCreator.run();

    const worksheet = template.Sheets[template.SheetNames[0]];

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        ['User1', 'test@test.com'],
        ['User2', 'test2@test.com'],
      ],
      {
        origin: 'A2',
      },
    );

    const importer = new XlsxImporter({
      collectionManager: app.mainDataSource.collectionManager,
      collection: User,
      columns: [
        {
          dataIndex: ['name'],
          defaultTitle: '姓名',
        },
        {
          dataIndex: ['email'],
          defaultTitle: '邮箱',
        },
      ],
      workbook: template,
    });

    const testFn = vi.fn();
    importer.on('seqReset', testFn);

    await importer.run();

    expect(await User.repository.count()).toBe(2);

    const user3 = await User.repository.create({
      values: {
        name: 'User3',
        email: 'test3@test.com',
      },
    });

    expect(user3.get('id')).toBe(3);
    expect(testFn).not.toBeCalled();
  });

  it('should reset id seq after import id field', async () => {
    const User = app.db.collection({
      name: 'users',
      autoGenId: false,
      fields: [
        {
          type: 'bigInt',
          name: 'id',
          primaryKey: true,
          autoIncrement: true,
        },
        {
          type: 'string',
          name: 'name',
        },
        {
          type: 'string',
          name: 'email',
        },
        {
          type: 'sequence',
          name: 'name',
          patterns: [
            {
              type: 'integer',
              options: { key: 1 },
            },
          ],
        },
      ],
    });

    await app.db.sync();

    const templateCreator = new TemplateCreator({
      collection: User,
      columns: [
        {
          dataIndex: ['id'],
          defaultTitle: 'ID',
        },
        {
          dataIndex: ['name'],
          defaultTitle: '姓名',
        },
        {
          dataIndex: ['email'],
          defaultTitle: '邮箱',
        },
      ],
    });

    const template = await templateCreator.run();

    const worksheet = template.Sheets[template.SheetNames[0]];

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        [1, 'User1', 'test@test.com'],
        [2, 'User2', 'test2@test.com'],
      ],
      {
        origin: 'A2',
      },
    );

    const importer = new XlsxImporter({
      collectionManager: app.mainDataSource.collectionManager,
      collection: User,
      columns: [
        {
          dataIndex: ['id'],
          defaultTitle: 'ID',
        },
        {
          dataIndex: ['name'],
          defaultTitle: '姓名',
        },
        {
          dataIndex: ['email'],
          defaultTitle: '邮箱',
        },
      ],
      workbook: template,
    });

    const testFn = vi.fn();
    importer.on('seqReset', testFn);

    await importer.run();

    expect(await User.repository.count()).toBe(2);

    const user3 = await User.repository.create({
      values: {
        name: 'User3',
        email: 'test3@test.com',
      },
    });

    expect(user3.get('id')).toBe(3);

    expect(testFn).toBeCalled();
  });

  it('should validate workbook with error', async () => {
    const User = app.db.collection({
      name: 'users',
      fields: [
        {
          type: 'string',
          name: 'name',
        },
        {
          type: 'string',
          name: 'email',
        },
      ],
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.sheet_new();

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        ['column1', 'column2'],
        ['row21', 'row22'],
      ],
      {
        origin: 'A1',
      },
    );

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');

    const importer = new XlsxImporter({
      collectionManager: app.mainDataSource.collectionManager,
      collection: User,
      columns: [
        {
          dataIndex: ['name'],
          defaultTitle: '姓名',
        },
        {
          dataIndex: ['email'],
          defaultTitle: '邮箱',
        },
      ],
      workbook,
    });

    let error;
    try {
      importer.getData();
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
  });

  it('should validate workbook true', async () => {
    const User = app.db.collection({
      name: 'users',
      fields: [
        {
          type: 'string',
          name: 'name',
        },
        {
          type: 'string',
          name: 'email',
        },
      ],
    });

    const templateCreator = new TemplateCreator({
      collection: User,
      columns: [
        {
          dataIndex: ['name'],
          defaultTitle: '姓名',
        },
        {
          dataIndex: ['email'],
          defaultTitle: '邮箱',
        },
      ],
    });

    const template = await templateCreator.run();

    const importer = new XlsxImporter({
      collectionManager: app.mainDataSource.collectionManager,
      collection: User,
      columns: [
        {
          dataIndex: ['name'],
          defaultTitle: '姓名',
        },
        {
          dataIndex: ['email'],
          defaultTitle: '邮箱',
        },
      ],
      workbook: template,
    });

    let error;
    try {
      importer.getData();
    } catch (e) {
      error = e;
    }

    expect(error).toBeFalsy();
  });

  it('should import with associations', async () => {
    const User = app.db.collection({
      name: 'users',
      fields: [
        {
          type: 'string',
          name: 'name',
        },
        {
          type: 'string',
          name: 'email',
        },
      ],
    });

    const Tag = app.db.collection({
      name: 'tags',
      fields: [
        {
          type: 'string',
          name: 'name',
        },
      ],
    });

    const Comments = app.db.collection({
      name: 'comments',
      fields: [
        {
          type: 'string',
          name: 'content',
        },
      ],
    });

    const Post = app.db.collection({
      name: 'posts',
      fields: [
        {
          type: 'string',
          name: 'title',
        },
        {
          type: 'string',
          name: 'content',
        },
        {
          type: 'belongsTo',
          name: 'user',
          interface: 'm2o',
        },
        {
          type: 'belongsToMany',
          name: 'tags',
          through: 'postsTags',
          interface: 'm2m',
        },
        {
          type: 'hasMany',
          name: 'comments',
          interface: 'o2m',
        },
      ],
    });

    await app.db.sync();

    await User.repository.create({
      values: {
        name: 'User1',
        email: 'u1@test.com',
      },
    });

    await Tag.repository.create({
      values: [
        {
          name: 'Tag1',
        },
        {
          name: 'Tag2',
        },
        {
          name: 'Tag3',
        },
      ],
    });

    await Comments.repository.create({
      values: [
        {
          content: 'Comment1',
        },
        {
          content: 'Comment2',
        },
        {
          content: 'Comment3',
        },
      ],
    });

    const importColumns = [
      {
        dataIndex: ['title'],
        defaultTitle: '标题',
      },
      {
        dataIndex: ['content'],
        defaultTitle: '内容',
      },
      {
        dataIndex: ['user', 'name'],
        defaultTitle: '作者',
      },
      {
        dataIndex: ['tags', 'name'],
        defaultTitle: '标签',
      },
      {
        dataIndex: ['comments', 'content'],
        defaultTitle: '评论',
      },
    ];

    const templateCreator = new TemplateCreator({
      collection: Post,
      columns: importColumns,
    });

    const template = await templateCreator.run();

    const worksheet = template.Sheets[template.SheetNames[0]];

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        ['Post1', 'Content1', 'User1', 'Tag1,Tag2', 'Comment1,Comment2'],
        ['Post2', 'Content2', 'User1', 'Tag2,Tag3', 'Comment3'],
        ['Post3', 'Content3', 'User1', 'Tag3', ''],
        ['Post4', '', '', ''],
        ['Post5', null, null, null],
      ],
      {
        origin: 'A2',
      },
    );

    const importer = new XlsxImporter({
      collectionManager: app.mainDataSource.collectionManager,
      collection: Post,
      columns: importColumns,
      workbook: template,
    });

    await importer.run();

    expect(await Post.repository.count()).toBe(5);
  });

  it('should import data with xlsx', async () => {
    const User = app.db.collection({
      name: 'users',
      fields: [
        {
          type: 'string',
          name: 'name',
        },
        {
          type: 'string',
          name: 'email',
        },
      ],
    });

    await app.db.sync();

    const templateCreator = new TemplateCreator({
      collection: User,
      explain: 'test',
      columns: [
        {
          dataIndex: ['name'],
          defaultTitle: '姓名',
        },
        {
          dataIndex: ['email'],
          defaultTitle: '邮箱',
        },
      ],
    });

    const template = await templateCreator.run();

    const worksheet = template.Sheets[template.SheetNames[0]];

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        ['User1', 'test@test.com'],
        ['User2', 'test2@test.com'],
      ],
      {
        origin: 'A3',
      },
    );

    const importer = new XlsxImporter({
      collectionManager: app.mainDataSource.collectionManager,
      collection: User,
      explain: 'test',
      columns: [
        {
          dataIndex: ['name'],
          defaultTitle: '姓名',
        },
        {
          dataIndex: ['email'],
          defaultTitle: '邮箱',
        },
      ],
      workbook: template,
    });

    await importer.run();

    expect(await User.repository.count()).toBe(2);
  });

  it('should throw error when import failed', async () => {
    const User = app.db.collection({
      name: 'users',
      fields: [
        {
          type: 'string',
          name: 'name',
          unique: true,
        },
        {
          type: 'string',
          name: 'email',
        },
      ],
    });

    await app.db.sync();

    const templateCreator = new TemplateCreator({
      collection: User,
      columns: [
        {
          dataIndex: ['name'],
          defaultTitle: '姓名',
        },
        {
          dataIndex: ['email'],
          defaultTitle: '邮箱',
        },
      ],
    });

    const template = await templateCreator.run();

    const worksheet = template.Sheets[template.SheetNames[0]];

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        ['User1', 'test@test.com'],
        ['User1', 'test2@test.com'],
      ],
      {
        origin: 'A2',
      },
    );

    const importer = new XlsxImporter({
      collectionManager: app.mainDataSource.collectionManager,
      collection: User,
      columns: [
        {
          dataIndex: ['name'],
          defaultTitle: '姓名',
        },
        {
          dataIndex: ['email'],
          defaultTitle: '邮箱',
        },
      ],
      workbook: template,
    });

    let error;
    try {
      await importer.run();
    } catch (e) {
      error = e;
    }

    expect(await User.repository.count()).toBe(0);
    expect(error).toBeTruthy();
  });
});
