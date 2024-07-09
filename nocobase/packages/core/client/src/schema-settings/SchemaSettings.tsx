/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { css } from '@emotion/css';
import { ArrayCollapse, ArrayItems, FormItem, FormLayout, Input } from '@formily/antd-v5';
import { Field, GeneralField, createForm } from '@formily/core';
import { ISchema, Schema, SchemaOptionsContext, useField, useFieldSchema, useForm } from '@formily/react';
import { uid } from '@formily/shared';
import type { DropdownProps } from 'antd';
import {
  Alert,
  App,
  Button,
  Cascader,
  CascaderProps,
  ConfigProvider,
  Dropdown,
  MenuItemProps,
  MenuProps,
  Modal,
  ModalFuncProps,
  Space,
  Switch,
} from 'antd';
import _, { cloneDeep, get, set } from 'lodash';
import React, {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  // @ts-ignore
  useTransition as useReactTransition,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Router } from 'react-router-dom';
import { APIClientProvider } from '../api-client/APIClientProvider';
import { useAPIClient } from '../api-client/hooks/useAPIClient';
import { ApplicationContext, useApp } from '../application';
import {
  BlockContext,
  BlockRequestContext_deprecated,
  useBlockContext,
  useBlockRequestContext,
} from '../block-provider/BlockProvider';
import {
  FormBlockContext,
  findFormBlock,
  useFormBlockContext,
  useFormBlockType,
} from '../block-provider/FormBlockProvider';
import { FormActiveFieldsProvider, useFormActiveFields } from '../block-provider/hooks';
import { useLinkageCollectionFilterOptions, useSortFields } from '../collection-manager/action-hooks';
import { useCollectionManager_deprecated } from '../collection-manager/hooks/useCollectionManager_deprecated';
import { useCollection_deprecated } from '../collection-manager/hooks/useCollection_deprecated';
import { CollectionFieldOptions_deprecated } from '../collection-manager/types';
import { SelectWithTitle, SelectWithTitleProps } from '../common/SelectWithTitle';
import { useNiceDropdownMaxHeight } from '../common/useNiceDropdownHeight';
import {
  CollectionRecordProvider,
  useCollectionRecord,
} from '../data-source/collection-record/CollectionRecordProvider';
import { DataSourceApplicationProvider } from '../data-source/components/DataSourceApplicationProvider';
import { AssociationOrCollectionProvider, useDataBlockProps } from '../data-source/data-block/DataBlockProvider';
import { useDataSourceManager } from '../data-source/data-source/DataSourceManagerProvider';
import { useDataSourceKey } from '../data-source/data-source/DataSourceProvider';
import { useFilterBlock } from '../filter-provider/FilterProvider';
import { FlagProvider } from '../flag-provider';
import { useGlobalTheme } from '../global-theme';
import { useCollectMenuItem, useCollectMenuItems, useMenuItem } from '../hooks/useMenuItem';
import {
  VariablePopupRecordProvider,
  useCurrentPopupRecord,
  useParentPopupRecord,
} from '../modules/variable/variablesProvider/VariablePopupRecordProvider';
import { useRecord } from '../record-provider';
import { ActionContextProvider } from '../schema-component/antd/action/context';
import { SubFormProvider, useSubFormValue } from '../schema-component/antd/association-field/hooks';
import { FormDialog } from '../schema-component/antd/form-dialog';
import { SchemaComponentContext } from '../schema-component/context';
import { FormProvider } from '../schema-component/core/FormProvider';
import { RemoteSchemaComponent } from '../schema-component/core/RemoteSchemaComponent';
import { SchemaComponent } from '../schema-component/core/SchemaComponent';
import { SchemaComponentOptions } from '../schema-component/core/SchemaComponentOptions';
import { useCompile } from '../schema-component/hooks/useCompile';
import { Designable, createDesignable, useDesignable } from '../schema-component/hooks/useDesignable';
import { useSchemaTemplateManager } from '../schema-templates';
import { useBlockTemplateContext } from '../schema-templates/BlockTemplate';
import { useLocalVariables, useVariables } from '../variables';
import { FormDataTemplates } from './DataTemplates';
import { EnableChildCollections } from './EnableChildCollections';
import { ChildDynamicComponent } from './EnableChildCollections/DynamicComponent';
import { FormLinkageRules } from './LinkageRules';
import { useLinkageCollectionFieldOptions } from './LinkageRules/action-hooks';

export interface SchemaSettingsProps {
  title?: any;
  dn?: Designable;
  field?: GeneralField;
  fieldSchema?: Schema;
  children?: ReactNode;
}

interface SchemaSettingsContextProps<T = any> {
  dn?: Designable;
  field?: GeneralField;
  fieldSchema?: Schema;
  setVisible?: any;
  visible?: any;
  template?: any;
  collectionName?: any;
  designer?: T;
}

