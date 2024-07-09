/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { connect, mapReadPretty } from '@formily/react';
import React, { useMemo } from 'react';
import { DatePicker } from '../date-picker';
import dayjs from 'dayjs';

const toValue = (value: any, accuracy) => {
  if (value) {
    return timestampToDate(value, accuracy);
  }
  return null;
};

function timestampToDate(timestamp, accuracy = 'millisecond') {
  if (accuracy === 'second') {
    timestamp *= 1000; // 如果精确度是秒级，则将时间戳乘以1000转换为毫秒级
  }
  return dayjs(timestamp);
}

function getTimestamp(date, accuracy = 'millisecond') {
  if (accuracy === 'second') {
    return dayjs(date).unix();
  } else {
    return dayjs(date).valueOf(); // 默认返回毫秒级时间戳
  }
}

interface UnixTimestampProps {
  value?: number;
  accuracy?: 'millisecond' | 'second';
  onChange?: (value: number) => void;
}

export const UnixTimestamp = connect(
  (props: UnixTimestampProps) => {
    const { value, onChange, accuracy = 'second' } = props;
    const v = useMemo(() => toValue(value, accuracy), [value, accuracy]);
    return (
      <DatePicker
        {...props}
        value={v}
        onChange={(v: any) => {
          if (onChange) {
            onChange(getTimestamp(v, accuracy));
          }
        }}
      />
    );
  },
  mapReadPretty((props) => {
    const { value, accuracy = 'second' } = props;
    const v = useMemo(() => toValue(value, accuracy), [value, accuracy]);
    return <DatePicker.ReadPretty {...props} value={v} />;
  }),
);
