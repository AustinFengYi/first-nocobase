/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { DragOutlined, MenuOutlined, PlusOutlined } from '@ant-design/icons';
import { css } from '@emotion/css';
import { useField, useFieldSchema } from '@formily/react';
import { Space } from 'antd';
import classNames from 'classnames';
import React, { FC, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SchemaInitializer, SchemaSettings, SchemaToolbarProvider, useSchemaInitializerRender } from '../application';
import { useSchemaSettingsRender } from '../application/schema-settings/hooks/useSchemaSettingsRender';
import { useDataSourceManager } from '../data-source/data-source/DataSourceManagerProvider';
import { useDataSource } from '../data-source/data-source/DataSourceProvider';
import { DragHandler, useCompile, useDesignable, useGridContext, useGridRowContext } from '../schema-component';
import { gridRowColWrap } from '../schema-initializer/utils';
import { SchemaSettingsDropdown } from './SchemaSettings';
import { useGetAriaLabelOfDesigner } from './hooks/useGetAriaLabelOfDesigner';
import { useStyles } from './styles';

const titleCss = css`
  pointer-events: none;
  position: absolute;
  font-size: 12px;
  /* background: var(--colorSettings);
  color: #fff; */
  padding: 0;
  line-height: 16px;
  height: 16px;
  border-bottom-right-radius: 2px;
  border-radius: 2px;
  top: 2px;
  left: 2px;
  .title-tag {
    padding: 0 3px;
    border-radius: 2px;
    background: var(--colorSettings);
    color: #fff;
    display: block;
  }
`;

const overrideAntdCSS = css`
  & .ant-space-item .anticon {
    margin: 0;
  }

  &:hover {
    display: block !important;
  }
`;

export interface GeneralSchemaDesignerProps {
  disableInitializer?: boolean;
  title?: string;
  template?: any;
  schemaSettings?: string;
  contextValue?: any;
  /**
   * @default true
   */
  draggable?: boolean;
  showDataSource?: boolean;
}

/**
 * @deprecated use `SchemaToolbar` instead
 */
export const GeneralSchemaDesigner: FC<GeneralSchemaDesignerProps> = (props: any) => {
  const fieldSchema = useFieldSchema();
  const {
    disableInitializer,
    title,
    template,
    schemaSettings,
    contextValue,
    draggable = true,
    showDataSource = true,
  } = { ...props, ...(fieldSchema['x-toolbar-props'] || {}) } as GeneralSchemaDesignerProps;
  const { dn, designable } = useDesignable();
  const field = useField();
  const { t } = useTranslation();
  const compile = useCompile();
  const { getAriaLabel } = useGetAriaLabelOfDesigner();
  const schemaSettingsProps = {
    dn,
    field,
    fieldSchema,
  };
  const { render: schemaSettingsRender, exists: schemaSettingsExists } = useSchemaSettingsRender(
    fieldSchema['x-settings'] || schemaSettings,
    fieldSchema['x-settings-props'],
  );
  const rowCtx = useGridRowContext();
  const ctx = useGridContext();
  const dm = useDataSourceManager();
  const dataSources = dm?.getDataSources();
  const dataSourceContext = useDataSource();
  const dataSource = dataSources?.length > 1 && dataSourceContext;
  const templateName = ['FormItem', 'ReadPrettyFormItem'].includes(template?.componentName)
    ? `${template?.name} ${t('(Fields only)')}`
    : template?.name;
  const initializerProps = useMemo(() => {
    return {
      insertPosition: 'afterEnd',
      wrap: rowCtx?.cols?.length > 1 ? undefined : gridRowColWrap,
      Component: (props: any) => (
        <PlusOutlined
          {...props}
          role="button"
          aria-label={getAriaLabel('schema-initializer')}
          style={{ cursor: 'pointer', fontSize: 14 }}
        />
      ),
    };
  }, [getAriaLabel, rowCtx?.cols?.length]);

  if (!designable) {
    return null;
  }
  return (
    <SchemaToolbarProvider {...contextValue}>
      <div className={classNames('general-schema-designer', overrideAntdCSS)}>
        {title && (
          <div className={classNames('general-schema-designer-title', titleCss)}>
            <Space size={2}>
              <span className={'title-tag'}>
                {showDataSource && dataSource
                  ? `${compile(dataSource?.displayName)} > ${compile(title)}`
                  : compile(title)}
              </span>
              {template && (
                <span className={'title-tag'}>
                  {t('Reference template')}: {templateName || t('Untitled')}
                </span>
              )}
            </Space>
          </div>
        )}
        <div className={'general-schema-designer-icons'}>
          <Space size={3} align={'center'}>
            {draggable && (
              <DragHandler>
                <DragOutlined role="button" aria-label={getAriaLabel('drag-handler')} />
              </DragHandler>
            )}
            {!disableInitializer &&
              (ctx?.InitializerComponent ? (
                <ctx.InitializerComponent {...initializerProps} />
              ) : (
                ctx?.renderSchemaInitializer?.(initializerProps)
              ))}
            {schemaSettingsExists ? (
              schemaSettingsRender(contextValue)
            ) : (
              <SchemaSettingsDropdown
                title={
                  <MenuOutlined
                    role="button"
                    aria-label={getAriaLabel('schema-settings')}
                    style={{ cursor: 'pointer', fontSize: 12 }}
                  />
                }
                {...schemaSettingsProps}
              >
                {props.children}
              </SchemaSettingsDropdown>
            )}
          </Space>
        </div>
      </div>
    </SchemaToolbarProvider>
  );
};