const SchemaSettingsContext = createContext<SchemaSettingsContextProps>(null);
SchemaSettingsContext.displayName = 'SchemaSettingsContext';

export function useSchemaSettings<T = any>() {
  return useContext(SchemaSettingsContext) as SchemaSettingsContextProps<T>;
}

interface SchemaSettingsProviderProps {
  dn?: Designable;
  field?: GeneralField;
  fieldSchema?: Schema;
  setVisible?: any;
  visible?: any;
  template?: any;
  collectionName?: any;
  designer?: any;
}

export const SchemaSettingsProvider: React.FC<SchemaSettingsProviderProps> = (props) => {
  const { children, fieldSchema, ...others } = props;
  const { getTemplateBySchema } = useSchemaTemplateManager();
  const { name } = useCollection_deprecated();
  const template = getTemplateBySchema(fieldSchema);
  return (
    <SchemaSettingsContext.Provider value={{ collectionName: name, template, fieldSchema, ...others }}>
      {children}
    </SchemaSettingsContext.Provider>
  );
};

export const SchemaSettingsDropdown: React.FC<SchemaSettingsProps> = (props) => {
  const { title, dn, ...others } = props;
  const app = useApp();
  const [visible, setVisible] = useState(false);
  const { Component, getMenuItems } = useMenuItem();
  const [, startTransition] = useReactTransition();
  const dropdownMaxHeight = useNiceDropdownMaxHeight([visible]);

  const changeMenu: DropdownProps['onOpenChange'] = useCallback((nextOpen: boolean, info) => {
    if (info.source === 'trigger' || nextOpen) {
      // 当鼠标快速滑过时，终止菜单的渲染，防止卡顿
      startTransition(() => {
        setVisible(nextOpen);
      });
    }
  }, []);

  const items = getMenuItems(() => props.children);

  return (
    <SchemaSettingsProvider visible={visible} setVisible={setVisible} dn={dn} {...others}>
      <Component />
      <Dropdown
        open={visible}
        onOpenChange={changeMenu}
        overlayClassName={css`
          .ant-dropdown-menu-item-group-list {
            max-height: 300px;
            overflow-y: auto;
          }
        `}
        menu={
          {
            items,
            'data-testid': 'schema-settings-menu',
            style: { maxHeight: dropdownMaxHeight, overflowY: 'auto' },
          } as any
        }
      >
        <div data-testid={props['data-testid']}>{typeof title === 'string' ? <span>{title}</span> : title}</div>
      </Dropdown>
    </SchemaSettingsProvider>
  );
};

const findGridSchema = (fieldSchema) => {
  return fieldSchema.reduceProperties((buf, s) => {
    if (s['x-component'] === 'FormV2' || s['x-component'] === 'Details') {
      const f = s.reduceProperties((buf, s) => {
        if (s['x-component'] === 'Grid' || s['x-component'] === 'BlockTemplate') {
          return s;
        }
        return buf;
      }, null);
      if (f) {
        return f;
      }
    }
    return buf;
  }, null);
};

const findBlockTemplateSchema = (fieldSchema) => {
  return fieldSchema.reduceProperties((buf, s) => {
    if (s['x-component'] === 'FormV2' || s['x-component'] === 'Details') {
      const f = s.reduceProperties((buf, s) => {
        if (s['x-component'] === 'BlockTemplate') {
          return s;
        }
        return buf;
      }, null);
      if (f) {
        return f;
      }
    }
    return buf;
  }, null);
};

