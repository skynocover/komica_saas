import React, { useContext } from 'react';
import { makeStyles, styled } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import Checkbox from '@material-ui/core/Checkbox';
import SendIcon from '@mui/icons-material/Send';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import { Formik, useField, useFormik } from 'formik';
import Button from '@material-ui/core/Button';
import { useRouter } from 'next/router';
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import FileUploadIcon from '@mui/icons-material/FileUpload';

import { AppContext, thread } from './AppContext';
import { isYoutubeURL, getYoutubeId } from '../utils/regex';

const useStyles = makeStyles((theme) => ({
  margin: { margin: theme.spacing(1) },
  extendedIcon: { marginRight: theme.spacing(1) },
}));

const toBase64 = (file: any) =>
  new Promise<any>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

interface FormProps {
  title: string;
  name: string;
  content: string;
  image: File | undefined;
  youtubeURL: string;
  sage: boolean;
}

export const PostForm = ({
  parentId,
  displayName,
}: {
  parentId?: string;
  displayName?: string;
}) => {
  const appCtx = useContext(AppContext);
  const classes = useStyles();
  const router = useRouter();
  const { t } = useTranslation();

  const formik = useFormik<FormProps>({
    initialValues: {
      title: '',
      name: displayName ? displayName : '',
      content: '',
      image: undefined,
      youtubeURL: '',
      sage: false,
    },
    validateOnChange: false,
    validate: (values) => {
      let errors: any = {};
      if (!parentId && !values.title) errors.title = t('TitleRequired');
      if (!values.content && !values.image && !values.youtubeURL)
        errors.content = t('ContentRequired');
      if (values.image && values.youtubeURL) errors.youtubeURL = t('ContentMultiple');
      if (values.image && values.image.size > 2048 * 1000) errors.image = t('ImageLimit');

      if (values.youtubeURL && !isYoutubeURL(values.youtubeURL))
        errors.youtubeURL = t('LinkFormatError');

      return errors;
    },
    onSubmit: async (values, action) => {
      const baseimage = values.image ? await toBase64(values.image) : '';
      const youtubeID = values.youtubeURL ? getYoutubeId(values.youtubeURL) : null;

      if (parentId) {
        const data = await appCtx.fetch('post', '/api/post/reply', {
          image: baseimage,
          youtubeID,
          content: values.content,
          name: values.name,
          sage: values.sage,
          parentId: parentId,
          serviceId: router.query.service as string,
        });

        if (data) {
          appCtx.setDrawOpen(false);
          appCtx.sanckBar(t('Reply') + t('Success'), 'success');
          formik.resetForm();
          router.reload();
        }
      } else {
        const data = await appCtx.fetch('post', '/api/post/thread', {
          title: values.title,
          image: baseimage,
          youtubeID,
          content: values.content,
          name: values.name,
          serviceId: router.query.service as string,
        });

        if (data) {
          appCtx.sanckBar(t('Post') + t('Success'), 'success');
          router.reload();
        }
      }
    },
  });

  // for upload input id
  const id = Math.floor(Math.random() * 1000).toString();

  return (
    <div className="flex justify-center">
      <div className="lg:w-1/3 md:w-1/2 sm:w-2/3 w-full grid grid-cols-1">
        {!parentId && (
          <TextField
            error={formik.errors.title ? true : false}
            helperText={formik.errors.title}
            name="title"
            label={t('Title')}
            variant="filled"
            value={formik.values.title}
            onChange={formik.handleChange}
          />
        )}

        <TextField
          name="name"
          disabled={!!displayName}
          label={t('Name')}
          variant="filled"
          value={formik.values.name}
          onChange={formik.handleChange}
        />
        <TextField
          error={formik.errors.content ? true : false}
          helperText={formik.errors.content}
          name="content"
          onChange={formik.handleChange}
          multiline
          rows={4}
          label={t('Content')}
          variant="filled"
          value={formik.values.content}
          placeholder={t('MarkdownUsable')}
        />
        <TextField
          error={formik.errors.youtubeURL ? true : false}
          helperText={formik.errors.youtubeURL}
          name="youtubeURL"
          label={t('YoutubeLink')}
          variant="filled"
          value={formik.values.youtubeURL}
          onChange={formik.handleChange}
        />

        <div className="flex items-center mt-1">
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id={id}
            type="file"
            onChange={(e) => {
              const files = e?.target?.files!;
              formik.setFieldValue('image', files[0]);
            }}
          />
          <label htmlFor={id} className="justify-center">
            <Button variant="contained" component="span">
              <FileUploadIcon />
            </Button>
          </label>

          <div className="flex-1">{formik.values.image?.name}</div>
          {<span className="text-red-600"> {formik.errors.image}</span>}

          {parentId && (
            <Tooltip title={t('CheckIfTweetLess') || 'title'}>
              <FormControlLabel
                value="sage"
                control={
                  <Checkbox onChange={(e) => formik.setFieldValue('sage', e?.target?.checked)} />
                }
                label="sage"
                labelPlacement="end"
              />
            </Tooltip>
          )}

          <Button variant="contained" color="primary" onClick={() => formik.handleSubmit()}>
            <SendIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};
