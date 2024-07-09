/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { css } from '@emotion/css';
import { FormLayout, IFormLayoutProps } from '@formily/antd-v5';
import { Field, Form as FormilyForm, createForm, onFieldInit, onFormInputChange } from '@formily/core';
import { FieldContext, FormContext, RecursionField, observer, useField, useFieldSchema } from '@formily/react';
import { reaction } from '@formily/reactive';
import { uid } from '@formily/shared';
import { getValuesByPath } from '@nocobase/utils/client';
import { ConfigProvider, Spin, theme } from 'antd';
import _ from 'lodash';
import React, { useEffect, useMemo } from 'react';
import { useActionContext } from '..';
import { useAttach, useComponent, useDesignable } from '../..';
import { useTemplateBlockContext } from '../../../block-provider/TemplateBlockProvider';
import { withDynamicSchemaProps } from '../../../hoc/withDynamicSchemaProps';
import { ActionType } from '../../../schema-settings/LinkageRules/type';
import { useToken } from '../../../style';
import { useLocalVariables, useVariables } from '../../../variables';
import { VariableOption, VariablesContextType } from '../../../variables/types';
import { getPath } from '../../../variables/utils/getPath';
import { getVariableName } from '../../../variables/utils/getVariableName';
import { getVariablesFromExpression, isVariable } from '../../../variables/utils/isVariable';
import { getInnermostKeyAndValue, getTargetField } from '../../common/utils/uitls';
import { useProps } from '../../hooks/useProps';
import { useFormBlockHeight } from './hook';
import { collectFieldStateOfLinkageRules, getTempFieldState } from './utils';

export interface FormProps extends IFormLayoutProps {
  form?: FormilyForm;
  disabled?: boolean;
}

const FormComponent: React.FC<FormProps> = (props) => {
  const { form, children, ...others } = props;
  const field = useField();
  const fieldSchema = useFieldSchema();
  // TODO: component 里 useField 会与当前 field 存在偏差
  const f = useAttach(form.createVoidField({ ...field.props, basePath: '' }));
  const height = useFormBlockHeight();
  const { token } = theme.useToken();
  const { designable } = useDesignable();
  return (
    <FieldContext.Provider value={undefined}>
      <FormContext.Provider value={form}>
        <FormLayout layout={'vertical'} {...others}>
          <div
            className={css`
              .nb-grid-container {
                height: ${height ? height + 'px' : '100%'};
                overflow-y: auto;
                margin-left: -${token.marginLG}px;
                margin-right: -${token.marginLG}px;
                padding-left: ${token.marginLG}px;
                padding-right: ${token.marginLG}px;
              }
            `}
          >
            <RecursionField basePath={f.address} schema={fieldSchema} onlyRenderProperties />
          </div>
        </FormLayout>
      </FormContext.Provider>
    </FieldContext.Provider>
  );
};

const Def = (props: any) => props.children;

const FormDecorator: React.FC<FormProps> = (props) => {
  const { form, children, disabled, ...others } = props;
  const field = useField();
  const fieldSchema = useFieldSchema();
  // TODO: component 里 useField 会与当前 field 存在偏差
  const f = useAttach(form.createVoidField({ ...field.props, basePath: '' }));
  const Component = useComponent(fieldSchema['x-component'], Def);
  return (
    <FieldContext.Provider value={undefined}>
      <FormContext.Provider value={form}>
        <FormLayout layout={'vertical'} {...others}>
          <FieldContext.Provider value={f}>
            <Component {...field.componentProps}>
              <RecursionField basePath={f.address} schema={fieldSchema} onlyRenderProperties />
            </Component>
          </FieldContext.Provider>
          {/* <FieldContext.Provider value={f}>{children}</FieldContext.Provider> */}
        </FormLayout>
      </FormContext.Provider>
    </FieldContext.Provider>
  );
};

const getLinkageRules = (fieldSchema) => {
  let linkageRules = null;
  fieldSchema.mapProperties((schema) => {
    if (schema['x-linkage-rules']) {
      linkageRules = schema['x-linkage-rules'];
    }
  });
  return linkageRules;
};

interface WithFormProps {
  form: FormilyForm;
  disabled?: boolean;
}

