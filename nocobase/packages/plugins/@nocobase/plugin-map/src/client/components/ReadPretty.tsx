/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { useFieldSchema, useForm } from '@formily/react';
import { EllipsisWithTooltip, useCollection_deprecated, useFieldTitle } from '@nocobase/client';
import React from 'react';
import { MapComponent } from './MapComponent';

const ReadPretty = (props) => {
  const { value } = props;
  const fieldSchema = useFieldSchema();
  const { getField } = useCollection_deprecated();
  const collectionField = getField(fieldSchema.name);
  const mapType = props.mapType || collectionField?.uiSchema['x-component-props']?.mapType;
  const form = useForm();
  useFieldTitle();

  if (!form.readPretty) {
    return (
      <div>
        <EllipsisWithTooltip ellipsis={true}>
          {value?.map?.((item) => (Array.isArray(item) ? `(${item.join(',')})` : item)).join(',')}
        </EllipsisWithTooltip>
      </div>
    );
  }

  return <MapComponent readonly mapType={mapType} {...props}></MapComponent>;
};

export default ReadPretty;
