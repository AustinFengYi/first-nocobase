/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { DeleteOutlined, DownloadOutlined, InboxOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Field } from '@formily/core';
import { connect, mapProps, mapReadPretty, useField } from '@formily/react';
import { Upload as AntdUpload, Button, Modal, Progress, Space, Tooltip } from 'antd';
import useUploadStyle from 'antd/es/upload/style';
import cls from 'classnames';
import { saveAs } from 'file-saver';
import filesize from 'filesize';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LightBox from 'react-image-lightbox';
import 'react-image-lightbox/style.css'; // This only needs to be imported once in your app
import { withDynamicSchemaProps } from '../../../hoc/withDynamicSchemaProps';
import { useProps } from '../../hooks/useProps';
import {
  FILE_SIZE_LIMIT_DEFAULT,
  isImage,
  isPdf,
  normalizeFile,
  toFileList,
  toValueItem,
  useBeforeUpload,
  useUploadProps,
} from './shared';
import { useStyles } from './style';
import type { ComposedUpload, DraggerProps, DraggerV2Props, UploadProps } from './type';

function InternalUpload(props: UploadProps) {
  const { onChange, ...rest } = props;
  const onFileChange = useCallback(
    (info) => {
      onChange?.(toFileList(info.fileList));
    },
    [onChange],
  );
  return <AntdUpload {...useUploadProps(rest)} onChange={onFileChange} />;
}

function ReadPretty({ value, onChange, disabled, multiple, size }: UploadProps) {
  const { wrapSSR, hashId, componentCls: prefixCls } = useStyles();
  const useUploadStyleVal = (useUploadStyle as any).default ? (useUploadStyle as any).default : useUploadStyle;
  // 加载 antd 的样式
  useUploadStyleVal(prefixCls);

  return wrapSSR(
    <div
      className={cls(
        `${prefixCls}-wrapper`,
        `${prefixCls}-picture-card-wrapper`,
        `nb-upload`,
        size ? `nb-upload-${size}` : null,
        hashId,
      )}
    >
      <div className={cls(`${prefixCls}-list`, `${prefixCls}-list-picture-card`)}>
        <AttachmentList disabled={disabled} readPretty multiple={multiple} value={value} onChange={onChange} />
      </div>
    </div>,
  );
}

export const Upload: ComposedUpload = connect(
  InternalUpload,
  mapProps({
    value: 'fileList',
  }),
  mapReadPretty(ReadPretty),
);

Upload.ReadPretty = ReadPretty;

function useSizeHint(size: number) {
  const s = size ?? FILE_SIZE_LIMIT_DEFAULT;
  const { t, i18n } = useTranslation();
  const sizeString = filesize(s, { base: 2, standard: 'jedec', locale: i18n.language });
  return s !== 0 ? t('File size should not exceed {{size}}.', { size: sizeString }) : '';
}