const WithForm = (props: WithFormProps) => {
  const { form } = props;
  const fieldSchema = useFieldSchema();
  const { setFormValueChanged } = useActionContext();
  const variables = useVariables();
  const localVariables = useLocalVariables({ currentForm: form });
  const { templateFinished } = useTemplateBlockContext();
  const linkageRules: any[] =
    (getLinkageRules(fieldSchema) || fieldSchema.parent?.['x-linkage-rules'])?.filter((k) => !k.disabled) || [];

  useEffect(() => {
    const id = uid();

    form.addEffects(id, () => {
      onFormInputChange(() => {
        setFormValueChanged?.(true);
      });
    });

    if (props.disabled) {
      form.disabled = props.disabled;
    }

    return () => {
      form.removeEffects(id);
    };
  }, [form, props.disabled, setFormValueChanged]);

  useEffect(() => {
    const id = uid();
    const disposes = [];

    form.addEffects(id, () => {
      linkageRules.forEach((rule) => {
        rule.actions?.forEach((action) => {
          if (action.targetFields?.length) {
            const fields = action.targetFields.join(',');

            // 之前使用的 `onFieldReact` 有问题，没有办法被取消监听，所以这里用 `onFieldInit` 和 `reaction` 代替
            onFieldInit(`*(${fields})`, (field: any, form) => {
              field['initStateOfLinkageRules'] = {
                display: field.initStateOfLinkageRules?.display || getTempFieldState(true, field.display),
                required: field.initStateOfLinkageRules?.required || getTempFieldState(true, field.required || false),
                pattern: field.initStateOfLinkageRules?.pattern || getTempFieldState(true, field.pattern),
                value:
                  field.initStateOfLinkageRules?.value || getTempFieldState(true, field.value || field.initialValue),
              };

              disposes.push(
                reaction(
                  // 这里共依赖 3 部分，当这 3 部分中的任意一部分发生变更后，需要触发联动规则：
                  // 1. 条件中的字段值；
                  // 2. 条件中的变量值；
                  // 3. value 表达式中的变量值；
                  () => {
                    // 获取条件中的字段值
                    const fieldValuesInCondition = getFieldValuesInCondition({ linkageRules, formValues: form.values });

                    // 获取条件中的变量值
                    const variableValuesInCondition = getVariableValuesInCondition({ linkageRules, localVariables });

                    // 获取 value 表达式中的变量值
                    const variableValuesInExpression = getVariableValuesInExpression({ action, localVariables });

                    const result = [fieldValuesInCondition, variableValuesInCondition, variableValuesInExpression]
                      .map((item) => JSON.stringify(item))
                      .join(',');
                    return result;
                  },
                  getSubscriber(action, field, rule, variables, localVariables),
                  { fireImmediately: true, equals: _.isEqual },
                ),
              );
            });
          }
        });
      });
    });

    return () => {
      form.removeEffects(id);
      disposes.forEach((dispose) => {
        dispose();
      });
    };
  }, [linkageRules, templateFinished]);

  return fieldSchema['x-decorator'] === 'FormV2' ? <FormDecorator {...props} /> : <FormComponent {...props} />;
};

const WithoutForm = (props) => {
  const fieldSchema = useFieldSchema();
  const { setFormValueChanged } = useActionContext();
  const form = useMemo(
    () =>
      createForm({
        disabled: props.disabled,
        effects() {
          onFormInputChange((form) => {
            setFormValueChanged?.(true);
          });
        },
      }),
    [],
  );
  return fieldSchema['x-decorator'] === 'FormV2' ? (
    <FormDecorator form={form} {...props} />
  ) : (
    <FormComponent form={form} {...props} />
  );
};

const formLayoutCss = css`
  .ant-formily-item-feedback-layout-loose {
    margin-bottom: 12px;
  }
`;

export const Form: React.FC<FormProps> & {
  Designer?: any;
  FilterDesigner?: any;
  ReadPrettyDesigner?: any;
  Templates?: any;
} = withDynamicSchemaProps(
  observer((props) => {
    const field = useField<Field>();
    const { token } = useToken();

    // 新版 UISchema（1.0 之后）中已经废弃了 useProps，这里之所以继续保留是为了兼容旧版的 UISchema
    const { form, disabled, ...others } = useProps(props);
    const theme: any = useMemo(() => {
      return {
        token: {
          // 这里是为了防止区块内部也收到 marginBlock 的影响（marginBlock：区块之间的间距）
          // @ts-ignore
          marginBlock: token.marginLG,
        },
      };
    }, [token.marginLG]);

    const formDisabled = disabled || field.disabled;
    return (
      <ConfigProvider componentDisabled={formDisabled} theme={theme}>
        <form onSubmit={(e) => e.preventDefault()} className={formLayoutCss}>
          <Spin spinning={field.loading || false}>
            {form ? (
              <WithForm form={form} {...others} disabled={formDisabled} />
            ) : (
              <WithoutForm {...others} disabled={formDisabled} />
            )}
          </Spin>
        </form>
      </ConfigProvider>
    );
  }),
  { displayName: 'Form' },
);

