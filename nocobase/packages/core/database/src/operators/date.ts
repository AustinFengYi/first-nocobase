/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { parseDate } from '@nocobase/utils';
import { Op } from 'sequelize';

function isDate(input) {
  return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
}

const toDate = (date) => {
  if (isDate(date)) {
    return date;
  }
  return new Date(date);
};

export default {
  $dateOn(value, ctx) {
    const r = parseDate(value, {
      timezone: ctx.db.options.timezone,
    });
    if (typeof r === 'string') {
      return {
        [Op.eq]: toDate(r),
      };
    }
    if (Array.isArray(r)) {
      return {
        [Op.and]: [{ [Op.gte]: toDate(r[0]) }, { [Op.lt]: toDate(r[1]) }],
      };
    }
    throw new Error(`Invalid Date ${JSON.stringify(value)}`);
  },

  $dateNotOn(value, ctx) {
    const r = parseDate(value, {
      timezone: ctx.db.options.timezone,
    });
    if (typeof r === 'string') {
      return {
        [Op.ne]: toDate(r),
      };
    }
    if (Array.isArray(r)) {
      return {
        [Op.or]: [{ [Op.lt]: toDate(r[0]) }, { [Op.gte]: toDate(r[1]) }],
      };
    }
    throw new Error(`Invalid Date ${JSON.stringify(value)}`);
  },

  $dateBefore(value, ctx) {
    const r = parseDate(value, {
      timezone: ctx.db.options.timezone,
    });
    if (typeof r === 'string') {
      return {
        [Op.lt]: toDate(r),
      };
    } else if (Array.isArray(r)) {
      return {
        [Op.lt]: toDate(r[0]),
      };
    }
    throw new Error(`Invalid Date ${JSON.stringify(value)}`);
  },

  $dateNotBefore(value, ctx) {
    const r = parseDate(value, {
      timezone: ctx.db.options.timezone,
    });
    if (typeof r === 'string') {
      return {
        [Op.gte]: toDate(r),
      };
    } else if (Array.isArray(r)) {
      return {
        [Op.gte]: toDate(r[0]),
      };
    }
    throw new Error(`Invalid Date ${JSON.stringify(value)}`);
  },

  $dateAfter(value, ctx) {
    const r = parseDate(value, {
      timezone: ctx.db.options.timezone,
    });
    if (typeof r === 'string') {
      return {
        [Op.gt]: toDate(r),
      };
    } else if (Array.isArray(r)) {
      return {
        [Op.gte]: toDate(r[1]),
      };
    }
    throw new Error(`Invalid Date ${JSON.stringify(value)}`);
  },

  $dateNotAfter(value, ctx) {
    const r = parseDate(value, {
      timezone: ctx.db.options.timezone,
    });
    if (typeof r === 'string') {
      return {
        [Op.lte]: toDate(r),
      };
    } else if (Array.isArray(r)) {
      return {
        [Op.lt]: toDate(r[1]),
      };
    }
    throw new Error(`Invalid Date ${JSON.stringify(value)}`);
  },

  $dateBetween(value, ctx) {
    const r = parseDate(value, {
      timezone: ctx.db.options.timezone,
    });
    if (r) {
      return {
        [Op.and]: [{ [Op.gte]: toDate(r[0]) }, { [Op.lt]: toDate(r[1]) }],
      };
    }
    throw new Error(`Invalid Date ${JSON.stringify(value)}`);
  },
} as Record<string, any>;
