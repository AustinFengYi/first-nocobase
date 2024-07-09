/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { render } from '@testing-library/react';
import React from 'react';
import App1 from '../demos/demo1';

describe('BlockItem', () => {
  it('should render correctly', () => {
    render(<App1 />);

    const items = document.querySelectorAll('.nc-block-item');
    expect(items.length).toBe(3);
    expect(items[0]).toHaveTextContent('Block block1');
    expect(items[1]).toHaveTextContent('Block block2');
    expect(items[2]).toHaveTextContent('Block block3');
  });
});