export const SchemaSettingsFormItemTemplate = function FormItemTemplate(props) {
  const { insertAdjacentPosition = 'afterBegin', componentName, collectionName, resourceName } = props;
  const { t } = useTranslation();
  const compile = useCompile();
  const { getCollection } = useCollectionManager_deprecated();
  const { dn, setVisible, template, fieldSchema } = useSchemaSettings();
  const api = useAPIClient();
  const { saveAsTemplate, copyTemplateSchema } = useSchemaTemplateManager();
  const { theme } = useGlobalTheme();

  if (!collectionName) {
    return null;
  }
  if (template) {
    return (
      <SchemaSettingsItem
        title="Convert reference to duplicate"
        onClick={async () => {
          const schema = await copyTemplateSchema(template);
          const templateSchema = findBlockTemplateSchema(fieldSchema);
          const sdn = createDesignable({
            t,
            api,
            refresh: dn.refresh.bind(dn),
            current: templateSchema.parent,
          });
          sdn.loadAPIClientEvents();
          sdn.removeWithoutEmit(templateSchema);
          sdn.insertAdjacent(insertAdjacentPosition, schema, {
            async onSuccess() {
              await api.request({
                url: `/uiSchemas:remove/${templateSchema['x-uid']}`,
              });
            },
          });
          fieldSchema['x-template-key'] = null;
          await api.request({
            url: `uiSchemas:patch`,
            method: 'post',
            data: {
              'x-uid': fieldSchema['x-uid'],
              'x-template-key': null,
            },
          });
          dn.refresh();
        }}
      >
        {t('Convert reference to duplicate')}
      </SchemaSettingsItem>
    );
  }
  return (
    <SchemaSettingsItem
      title="Save as block template"
      onClick={async () => {
        setVisible(false);
        const collection = collectionName && getCollection(collectionName);
        const gridSchema = findGridSchema(fieldSchema);
        const values = await FormDialog(
          t('Save as template'),
          () => {
            const componentTitle = {
              FormItem: t('Form'),
              ReadPrettyFormItem: t('Details'),
            };
            return (
              <FormLayout layout={'vertical'}>
                <SchemaComponent
                  components={{ Input, FormItem }}
                  schema={{
                    type: 'object',
                    properties: {
                      name: {
                        title: t('Template name'),
                        required: true,
                        default: collection
                          ? `${compile(collection?.title || collection?.name)}_${t(
                              componentTitle[componentName] || componentName,
                            )}`
                          : t(componentTitle[componentName] || componentName),
                        'x-decorator': 'FormItem',
                        'x-component': 'Input',
                      },
                    },
                  }}
                />
              </FormLayout>
            );
          },
          theme,
        ).open({});
        const sdn = createDesignable({
          t,
          api,
          refresh: dn.refresh.bind(dn),
          current: gridSchema.parent,
        });
        sdn.loadAPIClientEvents();
        const { key } = await saveAsTemplate({
          collectionName,
          resourceName,
          componentName,
          dataSourceKey: collection.dataSource,
          name: values.name,
          uid: gridSchema['x-uid'],
        });
        sdn.removeWithoutEmit(gridSchema);
        sdn.insertAdjacent(insertAdjacentPosition, {
          type: 'void',
          'x-component': 'BlockTemplate',
          'x-component-props': {
            templateId: key,
          },
        });
        fieldSchema['x-template-key'] = key;
        await api.request({
          url: `uiSchemas:patch`,
          method: 'post',
          data: {
            'x-uid': fieldSchema['x-uid'],
            'x-template-key': key,
          },
        });
      }}
    >
      {t('Save as block template')}
    </SchemaSettingsItem>
  );
};

export interface SchemaSettingsItemProps extends Omit<MenuItemProps, 'title'> {
  title: string;
}
export const SchemaSettingsItem: FC<SchemaSettingsItemProps> = (props) => {
  const { pushMenuItem } = useCollectMenuItems();
  const { collectMenuItem } = useCollectMenuItem();
  const { eventKey, title } = props;

  if (process.env.NODE_ENV !== 'production' && !title) {
    throw new Error('SchemaSettingsItem must have a title');
  }

  const item = {
    key: title,
    ..._.omit(props, ['children', 'name']),
    eventKey: eventKey as any,
    onClick: (info) => {
      info.domEvent.preventDefault();
      info.domEvent.stopPropagation();
      props?.onClick?.(info);
    },
    style: { minWidth: 120 },
    label: props.children || props.title,
    title: props.title,
  } as MenuProps['items'][0];

  pushMenuItem?.(item);
  collectMenuItem?.(item);
  return null;
};

export interface SchemaSettingsItemGroupProps {
  title: string;
  children: any[];
}
export const SchemaSettingsItemGroup: FC<SchemaSettingsItemGroupProps> = (props) => {
  const { Component, getMenuItems } = useMenuItem();
  const { pushMenuItem } = useCollectMenuItems();
  const key = useMemo(() => uid(), []);
  const item = {
    key,
    type: 'group',
    title: props.title,
    label: props.title,
    children: getMenuItems(() => props.children),
  } as MenuProps['items'][0];

  pushMenuItem(item);
  return <Component />;
};

export interface SchemaSettingsSubMenuProps {
  title: string;
  eventKey?: string;
  children: any;
}

export const SchemaSettingsSubMenu = function SubMenu(props: SchemaSettingsSubMenuProps) {
  const { Component, getMenuItems } = useMenuItem();
  const { pushMenuItem } = useCollectMenuItems();
  const key = useMemo(() => uid(), []);
  const item = {
    key,
    label: props.title,
    title: props.title,
    children: getMenuItems(() => props.children),
  } as MenuProps['items'][0];

  pushMenuItem(item);
  return <Component />;
};

export const SchemaSettingsDivider = function Divider() {
  const { pushMenuItem } = useCollectMenuItems();
  const key = useMemo(() => uid(), []);
  const item = {
    key,
    type: 'divider',
  } as MenuProps['items'][0];

  pushMenuItem(item);
  return null;
};