function AttachmentListItem(props) {
  const { file, disabled, onPreview, onDelete: propsOnDelete, readPretty } = props;
  const { componentCls: prefixCls } = useStyles();
  const { t } = useTranslation();
  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      onPreview?.(file);
    },
    [file, onPreview],
  );
  const onDelete = useCallback(() => {
    propsOnDelete?.(file);
  }, [file, propsOnDelete]);
  const onDownload = useCallback(() => {
    saveAs(file.url, `${file.title}${file.extname}`);
  }, [file]);

  const item = [
    <span key="thumbnail" className={`${prefixCls}-list-item-thumbnail`}>
      {file.imageUrl && (
        <img
          src={`${file.imageUrl}${file.thumbnailRule || ''}`}
          alt={file.title}
          className={`${prefixCls}-list-item-image`}
        />
      )}
    </span>,
    <span key="title" className={`${prefixCls}-list-item-name`} title={file.title}>
      {file.status === 'uploading' ? t('Uploading') : file.title}
    </span>,
  ];
  const wrappedItem = file.id ? (
    <a target="_blank" rel="noopener noreferrer" href={file.url} onClick={handleClick}>
      {item}
    </a>
  ) : (
    <span className={`${prefixCls}-span`}>{item}</span>
  );

  const content = (
    <div
      className={cls(
        `${prefixCls}-list-item`,
        `${prefixCls}-list-item-${file.status ?? 'done'}`,
        `${prefixCls}-list-item-list-type-picture-card`,
      )}
    >
      <div className={`${prefixCls}-list-item-info`}>{wrappedItem}</div>
      <span className={`${prefixCls}-list-item-actions`}>
        <Space size={3}>
          {!readPretty && file.id && (
            <Button size={'small'} type={'text'} icon={<DownloadOutlined />} onClick={onDownload} />
          )}
          {!readPretty && !disabled && file.status !== 'uploading' && (
            <Button size={'small'} type={'text'} icon={<DeleteOutlined />} onClick={onDelete} />
          )}
        </Space>
      </span>
      {file.status === 'uploading' && (
        <div className={`${prefixCls}-list-item-progress`}>
          <Progress strokeWidth={4} type={'line'} showInfo={false} percent={Number(file.percent)} />
        </div>
      )}
    </div>
  );

  return (
    <div className={`${prefixCls}-list-picture-card-container ${prefixCls}-list-item-container`}>
      {file.status === 'error' ? (
        <Tooltip title={file.response} getPopupContainer={(node) => node.parentNode as HTMLElement}>
          {content}
        </Tooltip>
      ) : (
        content
      )}
    </div>
  );
}

const PreviewerTypes = [
  {
    matcher: isImage,
    Component({ index, list, onSwitchIndex }) {
      const onDownload = useCallback(
        (e) => {
          e.preventDefault();
          const file = list[index];
          saveAs(file.url, `${file.title}${file.extname}`);
        },
        [index, list],
      );
      return (
        <LightBox
          // discourageDownloads={true}
          mainSrc={list[index]?.imageUrl}
          nextSrc={list[(index + 1) % list.length]?.imageUrl}
          prevSrc={list[(index + list.length - 1) % list.length]?.imageUrl}
          onCloseRequest={() => onSwitchIndex(null)}
          onMovePrevRequest={() => onSwitchIndex((index + list.length - 1) % list.length)}
          onMoveNextRequest={() => onSwitchIndex((index + 1) % list.length)}
          imageTitle={list[index]?.title}
          toolbarButtons={[
            <button
              key={'preview-img'}
              style={{ fontSize: 22, background: 'none', lineHeight: 1 }}
              type="button"
              aria-label="Download"
              title="Download"
              className="ril-zoom-in ril__toolbarItemChild ril__builtinButton"
              onClick={onDownload}
            >
              <DownloadOutlined />
            </button>,
          ]}
        />
      );
    },
  },
  {
    matcher: isPdf,
    Component({ index, list, onSwitchIndex }) {
      const { t } = useTranslation();
      const onDownload = useCallback(
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          const file = list[index];
          saveAs(file.url, `${file.title}${file.extname}`);
        },
        [index, list],
      );
      const onClose = useCallback(() => {
        onSwitchIndex(null);
      }, [onSwitchIndex]);
      return (
        <Modal
          open={index != null}
          title={'PDF - ' + list[index].title}
          onCancel={onClose}
          footer={[
            <Button
              key="download"
              style={{
                textTransform: 'capitalize',
              }}
              onClick={onDownload}
            >
              {t('Download')}
            </Button>,
            <Button key="close" onClick={onClose} style={{ textTransform: 'capitalize' }}>
              {t('Close')}
            </Button>,
          ]}
          width={'85vw'}
          centered={true}
        >
          <div
            style={{
              padding: '8px',
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 256px)',
              height: '90vh',
              width: '100%',
              background: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              overflowY: 'auto',
            }}
          >
            <iframe
              src={list[index].url}
              style={{
                width: '100%',
                maxHeight: '90vh',
                flex: '1 1 auto',
              }}
            />
          </div>
        </Modal>
      );
    },
  },
];