function getSubscriber(
  action: any,
  field: any,
  rule: any,
  variables: VariablesContextType,
  localVariables: VariableOption[],
): (value: string, oldValue: string) => void {
  return () => {
    // 当条件改变触发 reaction 时，会同步收集字段状态，并保存到 field.stateOfLinkageRules 中
    collectFieldStateOfLinkageRules({
      operator: action.operator,
      value: action.value,
      field,
      condition: rule.condition,
      variables,
      localVariables,
    });

    // 当条件改变时，有可能会触发多个 reaction，所以这里需要延迟一下，确保所有的 reaction 都执行完毕后，
    // 再从 field.stateOfLinkageRules 中取值，因为此时 field.stateOfLinkageRules 中的值才是全的。
    setTimeout(async () => {
      const fieldName = getFieldNameByOperator(action.operator);

      // 防止重复赋值
      if (!field.stateOfLinkageRules?.[fieldName]) {
        return;
      }

      let stateList = field.stateOfLinkageRules[fieldName];

      stateList = await Promise.all(stateList);
      stateList = stateList.filter((v) => v.condition);

      const lastState = stateList[stateList.length - 1];

      if (fieldName === 'value') {
        // value 比较特殊，它只有在匹配条件时才需要赋值，当条件不匹配时，维持现在的值；
        // stateList 中肯定会有一个初始值，所以当 stateList.length > 1 时，就说明有匹配条件的情况；
        if (stateList.length > 1) {
          field.value = lastState.value;
        }
      } else {
        field[fieldName] = lastState?.value;
        //字段隐藏时清空数据
        if (fieldName === 'display' && lastState?.value === 'none') {
          field.value = null;
        }
      }

      // 在这里清空 field.stateOfLinkageRules，就可以保证：当条件再次改变时，如果该字段没有和任何条件匹配，则需要把对应的值恢复到初始值；
      field.stateOfLinkageRules[fieldName] = null;
    });
  };
}

function getFieldNameByOperator(operator: ActionType) {
  switch (operator) {
    case ActionType.Required:
    case ActionType.InRequired:
      return 'required';
    case ActionType.Visible:
    case ActionType.None:
    case ActionType.Hidden:
      return 'display';
    case ActionType.Editable:
    case ActionType.ReadOnly:
    case ActionType.ReadPretty:
      return 'pattern';
    case ActionType.Value:
      return 'value';
    default:
      return null;
  }
}

function getFieldValuesInCondition({ linkageRules, formValues }) {
  return linkageRules.map((rule) => {
    const run = (condition) => {
      const type = Object.keys(condition)[0] || '$and';
      const conditions = condition[type];

      return conditions
        .map((condition) => {
          // fix https://nocobase.height.app/T-3251
          if ('$and' in condition || '$or' in condition) {
            return run(condition);
          }

          const path = getTargetField(condition).join('.');
          return getValuesByPath(formValues, path);
        })
        .filter(Boolean);
    };

    return run(rule.condition);
  });
}

function getVariableValuesInCondition({
  linkageRules,
  localVariables,
}: {
  linkageRules: any[];
  localVariables: VariableOption[];
}) {
  return linkageRules.map((rule) => {
    const type = Object.keys(rule.condition)[0] || '$and';
    const conditions = rule.condition[type];

    return conditions
      .map((condition) => {
        const jsonlogic = getInnermostKeyAndValue(condition);
        if (!jsonlogic) {
          return null;
        }
        if (isVariable(jsonlogic.value)) {
          return getVariableValue(jsonlogic.value, localVariables);
        }

        return jsonlogic.value;
      })
      .filter(Boolean);
  });
}

function getVariableValuesInExpression({ action, localVariables }) {
  const actionValue = action.value;
  const mode = actionValue?.mode;
  const value = actionValue?.value || actionValue?.result;

  if (mode !== 'express') {
    return;
  }

  if (value == null) {
    return;
  }

  return getVariablesFromExpression(value)
    ?.map((variableString: string) => {
      return getVariableValue(variableString, localVariables);
    })
    .filter(Boolean);
}

function getVariableValue(variableString: string, localVariables: VariableOption[]) {
  if (!isVariable(variableString)) {
    return;
  }

  const variableName = getVariableName(variableString);
  const ctx = {
    [variableName]: localVariables.find((item) => item.name === variableName)?.ctx,
  };

  return getValuesByPath(ctx, getPath(variableString));
}