export interface SchemaSettingsRemoveProps {
  confirm?: ModalFuncProps;
  removeParentsIfNoChildren?: boolean;
  breakRemoveOn?: ISchema | ((s: ISchema) => boolean);
}
export const SchemaSettingsRemove: FC<SchemaSettingsRemoveProps> = (props) => {
  const { confirm, removeParentsIfNoChildren, breakRemoveOn } = props;
  const { dn, template } = useSchemaSettings();
  const { t } = useTranslation();
  const field = useField<Field>();
  const fieldSchema = useFieldSchema();
  const ctx = useBlockTemplateContext();
  const form = useForm();
  const { modal } = App.useApp();
  const { removeActiveFieldName } = useFormActiveFields() || {};
  const { removeDataBlock } = useFilterBlock();

  return (
    <SchemaSettingsItem
      title="Delete"
      eventKey="remove"
      onClick={() => {
        modal.confirm({
          title: t('Delete block'),
          content: t('Are you sure you want to delete it?'),
          ...confirm,
          async onOk() {
            const options = {
              removeParentsIfNoChildren,
              breakRemoveOn,
            };
            if (field?.required) {
              field.required = false;
              fieldSchema['required'] = false;
            }
            if (template && template.uid === fieldSchema['x-uid'] && ctx?.dn) {
              await ctx?.dn.remove(null, options);
            } else {
              await dn.remove(null, options);
            }
            await confirm?.onOk?.();
            delete form.values[fieldSchema.name];
            removeActiveFieldName?.(fieldSchema.name as string);
            form?.query(new RegExp(`${fieldSchema.parent.name}.${fieldSchema.name}$`)).forEach((field: Field) => {
              // 如果字段被删掉，那么在提交的时候不应该提交这个字段
              field.setValue?.(undefined);
            });
            removeDataBlock(fieldSchema['x-uid']);
          },
        });
      }}
    >
      {t('Delete')}
    </SchemaSettingsItem>
  );
};

export interface SchemaSettingsSelectItemProps
  extends Omit<SchemaSettingsItemProps, 'onChange' | 'onClick'>,
    Omit<SelectWithTitleProps, 'title' | 'defaultValue'> {
  value?: SelectWithTitleProps['defaultValue'];
}
export const SchemaSettingsSelectItem: FC<SchemaSettingsSelectItemProps> = (props) => {
  const { title, options, value, onChange, ...others } = props;

  return (
    <SchemaSettingsItem title={title} {...others}>
      <SelectWithTitle {...{ title, defaultValue: value, onChange, options }} />
    </SchemaSettingsItem>
  );
};

export type SchemaSettingsCascaderItemProps = CascaderProps<any> & Omit<MenuItemProps, 'title'> & { title: any };
export const SchemaSettingsCascaderItem: FC<SchemaSettingsCascaderItemProps> = (props) => {
  const { title, options, value, onChange, ...others } = props;
  return (
    <SchemaSettingsItem title={title} {...(others as any)}>
      <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
        {title}
        <Cascader
          bordered={false}
          defaultValue={value}
          onChange={onChange as any}
          options={options}
          style={{ textAlign: 'right', minWidth: 100 }}
          {...props}
        />
      </div>
    </SchemaSettingsItem>
  );
};

export interface SchemaSettingsSwitchItemProps extends Omit<MenuItemProps, 'onChange'> {
  title: string;
  checked?: boolean;
  onChange?: (v: boolean) => void;
}
export const SchemaSettingsSwitchItem: FC<SchemaSettingsSwitchItemProps> = (props) => {
  const { title, onChange, ...others } = props;
  const [checked, setChecked] = useState(!!props.checked);
  return (
    <SchemaSettingsItem
      title={title}
      {...others}
      onClick={() => {
        onChange?.(!checked);
        setChecked(!checked);
      }}
    >
      <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
        {title}
        <Switch size={'small'} checked={checked} style={{ marginLeft: 32 }} />
      </div>
    </SchemaSettingsItem>
  );
};

export interface SchemaSettingsPopupProps extends SchemaSettingsItemProps {
  schema?: ISchema;
}
export const SchemaSettingsPopupItem: FC<SchemaSettingsPopupProps> = (props) => {
  const { schema, ...others } = props;
  const [visible, setVisible] = useState(false);
  const ctx = useContext(SchemaSettingsContext);
  return (
    <ActionContextProvider value={{ visible, setVisible }}>
      <SchemaSettingsItem
        title={props.title}
        {...others}
        onClick={() => {
          // actx.setVisible(false);
          ctx.setVisible(false);
          setVisible(true);
        }}
      >
        {props.children || props.title}
      </SchemaSettingsItem>
      <SchemaComponent
        schema={{
          name: uid(),
          ...schema,
        }}
      />
    </ActionContextProvider>
  );
};

