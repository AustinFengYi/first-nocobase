/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { appendQueryStringToUrl, parseVariablesAndChangeParamsToQueryString, reduceValueSize } from '../../hooks/index';

describe('parseVariablesAndChangeParamsToQueryString', () => {
  it('should parse variables and change params to query string', async () => {
    const searchParams = [
      { name: 'param1', value: '{{ $var1.value }}' },
      { name: 'param2', value: 'value2' },
      { name: 'param3', value: 'value3' },
    ];
    const variables: any = {
      parseVariable: vi.fn().mockResolvedValue('parsedValue'),
    };
    const localVariables: any = [
      { name: '$var1', ctx: { value: 'localValue1' } },
      { name: '$var2', ctx: { value: 'localValue2' } },
    ];
    const replaceVariableValue = vi.fn().mockResolvedValue('replacedValue');

    const result = await parseVariablesAndChangeParamsToQueryString({
      searchParams,
      variables,
      localVariables,
      replaceVariableValue,
    });

    expect(variables.parseVariable).toHaveBeenCalledTimes(1);
    expect(variables.parseVariable).toHaveBeenCalledWith('{{ $var1.value }}', localVariables);
    expect(replaceVariableValue).toHaveBeenCalledTimes(2);
    expect(replaceVariableValue).toHaveBeenCalledWith('value2', variables, localVariables);
    expect(replaceVariableValue).toHaveBeenCalledWith('value3', variables, localVariables);

    expect(result).toBe('param1=parsedValue&param2=replacedValue&param3=replacedValue');
  });
});

describe('reduceValueSize', () => {
  it('should reduce the size of the value', () => {
    const value = {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    };

    const result = reduceValueSize(value);

    expect(result).toEqual({
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    });
  });

  it('should remove keys with string values longer than 100 characters', () => {
    const value = {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3'.repeat(20),
    };

    const result = reduceValueSize(value);

    expect(result).toEqual({
      key1: 'value1',
      key2: 'value2',
    });
  });

  it('should reduce the size of nested objects', () => {
    const value = {
      key1: 'value1',
      key2: 'value2',
      key3: {
        nestedKey1: 'nestedValue1',
        nestedKey2: 'nestedValue2',
        nestedKey3: 'nestedValue3',
      },
    };

    const result = reduceValueSize(value);

    expect(result).toEqual({
      key1: 'value1',
      key2: 'value2',
    });
  });

  it('should reduce the size of nested arrays', () => {
    const value = {
      key1: 'value1',
      key2: 'value2',
      key3: ['value1', 'value2', 'value3'],
    };

    const result = reduceValueSize(value);

    expect(result).toEqual({
      key1: 'value1',
      key2: 'value2',
    });
  });

  it('should reduce the size of arrays', () => {
    const value = ['value1', 'value2', 'value3'.repeat(20)];
    const result = reduceValueSize(value);
    expect(result).toEqual(['value1', 'value2', 'value3'.repeat(20)]);

    const value2 = [
      'value1',
      'value2',
      {
        key1: 'value1',
        key2: 'value2',
        key3: {
          nestedKey1: 'nestedValue1',
          nestedKey2: 'nestedValue2',
          nestedKey3: 'nestedValue3',
        },
      },
    ];
    const result2 = reduceValueSize(value2);
    expect(result2).toEqual(['value1', 'value2', { key1: 'value1', key2: 'value2' }]);
  });
});

describe('appendQueryStringToUrl', () => {
  it('should append query string to the URL', () => {
    const url = 'https://example.com';
    const queryString = 'param1=value1&param2=value2';

    const result = appendQueryStringToUrl(url, queryString);

    expect(result).toBe('https://example.com?param1=value1&param2=value2');
  });

  it('should append query string to the URL with existing query parameters', () => {
    const url = 'https://example.com?existingParam=value';
    const queryString = 'param1=value1&param2=value2';

    const result = appendQueryStringToUrl(url, queryString);

    expect(result).toBe('https://example.com?existingParam=value&param1=value1&param2=value2');
  });
});
