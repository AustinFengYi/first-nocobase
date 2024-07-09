/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Transactionable } from '@nocobase/database';
import type Plugin from '../Plugin';
import type { WorkflowModel } from '../types';

export abstract class Trigger {
  constructor(public readonly workflow: Plugin) {}
  abstract on(workflow: WorkflowModel): void;
  abstract off(workflow: WorkflowModel): void;
  validateEvent(workflow: WorkflowModel, context: any, options: Transactionable): boolean | Promise<boolean> {
    return true;
  }
  duplicateConfig?(workflow: WorkflowModel, options: Transactionable): object | Promise<object>;
  sync?: boolean;
}

export default Trigger;