export interface SchemaSettingsActionModalItemProps
  extends SchemaSettingsModalItemProps,
    Omit<SchemaSettingsItemProps, 'onSubmit' | 'onClick'> {
  uid?: string;
  initialSchema?: ISchema;
  schema?: ISchema;
  beforeOpen?: () => void;
  maskClosable?: boolean;
}
export const SchemaSettingsActionModalItem: FC<SchemaSettingsActionModalItemProps> = React.memo((props) => {
  const { title, onSubmit, initialValues, beforeOpen, initialSchema, schema, modalTip, components, scope, ...others } =
    props;
  const [visible, setVisible] = useState(false);
  const [schemaUid, setSchemaUid] = useState<string>(props.uid);
  const { t } = useTranslation();
  const fieldSchema = useFieldSchema();
  const ctx = useContext(SchemaSettingsContext);
  const { dn } = useSchemaSettings();
  const compile = useCompile();
  const api = useAPIClient();
  const upLevelActiveFields = useFormActiveFields();

  const form = useMemo(
    () =>
      createForm({
        initialValues: cloneDeep(initialValues),
        values: cloneDeep(initialValues),
      }),
    [initialValues],
  );

  useEffect(() => {
    form.setInitialValues(cloneDeep(initialValues));
  }, [JSON.stringify(initialValues || {})]);

  const cancelHandler = useCallback(() => {
    setVisible(false);
    form.reset();
  }, [form]);

  const submitHandler = useCallback(async () => {
    await form.submit();
    onSubmit?.(cloneDeep(form.values));
    setVisible(false);
  }, [form, onSubmit]);

  const openAssignedFieldValueHandler = useCallback(async () => {
    if (!schemaUid && initialSchema?.['x-uid']) {
      fieldSchema['x-action-settings'].schemaUid = initialSchema['x-uid'];
      dn.emit('patch', { schema: fieldSchema });
      await api.resource('uiSchemas').insert({ values: initialSchema });
      setSchemaUid(initialSchema['x-uid']);
    }
    if (typeof beforeOpen === 'function') {
      beforeOpen?.();
    }
    ctx.setVisible(false);
    setVisible(true);
  }, [api, ctx, dn, fieldSchema, initialSchema, schemaUid]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLLIElement>): void => e.stopPropagation(), []);
  return (
    <>
      <SchemaSettingsItem
        title={compile(title)}
        {...others}
        onClick={openAssignedFieldValueHandler}
        onKeyDown={onKeyDown}
      >
        {props.children || props.title}
      </SchemaSettingsItem>
      {createPortal(
        <Modal
          width={'50%'}
          title={compile(title)}
          {...others}
          destroyOnClose
          open={visible}
          onCancel={cancelHandler}
          footer={
            <Space>
              <Button onClick={cancelHandler}>{t('Cancel')}</Button>
              <Button type="primary" onClick={submitHandler}>
                {t('Submit')}
              </Button>
            </Space>
          }
        >
          <FormActiveFieldsProvider name="form" getActiveFieldsName={upLevelActiveFields?.getActiveFieldsName}>
            <FormProvider form={form}>
              <FormLayout layout={'vertical'}>
                {modalTip && <Alert message={modalTip} />}
                {modalTip && <br />}
                {visible && schemaUid && (
                  <RemoteSchemaComponent noForm components={components} scope={scope} uid={schemaUid} />
                )}
                {visible && schema && <SchemaComponent components={components} scope={scope} schema={schema} />}
              </FormLayout>
            </FormProvider>
          </FormActiveFieldsProvider>
        </Modal>,
        document.body,
      )}
    </>
  );
});
SchemaSettingsActionModalItem.displayName = 'SchemaSettingsActionModalItem';

