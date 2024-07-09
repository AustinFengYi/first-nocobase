/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { createForm } from '@formily/core';
import {
  FormProvider as FormilyFormProvider,
  SchemaExpressionScopeContext,
  SchemaOptionsContext,
} from '@formily/react';
import React, { useContext, useMemo } from 'react';
import { SchemaComponentOptions } from './SchemaComponentOptions';

const WithForm = (props) => {
  const { children, form, ...others } = props;
  const options = useContext(SchemaOptionsContext);
  const expressionScope = useContext(SchemaExpressionScopeContext);
  const scope = { ...options?.scope, ...expressionScope };
  const components = { ...options?.components };
  return (
    <FormilyFormProvider {...others} form={form}>
      <SchemaComponentOptions components={components} scope={scope}>
        {children}
      </SchemaComponentOptions>
    </FormilyFormProvider>
  );
};

const WithoutForm = (props) => {
  const { children, ...others } = props;
  const options = useContext(SchemaOptionsContext);
  const expressionScope = useContext(SchemaExpressionScopeContext);
  const scope = { ...options?.scope, ...expressionScope };
  const components = { ...options?.components };
  const form = useMemo(() => createForm(), []);
  return (
    <FormilyFormProvider {...others} form={form}>
      <SchemaComponentOptions components={components} scope={scope}>
        {children}
      </SchemaComponentOptions>
    </FormilyFormProvider>
  );
};

export const FormProvider: React.FC<any> = (props) => {
  return props.form ? <WithForm {...props} /> : <WithoutForm {...props} />;
};