function Previewer({ index, onSwitchIndex, list }) {
  if (index == null) {
    return null;
  }
  const file = list[index];
  const { Component } = PreviewerTypes.find((type) => type.matcher(file)) ?? {};
  if (!Component) {
    return null;
  }

  return <Component index={index} list={list} onSwitchIndex={onSwitchIndex} />;
}

export function AttachmentList(props) {
  const { disabled, multiple, value, onChange, readPretty } = props;
  const [fileList, setFileList] = useState<any[]>([]);
  const [preview, setPreview] = useState<number>(null);

  useEffect(() => {
    const list = toFileList(value);
    setFileList(list);
  }, [value]);

  const onPreview = useCallback(
    (file) => {
      const index = fileList.findIndex((item) => item.id === file.id);
      const previewType = PreviewerTypes.find((type) => type.matcher(file));
      if (previewType) {
        setPreview(index);
      } else {
        if (file.id) {
          saveAs(file.url, `${file.title}${file.extname}`);
        }
      }
    },
    [fileList],
  );

  const onDelete = useCallback(
    (file) => {
      if (multiple) {
        onChange(value.filter((item) => item.id !== file.id));
      } else {
        onChange(null);
      }
    },
    [multiple, onChange, value],
  );

  return (
    <>
      {fileList.map((file, index) => (
        <AttachmentListItem
          key={file.id}
          file={file}
          index={index}
          disabled={disabled}
          onPreview={onPreview}
          onDelete={onDelete}
          readPretty={readPretty}
        />
      ))}
      <Previewer index={preview} onSwitchIndex={setPreview} list={fileList} />
    </>
  );
}

export function Uploader({ rules, ...props }: UploadProps) {
  const { disabled, multiple, value, onChange } = props;
  const [pendingList, setPendingList] = useState<any[]>([]);
  const { t } = useTranslation();
  const { componentCls: prefixCls } = useStyles();
  const field = useField<Field>();

  const uploadProps = useUploadProps(props);

  const beforeUpload = useBeforeUpload(rules);

  useEffect(() => {
    if (pendingList.length) {
      field.setFeedback({
        type: 'error',
        code: 'ValidateError',
        messages: [t('Incomplete uploading files need to be resolved')],
      });
    } else {
      field.setFeedback({});
    }
  }, [field, pendingList]);

  const onUploadChange = useCallback(
    (info) => {
      if (multiple) {
        const uploadedList = info.fileList.filter((file) => file.status === 'done');
        if (uploadedList.length) {
          const valueList = [...(value ?? []), ...uploadedList.map(toValueItem)];
          onChange?.(valueList);
        }
        setPendingList(info.fileList.filter((file) => file.status !== 'done').map(normalizeFile));
      } else {
        // NOTE: 用 fileList 里的才有附加的验证状态信息，file 没有（不清楚为何）
        const file = info.fileList.find((f) => f.uid === info.file.uid);
        if (file.status === 'done') {
          onChange?.(toValueItem(file));
          setPendingList([]);
        } else {
          setPendingList([normalizeFile(file)]);
        }
      }
    },
    [value, multiple, onChange],
  );

  const onDelete = useCallback((file) => {
    setPendingList((prevPendingList) => {
      const index = prevPendingList.indexOf(file);
      prevPendingList.splice(index, 1);
      return [...prevPendingList];
    });
  }, []);

  const { mimetype: accept, size } = rules ?? {};
  const sizeHint = useSizeHint(size);
  const selectable =
    !disabled && (multiple || ((!value || (Array.isArray(value) && !value.length)) && !pendingList.length));

  return (
    <>
      {pendingList.map((file, index) => (
        <AttachmentListItem key={file.uid} file={file} index={index} disabled={disabled} onDelete={onDelete} />
      ))}
      <div
        className={cls(`${prefixCls}-list-picture-card-container`, `${prefixCls}-list-item-container`)}
        style={
          selectable
            ? {}
            : {
                display: 'none',
              }
        }
      >
        <Tooltip title={sizeHint}>
          <AntdUpload
            accept={accept}
            {...uploadProps}
            disabled={disabled}
            multiple={multiple}
            listType={'picture-card'}
            fileList={pendingList}
            beforeUpload={beforeUpload}
            onChange={onUploadChange}
            showUploadList={false}
          >
            {selectable ? (
              <span>
                <PlusOutlined />
                <br /> {t('Upload')}
              </span>
            ) : null}
          </AntdUpload>
        </Tooltip>
      </div>
    </>
  );
}

