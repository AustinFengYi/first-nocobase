/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Schema } from '@formily/react';
import { splitWrapSchema } from '../useDesignable';

describe('splitWrapSchema', () => {
  test('case 1', () => {
    const wrap = new Schema({
      'x-uid': 'aaa',
      properties: {
        aa: {
          'x-uid': 'aa',
          properties: {
            a: {
              'x-uid': '123',
              properties: {
                bbb: {
                  'x-uid': 'bbb',
                },
              },
            },
          },
        },
      },
    });
    const [schema1, schema2] = splitWrapSchema(wrap, { ['x-uid']: 'aaa' });
    expect(schema1).toBeNull();
    expect(schema2).toMatchObject({
      'x-uid': 'aaa',
      properties: {
        aa: {
          'x-uid': 'aa',
          properties: {
            a: {
              'x-uid': '123',
              properties: {
                bbb: {
                  'x-uid': 'bbb',
                },
              },
            },
          },
        },
      },
    });
  });

  test('case 2', () => {
    const wrap = new Schema({
      'x-uid': 'aaa',
      properties: {
        aa: {
          'x-uid': 'aa',
          properties: {
            a: {
              'x-uid': '123',
              properties: {
                bbb: {
                  'x-uid': 'bbb',
                },
              },
            },
          },
        },
      },
    });
    const [schema1, schema2] = splitWrapSchema(wrap, { ['x-uid']: '123' });
    expect(schema1).toMatchObject({
      'x-uid': 'aaa',
      properties: {
        aa: {
          'x-uid': 'aa',
          properties: {},
          name: 'aa',
        },
      },
    });
    expect(schema2).toMatchObject({
      'x-uid': '123',
      properties: {
        bbb: {
          'x-uid': 'bbb',
          name: 'bbb',
        },
      },
      name: 'a',
    });
  });
});