export interface SchemaSettingsModalItemProps {
  title: string;
  onSubmit: (values: any) => void;
  initialValues?: any;
  schema?: ISchema | (() => ISchema);
  modalTip?: string;
  components?: any;
  hidden?: boolean;
  scope?: any;
  effects?: any;
  width?: string | number;
  children?: ReactNode;
  asyncGetInitialValues?: () => Promise<any>;
  eventKey?: string;
  hide?: boolean;
  /** 上下文中不需要当前记录 */
  noRecord?: boolean;
}
export const SchemaSettingsModalItem: FC<SchemaSettingsModalItemProps> = (props) => {
  const {
    hidden,
    title,
    components,
    scope,
    effects,
    onSubmit,
    asyncGetInitialValues,
    initialValues,
    width = 'fit-content',
    noRecord = false,
    ...others
  } = props;
  const options = useContext(SchemaOptionsContext);
  const collection = useCollection_deprecated();
  const apiClient = useAPIClient();
  const app = useApp();
  const { theme } = useGlobalTheme();
  const ctx = useBlockRequestContext();
  const upLevelActiveFields = useFormActiveFields();
  const { locale } = useContext(ConfigProvider.ConfigContext);
  const dm = useDataSourceManager();
  const dataSourceKey = useDataSourceKey();
  const record = useCollectionRecord();
  const { association } = useDataBlockProps() || {};
  const formCtx = useFormBlockContext();
  const blockOptions = useBlockContext();

  // 解决变量`当前对象`值在弹窗中丢失的问题
  const { formValue: subFormValue, collection: subFormCollection } = useSubFormValue();

  // 解决弹窗变量丢失的问题
  const popupRecordVariable = useCurrentPopupRecord();
  const parentPopupRecordVariable = useParentPopupRecord();

  if (hidden) {
    return null;
  }
  return (
    <SchemaSettingsItem
      title={title}
      {...others}
      onClick={async () => {
        const values = asyncGetInitialValues ? await asyncGetInitialValues() : initialValues;
        const schema = _.isFunction(props.schema) ? props.schema() : props.schema;
        FormDialog(
          { title: schema.title || title, width },
          () => {
            return (
              <BlockContext.Provider value={blockOptions}>
                <VariablePopupRecordProvider
                  recordData={popupRecordVariable?.value}
                  collection={popupRecordVariable?.collection}
                  parent={{
                    recordData: parentPopupRecordVariable?.value,
                    collection: parentPopupRecordVariable?.collection,
                  }}
                >
                  <CollectionRecordProvider record={noRecord ? null : record}>
                    <FormBlockContext.Provider value={formCtx}>
                      <SubFormProvider value={{ value: subFormValue, collection: subFormCollection }}>
                        <FormActiveFieldsProvider
                          name="form"
                          getActiveFieldsName={upLevelActiveFields?.getActiveFieldsName}
                        >
                          <Router location={location} navigator={null}>
                            <BlockRequestContext_deprecated.Provider value={ctx}>
                              <DataSourceApplicationProvider dataSourceManager={dm} dataSource={dataSourceKey}>
                                <AssociationOrCollectionProvider
                                  allowNull
                                  collection={collection.name}
                                  association={association}
                                >
                                  <SchemaComponentOptions scope={options.scope} components={options.components}>
                                    <FormLayout
                                      layout={'vertical'}
                                      className={css`
                                        // screen > 576px
                                        @media (min-width: 576px) {
                                          min-width: 520px;
                                        }

                                        // screen <= 576px
                                        @media (max-width: 576px) {
                                          min-width: 320px;
                                        }
                                      `}
                                    >
                                      <ApplicationContext.Provider value={app}>
                                        <APIClientProvider apiClient={apiClient}>
                                          <ConfigProvider locale={locale}>
                                            <SchemaComponent components={components} scope={scope} schema={schema} />
                                          </ConfigProvider>
                                        </APIClientProvider>
                                      </ApplicationContext.Provider>
                                    </FormLayout>
                                  </SchemaComponentOptions>
                                </AssociationOrCollectionProvider>
                              </DataSourceApplicationProvider>
                            </BlockRequestContext_deprecated.Provider>
                          </Router>
                        </FormActiveFieldsProvider>
                      </SubFormProvider>
                    </FormBlockContext.Provider>
                  </CollectionRecordProvider>
                </VariablePopupRecordProvider>
              </BlockContext.Provider>
            );
          },
          theme,
        )
          .open({
            initialValues: values,
            effects,
          })
          .then((values) => {
            onSubmit(values);
            return values;
          })
          .catch((err) => {
            console.error(err);
          });
      }}
    >
      {props.children || props.title}
    </SchemaSettingsItem>
  );
};