function Attachment(props: UploadProps) {
  const { wrapSSR, hashId, componentCls: prefixCls } = useStyles();

  return wrapSSR(
    <div className={cls(`${prefixCls}-wrapper`, `${prefixCls}-picture-card-wrapper`, 'nb-upload', hashId)}>
      <div className={cls(`${prefixCls}-list`, `${prefixCls}-list-picture-card`)}>
        <AttachmentList {...props} />
        <Uploader {...props} />
      </div>
    </div>,
  );
}

Attachment.ReadPretty = ReadPretty;

Upload.Attachment = withDynamicSchemaProps(connect(Attachment, mapReadPretty(Attachment.ReadPretty)), {
  displayName: 'Upload.Attachment',
});

Upload.Dragger = connect(
  (props: DraggerProps) => {
    const { tipContent, onChange, ...rest } = props;
    const { wrapSSR, hashId, componentCls: prefixCls } = useStyles();
    const onFileChange = useCallback(
      (info) => {
        onChange?.(toFileList(info.fileList));
      },
      [onChange],
    );
    return wrapSSR(
      <div className={cls(`${prefixCls}-dragger`, hashId)}>
        <AntdUpload.Dragger {...useUploadProps(rest)} onChange={onFileChange}>
          {tipContent}
          {props.children}
        </AntdUpload.Dragger>
      </div>,
    );
  },
  mapProps({
    value: 'fileList',
  }),
);

Upload.DraggerV2 = withDynamicSchemaProps(
  connect(
    ({ rules, ...props }: DraggerV2Props) => {
      const { t } = useTranslation();
      const defaultTitle = t('Click or drag file to this area to upload');

      // 新版 UISchema（1.0 之后）中已经废弃了 useProps，这里之所以继续保留是为了兼容旧版的 UISchema
      const { title = defaultTitle, ...extraProps } = useProps(props);

      const [loading, setLoading] = useState(false);
      const { wrapSSR, hashId, componentCls: prefixCls } = useStyles();

      const beforeUpload = useBeforeUpload(rules);
      const { size, mimetype: accept } = rules ?? {};
      const sizeHint = useSizeHint(size);
      const handleChange = useCallback(
        ({ fileList }) => {
          const { onChange } = extraProps;
          onChange?.(fileList);

          if (fileList.some((file) => file.status === 'uploading')) {
            setLoading(true);
          } else {
            setLoading(false);
          }
        },
        [extraProps],
      );

      return wrapSSR(
        <div className={cls(`${prefixCls}-dragger`, hashId)}>
          {/* @ts-ignore */}
          <AntdUpload.Dragger
            {...useUploadProps({ ...props, ...extraProps, accept, onChange: handleChange, beforeUpload })}
          >
            <p className={`${prefixCls}-drag-icon`}>
              {loading ? <LoadingOutlined style={{ fontSize: 36 }} spin /> : <InboxOutlined />}
            </p>
            <p className={`${prefixCls}-text`}>{title}</p>
            <ul>
              <li className={`${prefixCls}-hint`}>{t('Support for a single or bulk upload.')}</li>
              <li className={`${prefixCls}-hint`}>{sizeHint}</li>
            </ul>
          </AntdUpload.Dragger>
        </div>,
      );
    },
    mapProps({
      value: 'fileList',
    }),
  ),
  { displayName: 'Upload.DraggerV2' },
);

export default Upload;
