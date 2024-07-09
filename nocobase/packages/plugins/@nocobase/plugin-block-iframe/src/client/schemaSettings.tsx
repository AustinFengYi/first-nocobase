/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { css } from '@emotion/css';
import { ISchema, useField, useFieldSchema } from '@formily/react';
import { uid } from '@formily/shared';
import {
  SchemaSettings,
  Variable,
  useAPIClient,
  useDesignable,
  SchemaSettingsBlockHeightItem,
  useFormBlockContext,
  useRecord,
  useVariableOptions,
} from '@nocobase/client';
import React from 'react';
import { useTranslation } from 'react-i18next';

const getVariableComponentWithScope = (Com) => {
  return (props) => {
    const fieldSchema = useFieldSchema();
    const { form } = useFormBlockContext();
    const record = useRecord();
    const scope = useVariableOptions({
      collectionField: { uiSchema: fieldSchema },
      form,
      record,
      uiSchema: fieldSchema,
      noDisabled: true,
    });
    return <Com {...props} scope={scope} />;
  };
};

const commonOptions: any = {
  items: [
    {
      name: 'EditIframe',
      type: 'modal',
      useComponentProps() {
        const field = useField();
        const fieldSchema = useFieldSchema();
        const { t } = useTranslation();
        const { dn } = useDesignable();
        const api = useAPIClient();
        const { mode, url, htmlId, height = '60vh' } = fieldSchema['x-component-props'] || {};
        const saveHtml = async (html: string) => {
          const options = {
            values: { html },
          };
          if (htmlId) {
            // eslint-disable-next-line no-unsafe-optional-chaining
            const { data } = await api.resource('iframeHtml').update?.({ ...options, filterByTk: htmlId });
            return data?.data?.[0] || { id: htmlId };
          } else {
            // eslint-disable-next-line no-unsafe-optional-chaining
            const { data } = await api.resource('iframeHtml').create?.(options);
            return data?.data;
          }
        };

        const submitHandler = async ({ mode, url, html, height, params }) => {
          const componentProps = fieldSchema['x-component-props'] || {};
          componentProps['mode'] = mode;
          componentProps['height'] = height;
          componentProps['params'] = params;
          componentProps['url'] = url;
          if (mode === 'html') {
            const data = await saveHtml(html);
            componentProps['htmlId'] = data.id;
          }
          fieldSchema['x-component-props'] = componentProps;
          field.componentProps = { ...componentProps };
          field.data = { v: uid() };
          dn.emit('patch', {
            schema: {
              'x-uid': fieldSchema['x-uid'],
              'x-component-props': componentProps,
            },
          });
        };

        return {
          title: t('Edit iframe'),
          asyncGetInitialValues: async () => {
            const values = {
              mode,
              url,
              height,
            };
            if (htmlId) {
              // eslint-disable-next-line no-unsafe-optional-chaining
              const { data } = await api.resource('iframeHtml').get?.({ filterByTk: htmlId });
              values['html'] = data?.data?.html || '';
            }
            return values;
          },
          schema: {
            type: 'object',
            title: t('Edit iframe'),
            properties: {
              mode: {
                title: '{{t("Mode")}}',
                'x-component': 'Radio.Group',
                'x-decorator': 'FormItem',
                required: true,
                default: 'url',
                enum: [
                  { value: 'url', label: t('URL') },
                  { value: 'html', label: t('HTML') },
                ],
              },
              url: {
                title: t('URL'),
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': getVariableComponentWithScope(Variable.TextArea),
                description: t('Do not concatenate search params in the URL'),
                required: true,
                'x-reactions': {
                  dependencies: ['mode'],
                  fulfill: {
                    state: {
                      hidden: '{{$deps[0] === "html"}}',
                    },
                  },
                },
              },
              params: {
                type: 'array',
                'x-component': 'ArrayItems',
                'x-decorator': 'FormItem',
                title: `{{t("Search parameters")}}`,
                default: fieldSchema?.['x-component-props']?.params || [{}],
                items: {
                  type: 'object',
                  properties: {
                    space: {
                      type: 'void',
                      'x-component': 'Space',
                      'x-component-props': {
                        style: {
                          flexWrap: 'nowrap',
                          maxWidth: '100%',
                        },
                        className: css`
                          & > .ant-space-item:first-child,
                          & > .ant-space-item:last-child {
                            flex-shrink: 0;
                          }
                        `,
                      },
                      properties: {
                        name: {
                          type: 'string',
                          'x-decorator': 'FormItem',
                          'x-component': 'Input',
                          'x-component-props': {
                            placeholder: `{{t("Name")}}`,
                          },
                        },
                        value: {
                          type: 'string',
                          'x-decorator': 'FormItem',
                          'x-component': getVariableComponentWithScope(Variable.TextArea),
                          'x-component-props': {
                            placeholder: `{{t("Value")}}`,
                            useTypedConstant: true,
                            changeOnSelect: true,
                          },
                        },
                        remove: {
                          type: 'void',
                          'x-decorator': 'FormItem',
                          'x-component': 'ArrayItems.Remove',
                        },
                      },
                    },
                  },
                },
                'x-reactions': {
                  dependencies: ['mode'],
                  fulfill: {
                    state: {
                      hidden: '{{$deps[0] === "html"}}',
                    },
                  },
                },
                properties: {
                  add: {
                    type: 'void',
                    title: `{{t("Add parameter")}}`,
                    'x-component': 'ArrayItems.Addition',
                  },
                },
              },
              html: {
                title: t('html'),
                type: 'string',
                'x-decorator': 'FormItem',
                'x-component': getVariableComponentWithScope(Variable.RawTextArea),
                'x-component-props': {
                  rows: 10,
                },
                required: true,
                'x-reactions': {
                  dependencies: ['mode'],
                  fulfill: {
                    state: {
                      hidden: '{{$deps[0] === "url"}}',
                    },
                  },
                },
              },
              // height: {
              //   title: t('Height'),
              //   type: 'string',
              //   'x-decorator': 'FormItem',
              //   'x-component': 'Input',
              //   required: true,
              // },
            },
          } as ISchema,
          onSubmit: submitHandler,
          noRecord: true,
        };
      },
    },
    {
      name: 'setTheBlockHeight',
      Component: SchemaSettingsBlockHeightItem,
    },
    {
      name: 'divider',
      type: 'divider',
    },
    {
      name: 'delete',
      type: 'remove',
      useComponentProps() {
        return {
          removeParentsIfNoChildren: true,
          breakRemoveOn: {
            'x-component': 'Grid',
          },
        };
      },
    },
  ],
};

/**
 * @deprecated
 */
export const iframeBlockSchemaSettings_deprecated = new SchemaSettings({
  name: 'iframeBlockSchemaSettings',
  ...commonOptions,
});

export const iframeBlockSchemaSettings = new SchemaSettings({
  name: 'blockSettings:iframe',
  ...commonOptions,
});
