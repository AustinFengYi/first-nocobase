/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import { cx } from '@emotion/css';
import { TaskItemProps } from '../task-item';
import { milestoneWrapper, milestoneBackground } from './style';

export const Milestone: React.FC<TaskItemProps> = ({ task, isDateChangeable, onEventStart, isSelected }) => {
  const transform = `rotate(45 ${task.x1 + task.height * 0.356} 
    ${task.y + task.height * 0.85})`;
  const getBarColor = () => {
    return isSelected ? task.styles.backgroundSelectedColor : task.styles.backgroundColor;
  };

  return (
    <g tabIndex={0} className={cx(milestoneWrapper)}>
      <rect
        fill={getBarColor()}
        x={task.x1}
        width={task.height}
        y={task.y}
        height={task.height}
        rx={task.barCornerRadius}
        ry={task.barCornerRadius}
        transform={transform}
        className={cx(milestoneBackground)}
        onMouseDown={(e) => {
          isDateChangeable && onEventStart('move', task, e);
        }}
      />
    </g>
  );
};