export const SchemaSettingsDefaultSortingRules = function DefaultSortingRules(props) {
  const { path = 'x-component-props.params.sort' } = props;
  const { t } = useTranslation();
  const { dn } = useDesignable();

  const fieldSchema = useFieldSchema();
  const field = useField();
  const title = props.title || t('Set default sorting rules');
  const { name } = useCollection_deprecated();
  const defaultSort = get(fieldSchema, path) || [];
  const sort = defaultSort?.map((item: string) => {
    return item.startsWith('-')
      ? {
          field: item.substring(1),
          direction: 'desc',
        }
      : {
          field: item,
          direction: 'asc',
        };
  });
  const sortFields = useSortFields(props.name || name);

  const onSubmit = async ({ sort }) => {
    if (props?.onSubmit) {
      return props.onSubmit({ sort });
    }
    const value = sort.map((item) => {
      return item.direction === 'desc' ? `-${item.field}` : item.field;
    });
    set(
      field,
      path.replace('x-component-props', 'componentProps').replace('x-decorator-props', 'decoratorProps'),
      value,
    );

    set(fieldSchema, path, value);
    await dn.emit('patch', {
      schema: fieldSchema,
    });
    return props.onSubmitAfter?.();
  };

  return (
    <SchemaSettingsModalItem
      title={title}
      components={{ ArrayItems }}
      schema={
        {
          type: 'object',
          title,
          properties: {
            sort: {
              type: 'array',
              default: sort,
              'x-component': 'ArrayItems',
              'x-decorator': 'FormItem',
              items: {
                type: 'object',
                properties: {
                  space: {
                    type: 'void',
                    'x-component': 'Space',
                    properties: {
                      sort: {
                        type: 'void',
                        'x-decorator': 'FormItem',
                        'x-component': 'ArrayItems.SortHandle',
                      },
                      field: {
                        type: 'string',
                        enum: sortFields,
                        required: true,
                        'x-decorator': 'FormItem',
                        'x-component': 'Select',
                        'x-component-props': {
                          style: {
                            width: 260,
                          },
                        },
                      },
                      direction: {
                        type: 'string',
                        'x-decorator': 'FormItem',
                        'x-component': 'Radio.Group',
                        'x-component-props': {
                          optionType: 'button',
                        },
                        enum: [
                          {
                            label: t('ASC'),
                            value: 'asc',
                          },
                          {
                            label: t('DESC'),
                            value: 'desc',
                          },
                        ],
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
              properties: {
                add: {
                  type: 'void',
                  title: t('Add sort field'),
                  'x-component': 'ArrayItems.Addition',
                },
              },
            },
          },
        } as ISchema
      }
      onSubmit={onSubmit}
    />
  );
};

export const SchemaSettingsLinkageRules = function LinkageRules(props) {
  const { collectionName, readPretty } = props;
  const fieldSchema = useFieldSchema();
  const { form } = useFormBlockContext();
  const { dn } = useDesignable();
  const { t } = useTranslation();
  const { getTemplateById } = useSchemaTemplateManager();
  const variables = useVariables();
  const localVariables = useLocalVariables();
  const record = useRecord();
  const { type: formBlockType } = useFormBlockType();
  const type = props?.type || fieldSchema?.['x-action'] ? 'button' : 'field';
  const gridSchema = findGridSchema(fieldSchema) || fieldSchema;
  const options = useLinkageCollectionFilterOptions(collectionName);
  const linkageOptions = useLinkageCollectionFieldOptions(collectionName, readPretty);
  const schema = useMemo<ISchema>(
    () => ({
      type: 'object',
      title: t('Linkage rules'),
      properties: {
        fieldReaction: {
          'x-component': FormLinkageRules,
          'x-use-component-props': () => {
            return {
              options,
              defaultValues: gridSchema?.['x-linkage-rules'] || fieldSchema?.['x-linkage-rules'],
              type,
              linkageOptions,
              collectionName,
              form,
              variables,
              localVariables,
              record,
              formBlockType,
            };
          },
        },
      },
    }),
    [collectionName, fieldSchema, form, gridSchema, localVariables, record, t, type, variables],
  );
  const components = useMemo(() => ({ ArrayCollapse, FormLayout }), []);
  const onSubmit = useCallback(
    (v) => {
      const rules = [];
      for (const rule of v.fieldReaction.rules) {
        rules.push(_.pickBy(rule, _.identity));
      }
      const templateId = gridSchema['x-component'] === 'BlockTemplate' && gridSchema['x-component-props']?.templateId;
      const uid = (templateId && getTemplateById(templateId).uid) || gridSchema['x-uid'];
      const schema = {
        ['x-uid']: uid,
      };

      gridSchema['x-linkage-rules'] = rules;
      schema['x-linkage-rules'] = rules;
      dn.emit('patch', {
        schema,
      });
      dn.refresh();
    },
    [dn, getTemplateById, gridSchema],
  );

  return (
    <SchemaSettingsModalItem
      title={t('Linkage rules')}
      components={components}
      width={770}
      schema={schema}
      onSubmit={onSubmit}
    />
  );
};

export const useDataTemplates = (schema?: Schema) => {
  const fieldSchema = useFieldSchema();

  if (schema) {
    return {
      templateData: _.cloneDeep(schema['x-data-templates']),
    };
  }

  const formSchema = findFormBlock(fieldSchema) || fieldSchema;
  return {
    templateData: _.cloneDeep(formSchema?.['x-data-templates']),
  };
};

export const SchemaSettingsDataTemplates = function DataTemplates(props) {
  const designerCtx = useContext(SchemaComponentContext);
  const { collectionName } = props;
  const fieldSchema = useFieldSchema();
  const { dn } = useDesignable();
  const { t } = useTranslation();
  const formSchema = findFormBlock(fieldSchema) || fieldSchema;
  const { templateData } = useDataTemplates();
  const schema = useMemo(
    () => ({
      type: 'object',
      title: t('Form data templates'),
      properties: {
        fieldReaction: {
          'x-decorator': (props) => <FlagProvider {...props} isInFormDataTemplate />,
          'x-component': FormDataTemplates,
          'x-use-component-props': () => {
            return {
              defaultValues: templateData,
              collectionName,
            };
          },
          'x-component-props': {
            designerCtx,
            formSchema,
          },
        },
      },
    }),
    [templateData],
  );
  const onSubmit = useCallback((v) => {
    const data = { ...(formSchema['x-data-templates'] || {}), ...v.fieldReaction };
    // 当 Tree 组件开启 checkStrictly 属性时，会导致 checkedKeys 的值是一个对象，而不是数组，所以这里需要转换一下以支持旧版本
    data.items.forEach((item) => {
      item.fields = Array.isArray(item.fields) ? item.fields : item.fields.checked;
    });

    const schema = {
      ['x-uid']: formSchema['x-uid'],
      ['x-data-templates']: data,
    };
    formSchema['x-data-templates'] = data;
    dn.emit('patch', {
      schema,
    });
    dn.refresh();
  }, []);
  const title = useMemo(() => t('Form data templates'), []);
  const components = useMemo(() => ({ ArrayCollapse, FormLayout }), []);

  return (
    <SchemaSettingsModalItem title={title} components={components} width={770} schema={schema} onSubmit={onSubmit} />
  );
};

export function SchemaSettingsEnableChildCollections(props) {
  const { collectionName } = props;
  const fieldSchema = useFieldSchema();
  const field = useField();
  const { dn } = useDesignable();
  const { t } = useTranslation();
  const allowAddToCurrent = fieldSchema?.['x-allow-add-to-current'];
  const { getCollectionJoinField } = useCollectionManager_deprecated();
  const ctx = useBlockRequestContext();
  const collectionField = getCollectionJoinField(fieldSchema?.parent?.['x-collection-field']) || {};
  const isAssocationAdd = fieldSchema?.parent?.['x-component'] === 'CollectionField';
  return (
    <SchemaSettingsModalItem
      title={t('Enable child collections')}
      components={{ ArrayItems, FormLayout }}
      scope={{ isAssocationAdd }}
      schema={
        {
          type: 'object',
          title: t('Enable child collections'),
          properties: {
            enableChildren: {
              'x-component': EnableChildCollections,
              'x-use-component-props': () => {
                return {
                  defaultValues: fieldSchema?.['x-enable-children'],
                  collectionName,
                };
              },
            },
            allowAddToCurrent: {
              type: 'boolean',
              'x-content': "{{t('Allow adding records to the current collection')}}",
              'x-decorator': 'FormItem',
              'x-component': 'Checkbox',
              default: allowAddToCurrent === undefined ? true : allowAddToCurrent,
            },
            linkageFromForm: {
              type: 'string',
              title: "{{t('Linkage with form fields')}}",
              'x-visible': '{{isAssocationAdd}}',
              'x-decorator': 'FormItem',
              'x-component': ChildDynamicComponent,
              'x-component-props': {
                rootCollection: ctx.props.collection || ctx.props.resource,
                collectionField,
              },
              default: fieldSchema?.['x-component-props']?.['linkageFromForm'],
            },
          },
        } as ISchema
      }
      onSubmit={(v) => {
        const enableChildren = [];
        for (const item of v.enableChildren.childrenCollections) {
          enableChildren.push(_.pickBy(item, _.identity));
        }
        const uid = fieldSchema['x-uid'];
        const schema = {
          ['x-uid']: uid,
        };
        fieldSchema['x-enable-children'] = enableChildren;
        fieldSchema['x-allow-add-to-current'] = v.allowAddToCurrent;
        fieldSchema['x-component-props'] = {
          ...fieldSchema['x-component-props'],
          component: 'CreateRecordAction',
          linkageFromForm: v?.linkageFromForm,
        };
        schema['x-enable-children'] = enableChildren;
        schema['x-allow-add-to-current'] = v.allowAddToCurrent;
        schema['x-component-props'] = {
          ...fieldSchema['x-component-props'],
          component: 'CreateRecordAction',
          linkageFromForm: v?.linkageFromForm,
        };
        field.componentProps['linkageFromForm'] = v.linkageFromForm;
        dn.emit('patch', {
          schema,
        });
        dn.refresh();
      }}
    />
  );
}

export const defaultInputStyle = css`
  & > .nb-form-item {
    flex: 1;
  }
`;

export const findParentFieldSchema = (fieldSchema: Schema) => {
  let parent = fieldSchema.parent;
  while (parent) {
    if (parent['x-component'] === 'CollectionField') {
      return parent;
    }
    parent = parent.parent;
  }
};

// 是否是系统字段
export const isSystemField = (collectionField: CollectionFieldOptions_deprecated, getInterface) => {
  const i = getInterface?.(collectionField?.interface);
  return i?.group === 'systemInfo';
};

export function getFieldDefaultValue(fieldSchema: ISchema, collectionField: CollectionFieldOptions_deprecated) {
  const result = fieldSchema?.default ?? collectionField?.defaultValue;
  return result;
}