export interface SchemaToolbarProps {
  title?: string | string[];
  draggable?: boolean;
  initializer?: string | SchemaInitializer<any> | false;
  settings?: string | SchemaSettings<any> | false;
  /**
   * @default true
   */
  showBorder?: boolean;
  showBackground?: boolean;
}

const InternalSchemaToolbar: FC<SchemaToolbarProps> = (props) => {
  const fieldSchema = useFieldSchema();
  const {
    title,
    initializer,
    settings,
    showBackground,
    showBorder = true,
    draggable = true,
  } = {
    ...props,
    ...(fieldSchema['x-toolbar-props'] || {}),
  } as SchemaToolbarProps;
  const { designable } = useDesignable();
  const compile = useCompile();
  const { styles } = useStyles();
  const { t } = useTranslation();
  const { getAriaLabel } = useGetAriaLabelOfDesigner();
  const dm = useDataSourceManager();
  const dataSources = dm?.getDataSources();
  const dataSourceContext = useDataSource();
  const dataSource = dataSources?.length > 1 && dataSourceContext;

  const titleArr = useMemo(() => {
    if (!title) return undefined;
    if (typeof title === 'string') return [compile(title)];
    if (Array.isArray(title)) return title.map((item) => compile(item));
  }, [compile, title]);
  const { render: schemaSettingsRender, exists: schemaSettingsExists } = useSchemaSettingsRender(
    settings || fieldSchema['x-settings'],
    fieldSchema['x-settings-props'],
  );
  const { render: schemaInitializerRender, exists: schemaInitializerExists } = useSchemaInitializerRender(
    initializer || fieldSchema['x-initializer'],
    fieldSchema['x-initializer-props'],
  );
  const rowCtx = useGridRowContext();
  const gridContext = useGridContext();
  const initializerProps: any = useMemo(() => {
    return {
      insertPosition: 'afterEnd',
      wrap: rowCtx?.cols?.length === 1 ? gridRowColWrap : undefined,
      Component: (props: any) => (
        <PlusOutlined
          {...props}
          role="button"
          aria-label={getAriaLabel('schema-initializer')}
          style={{ cursor: 'pointer', fontSize: 14 }}
        />
      ),
    };
  }, [getAriaLabel, rowCtx?.cols?.length]);

  const dragElement = useMemo(() => {
    if (draggable === false) return null;
    return (
      <DragHandler>
        <DragOutlined role="button" aria-label={getAriaLabel('drag-handler')} />
      </DragHandler>
    );
  }, [draggable, getAriaLabel]);

  const initializerElement = useMemo(() => {
    if (initializer === false) return null;
    if (schemaInitializerExists) {
      return schemaInitializerRender(initializerProps);
    }
    if (gridContext?.InitializerComponent || gridContext?.renderSchemaInitializer) {
      return gridContext?.InitializerComponent ? (
        <gridContext.InitializerComponent {...initializerProps} />
      ) : (
        gridContext.renderSchemaInitializer?.(initializerProps)
      );
    }
  }, [gridContext, initializer, initializerProps, schemaInitializerExists, schemaInitializerRender]);

  const settingsElement = useMemo(() => {
    return settings !== false && schemaSettingsExists ? schemaSettingsRender() : null;
  }, [schemaSettingsExists, schemaSettingsRender, settings]);

  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const toolbarElement = toolbarRef.current;
    let parentElement = toolbarElement?.parentElement;
    while (parentElement && window.getComputedStyle(parentElement).height === '0px') {
      parentElement = parentElement.parentElement;
    }
    if (!parentElement) {
      return;
    }

    function show() {
      if (toolbarElement) {
        toolbarElement.style.display = 'block';
      }
    }

    function hide() {
      if (toolbarElement) {
        toolbarElement.style.display = 'none';
      }
    }

    const style = window.getComputedStyle(parentElement);
    if (style.position === 'static') {
      parentElement.style.position = 'relative';
    }

    parentElement.addEventListener('mouseenter', show);
    parentElement.addEventListener('mouseleave', hide);

    return () => {
      parentElement.removeEventListener('mouseenter', show);
      parentElement.removeEventListener('mouseleave', hide);
    };
  }, []);

  if (!designable) {
    return null;
  }

  return (
    <div
      ref={toolbarRef}
      className={styles.toolbar}
      style={{ border: showBorder ? 'auto' : 0, background: showBackground ? 'auto' : 0 }}
    >
      {titleArr && (
        <div className={styles.toolbarTitle}>
          <Space size={2}>
            <span key={titleArr[0]} className={styles.toolbarTitleTag}>
              {dataSource ? `${compile(dataSource?.displayName)} > ${titleArr[0]}` : titleArr[0]}
            </span>
            {titleArr[1] && (
              <span className={styles.toolbarTitleTag}>
                {`${t('Reference template')}: ${`${titleArr[1]}` || t('Untitled')}`}
              </span>
            )}
          </Space>
        </div>
      )}
      <div className={styles.toolbarIcons}>
        <Space size={3} align={'center'}>
          {dragElement}
          {initializerElement}
          {settingsElement}
        </Space>
      </div>
    </div>
  );
};

export const SchemaToolbar: FC<SchemaToolbarProps> = (props) => {
  const { designable } = useDesignable();

  if (!designable) {
    return null;
  }

  return <InternalSchemaToolbar {...props} />;
};
