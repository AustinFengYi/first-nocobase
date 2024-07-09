/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Carousel } from 'antd';
import type { CSSProperties } from 'react';
import React from 'react';

import type { ComponentDemo } from '../../interface';

const contentStyle = {
  height: '160px',
  color: '#fff',
  lineHeight: '160px',
  textAlign: 'center',
  background: '#364d79',
};
const Demo = () => (
  <Carousel>
    <div>
      <h3 style={contentStyle as CSSProperties}>1</h3>
    </div>
    <div>
      <h3 style={contentStyle as CSSProperties}>2</h3>
    </div>
    <div>
      <h3 style={contentStyle as CSSProperties}>3</h3>
    </div>
    <div>
      <h3 style={contentStyle as CSSProperties}>4</h3>
    </div>
  </Carousel>
);

const componentDemo: ComponentDemo = {
  demo: <Demo />,
  tokens: ['colorText', 'colorBgContainer'],
  key: 'default',
};

export default componentDemo;
