/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { render, screen, waitFor } from '@nocobase/test/client';
import dayjs from 'dayjs';
import React from 'react';
import App1 from '../calendar/demos/demo1';
import App2 from '../calendar/demos/demo2';

describe('Calendar', () => {
  it('basic', () => {
    render(<App1 />);

    const currentDate = dayjs().format('YYYY-M');

    waitFor(() => {
      expect(screen.getByText('Today')).toBeInTheDocument();
      expect(screen.getByText(currentDate)).toBeInTheDocument();
      expect(screen.getByText('Month')).toBeInTheDocument();
    });
  });

  it('use CalendarBlockProvider', () => {
    render(<App2 />);

    const currentDate = dayjs().format('YYYY-M');
    waitFor(() => {
      expect(screen.getByText('Today')).toBeInTheDocument();
      expect(screen.getByText(currentDate)).toBeInTheDocument();
      expect(screen.getByText('Month')).toBeInTheDocument();
    });
  });
});
