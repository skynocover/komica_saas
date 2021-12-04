import React, { useContext } from 'react';

import TextField from '@material-ui/core/TextField';
import Fab from '@material-ui/core/Fab';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import NavigationIcon from '@material-ui/icons/Navigation';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { Formik, useFormik } from 'formik';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

import { AppContext } from './AppContext';

export const ReportForm = ({ id }: { id: string }) => {
  const appCtx = useContext(AppContext);
  const router = useRouter();
  const { t } = useTranslation();

  const useStyles = makeStyles((theme) => ({
    formControl: { margin: theme.spacing(1), minWidth: 120 },
  }));

  const classes = useStyles();

  const formik = useFormik({
    initialValues: { reason: 'del', content: '' },
    validateOnChange: false,
    validate: (values) => {
      let errors: any = {};
      if (!values.content) errors.content = '回報內容必填';
      return errors;
    },
    onSubmit: async (values, action) => {
      appCtx
        .fetch('post', '/api/post/report', {
          postId: id,
          reason: values.reason,
          content: values.content,
          serviceId: router.query.service as string,
        })
        .then(() => {
          appCtx.setDrawOpen(false);
          appCtx.sanckBar(t('Report') + t('Success'), 'success');
          formik.resetForm();
        });
    },
  });

  return (
    <div className="flex justify-center">
      <div className="lg:w-1/3 md:w-1/2 sm:w-2/3 w-full grid grid-cols-1 ">
        <FormControl variant="filled" className={classes.formControl}>
          <InputLabel id="demo-simple-select-filled-label">{t('ReportReason')}</InputLabel>
          <Select
            labelId="demo-simple-select-filled-label"
            id="demo-simple-select-filled"
            name="reason"
            value={formik.values.reason}
            onChange={formik.handleChange}
          >
            <MenuItem value={'del'}>{t('DeleteRequest')}</MenuItem>
            <MenuItem value={'war'}>{t('HateSpeech')}</MenuItem>
          </Select>
        </FormControl>
        <TextField
          id="filled-basic"
          multiline
          error={formik.errors.content ? true : false}
          helperText={formik.errors.content}
          rows={4}
          label={t('ReportContent')}
          variant="filled"
          placeholder={t('MarkdownUsable')}
          name="content"
          onChange={formik.handleChange}
        />
        <Fab
          variant="extended"
          color="primary"
          aria-label="add"
          size="small"
          onClick={() => formik.handleSubmit()}
        >
          <NavigationIcon />
          {t('Report')}
        </Fab>
      </div>
    </div>
  );
};
