import React, { useContext } from 'react';
import { makeStyles, styled } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import { Formik, useField, useFormik } from 'formik';
import { useRouter } from 'next/router';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { AppContext, thread } from './AppContext';
import { FormInstance } from 'antd/lib/form';
import { ColumnsType } from 'antd/lib/table';
import * as antd from 'antd';
import AddIcon from '@mui/icons-material/Add';
import BlockIcon from '@mui/icons-material/Block';
import { MainPage } from './MainPage';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import MenuItem from '@material-ui/core/MenuItem';
import NavigationIcon from '@material-ui/icons/Navigation';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import { auth, auth2Int, int2Auth, ServiceAuth, authText } from '../utils/serviceAuth';

const useStyles = makeStyles((theme) => ({
  margin: { margin: theme.spacing(1) },
  extendedIcon: { marginRight: theme.spacing(1) },
}));

interface FormProps {
  name: string;
  description: string;
  limitPostCount: number;
  limitPostMin: number;
  moderatorName: string;
  // link: Link[];
}

interface Link {
  name: string;
  url: string;
}

export interface service {
  createdAt: string;
  id: string;
  name: string;
  topLink: Link[];
  headLink: Link[];
  forbidContents: string[];
  description: string;
  moderatorName: string;
  limitPostCount: number;
  limitPostMin: number;
  ownerId: string;
  auth: {
    visible: auth;
    thread: auth;
    reply: auth;
    report: auth;
  };
  Owner: {
    account: string;
  };
}

export const Service = ({ service, finish }: { service?: service; finish: any }) => {
  const appCtx = useContext(AppContext);
  const router = useRouter();

  const classes = useStyles();

  const [topLinks, setTopLinks] = React.useState<Link[]>(service ? service.topLink : []);
  const [headLinks, setHeadLinks] = React.useState<Link[]>(service ? service.headLink : []);
  const [forbidContents, setForbidContents] = React.useState<string[]>(
    service ? service.forbidContents : [],
  );

  const [selectModel, setSelectModel] = React.useState<number>(1);

  const [auth, setAuth] = React.useState<ServiceAuth>({
    visible: service ? service.auth.visible : 'allowAnonymous',
    thread: service ? service.auth.thread : 'anonymous',
    reply: service ? service.auth.reply : 'anonymous',
    report: service ? service.auth.report : 'allowAnonymous',
  });

  const addTopLink = (i: number) => {
    setTopLinks((preState) => {
      preState.splice(i + 1, 0, { name: '', url: '' });
      return [...preState];
    });
  };

  const delTopLink = (i: number) => {
    setTopLinks((preState) => {
      return preState.filter((value, index) => index !== i);
    });
  };

  const changeTopURL = (i: number, input: string) => {
    setTopLinks((preState) => {
      return preState.map((item, index) => {
        let temp = { ...item };
        if (index === i) temp.url = input;
        return temp;
      });
    });
  };

  const changeTopName = (i: number, input: string) => {
    setTopLinks((preState) => {
      return preState.map((item, index) => {
        let temp = { ...item };
        if (index === i) temp.name = input;
        return temp;
      });
    });
  };

  const addHeadLink = (i: number) => {
    setHeadLinks((preState) => {
      preState.splice(i + 1, 0, { name: '', url: '' });
      return [...preState];
    });
  };

  const delHeadLink = (i: number) => {
    setHeadLinks((preState) => {
      return preState.filter((value, index) => index !== i);
    });
  };

  const changeHeadURL = (i: number, input: string) => {
    setHeadLinks((preState) => {
      return preState.map((item, index) => {
        let temp = { ...item };
        if (index === i) temp.url = input;
        return temp;
      });
    });
  };

  const changeHeadName = (i: number, input: string) => {
    setHeadLinks((preState) => {
      return preState.map((item, index) => {
        let temp = { ...item };
        if (index === i) temp.name = input;
        return temp;
      });
    });
  };

  const addForbidContent = (i: number) => {
    setForbidContents((preState) => {
      preState.splice(i + 1, 0, '');
      return [...preState];
    });
  };

  const delForbidContent = (i: number) => {
    setForbidContents((preState) => {
      return preState.filter((value, index) => index !== i);
    });
  };

  const changeForbidContent = (i: number, input: string) => {
    setForbidContents((preState) => {
      return preState.map((item, index) => {
        if (index === i) return input;
        return item;
      });
    });
  };

  const AuthSlider = ({
    lable,
    state,
    stateName,
  }: {
    lable: string;
    state: any;
    stateName: any;
  }) => {
    return (
      <>
        <Slider
          onChange={(e, value) => {
            let temp = { ...auth };
            Object.entries(temp).map(([key]) => {
              if (key === stateName) {
                //@ts-ignore
                temp[key] = int2Auth(Array.isArray(value) ? value[0] : value);
                setAuth(temp);
              }
            });
          }}
          value={auth2Int(state)}
          step={1}
          marks
          min={0}
          max={3}
        />
        <Typography className="pl-2 flex items-center" component="div">
          {`${lable}: ` + authText(state)}
        </Typography>
      </>
    );
  };

  const modelChoose = (input: unknown) => {
    switch (input) {
      case 1:
        setSelectModel(input);
        setAuth({
          visible: 'allowAnonymous',
          thread: 'anonymous',
          reply: 'anonymous',
          report: 'anonymous',
        });
        break;
      case 2:
        setSelectModel(input);
        setAuth({
          visible: 'invited',
          thread: 'invited',
          reply: 'invited',
          report: 'invited',
        });
        break;
      case 3:
        setSelectModel(input);
        setAuth({
          visible: 'allowAnonymous',
          thread: 'moderator',
          reply: 'allowAnonymous',
          report: 'anonymous',
        });
        break;
      case 4:
        setSelectModel(input);
        setAuth({
          visible: 'allowAnonymous',
          thread: 'moderator',
          reply: 'invited',
          report: 'registered',
        });
        break;
      default:
        setSelectModel(5);
    }
  };

  const formik = useFormik<FormProps>({
    initialValues: {
      name: service ? service.name : '',
      description: service ? service.description : '',
      limitPostCount: service ? service.limitPostCount : 3,
      limitPostMin: service ? service.limitPostMin : 5,
      moderatorName: service ? service.moderatorName : '',
      // link: [],
    },
    validateOnChange: false,
    validate: (values) => {
      let errors: any = {};
      if (!values.name) errors.name = '名稱必填';
      if (!values.moderatorName) errors.moderatorName = '版主名稱必填';
      if (!Number.isInteger(values.limitPostCount)) errors.limitPostCount = '次數限制格式錯誤';
      if (!Number.isInteger(values.limitPostMin)) errors.limitPostMin = '次數限制格式錯誤';

      return errors;
    },
    onSubmit: async (values, action) => {
      if (service) {
        const data = await appCtx.fetch('patch', '/api/service', {
          id: service.id,
          name: values.name,
          topLink: topLinks,
          headLink: headLinks,
          forbidContents: forbidContents.filter((item) => item !== ''),
          description: values.description,
          moderatorName: values.moderatorName,
          limitPostCount: values.limitPostCount,
          limitPostMin: values.limitPostMin,
          visibleAuth: auth.visible,
          threadAuth: auth.thread,
          replyAuth: auth.reply,
          reportAuth: auth.report,
        });

        if (data) {
          action.resetForm();
          appCtx.sanckBar('修改服務成功', 'success');
          finish();
        }
      } else {
        const data = await appCtx.fetch('post', '/api/service', {
          name: values.name,
          topLink: topLinks,
          headLink: headLinks,
          forbidContents: forbidContents.filter((item) => item !== ''),
          description: values.description,
          moderatorName: values.moderatorName,
          limitPostCount: values.limitPostCount,
          limitPostMin: values.limitPostMin,
          visibleAuth: auth.visible,
          threadAuth: auth.thread,
          replyAuth: auth.reply,
          reportAuth: auth.report,
        });

        if (data) {
          action.resetForm();
          appCtx.sanckBar('新增服務成功', 'success');
          finish();
        }
      }
    },
  });

  return (
    <div className="flex justify-center">
      <div className="lg:w-1/2  sm:w-2/3 w-full grid grid-cols-2 gap-1">
        {!service && (
          <Select
            label="模板"
            className={'col-span-2'}
            variant="filled"
            value={selectModel}
            onChange={(e) => modelChoose(e.target.value)}
          >
            <MenuItem value={1}>匿名討論版</MenuItem>
            <MenuItem value={2}>社團討論版</MenuItem>
            <MenuItem value={3}>部落格</MenuItem>
            <MenuItem value={4}>佈告欄</MenuItem>
            <MenuItem value={5}>不使用模板</MenuItem>
          </Select>
        )}

        <TextField
          className="col-span-2"
          required
          error={formik.errors.name ? true : false}
          helperText={formik.errors.name}
          name="name"
          label="名稱"
          variant="filled"
          value={formik.values.name}
          onChange={formik.handleChange}
        />
        <TextField
          className="col-span-2"
          name="description"
          onChange={formik.handleChange}
          multiline
          rows={4}
          label="描述"
          variant="filled"
          value={formik.values.description}
          placeholder="可使用markdown語法"
        />
        <TextField
          className="col-span-2"
          required
          error={formik.errors.moderatorName ? true : false}
          helperText={formik.errors.moderatorName}
          name="moderatorName"
          label="版主名稱"
          variant="filled"
          value={formik.values.moderatorName}
          onChange={formik.handleChange}
        />

        {/* <TextField
          name="limitPostCount"
          label="時間內發文次數限制"
          variant="filled"
          type="number"
          value={formik.values.limitPostCount}
          error={formik.errors.limitPostCount ? true : false}
          helperText={formik.errors.limitPostCount}
          onChange={formik.handleChange}
        />
        <TextField
          name="limitPostMin"
          label="發文時間限制(分鐘)"
          variant="filled"
          type="number"
          value={formik.values.limitPostMin}
          error={formik.errors.limitPostMin ? true : false}
          helperText={formik.errors.limitPostMin}
          onChange={formik.handleChange}
        /> */}

        {/* <AuthSlider lable={'討論版可見'} state={auth.visible} stateName={'visible'} /> */}

        <Slider
          onChange={(e, value) =>
            setAuth({ ...auth, visible: int2Auth(Array.isArray(value) ? value[0] : value) })
          }
          value={auth2Int(auth.visible)}
          step={1}
          marks
          min={0}
          max={3}
        />
        <Typography className="pl-2 flex items-center" component="div">
          {'討論版可見: ' + authText(auth.visible)}
        </Typography>

        <Slider
          onChange={(e, value) =>
            setAuth({ ...auth, thread: int2Auth(Array.isArray(value) ? value[0] : value) })
          }
          value={auth2Int(auth.thread)}
          step={1}
          marks
          min={0}
          max={4}
        />
        <Typography className="pl-2 flex items-center" component="div">
          {'發文: ' + authText(auth.thread)}
        </Typography>

        <Slider
          onChange={(e, value) =>
            setAuth({ ...auth, reply: int2Auth(Array.isArray(value) ? value[0] : value) })
          }
          value={auth2Int(auth.reply)}
          step={1}
          marks
          min={0}
          max={4}
        />
        <Typography className="pl-2 flex items-center" component="div">
          {'回文: ' + authText(auth.reply)}
        </Typography>

        <Slider
          onChange={(e, value) =>
            setAuth({ ...auth, report: int2Auth(Array.isArray(value) ? value[0] : value) })
          }
          value={auth2Int(auth.report)}
          step={1}
          marks
          min={0}
          max={3}
        />
        <Typography className="pl-2 flex items-center" component="div">
          {'回報: ' + authText(auth.report)}
        </Typography>

        <div className="col-span-2 flex">
          <Typography variant="h6" component="div">
            頂部連結
          </Typography>

          <div className="flex-1" />

          <Fab size="small" color="primary" aria-label="add" onClick={() => addTopLink(-1)}>
            <AddIcon />
          </Fab>
        </div>

        {topLinks.map((item, index) => (
          <div key={index} className="col-span-2 flex items-center mb-1">
            <TextField
              className="w-1/4"
              name={`${item}_${index}_name`}
              label="名稱"
              variant="outlined"
              value={item.name}
              onChange={(e) => changeTopName(index, e.target.value)}
            />
            <TextField
              className="flex-1"
              name={`${item}_${index}_url`}
              label="連結網址"
              variant="outlined"
              value={item.url}
              onChange={(e) => changeTopURL(index, e.target.value)}
            />

            <Fab size="small" color="primary" aria-label="add" onClick={() => addTopLink(index)}>
              <AddIcon />
            </Fab>
            <Fab size="small" color="primary" aria-label="add" onClick={() => delTopLink(index)}>
              <BlockIcon />
            </Fab>
          </div>
        ))}

        <div className="col-span-2 flex">
          <Typography variant="h6" gutterBottom component="div">
            標題連結
          </Typography>

          <div className="flex-1" />

          <Fab size="small" color="primary" aria-label="add" onClick={() => addHeadLink(-1)}>
            <AddIcon />
          </Fab>
        </div>

        {headLinks.map((item, index) => (
          <div className="col-span-2 flex items-center mb-1">
            <TextField
              className="w-1/4"
              name={`${item}_${index}_name`}
              label="名稱"
              variant="outlined"
              value={item.name}
              onChange={(e) => changeHeadName(index, e.target.value)}
            />
            <TextField
              className="flex-1"
              name={`${item}_${index}_url`}
              label="連結網址"
              variant="outlined"
              value={item.url}
              onChange={(e) => changeHeadURL(index, e.target.value)}
            />

            <Fab size="small" color="primary" aria-label="add" onClick={() => addHeadLink(index)}>
              <AddIcon />
            </Fab>

            <Fab size="small" color="primary" aria-label="add" onClick={() => delHeadLink(index)}>
              <BlockIcon />
            </Fab>
          </div>
        ))}

        <div className="col-span-2 flex">
          <Typography variant="h6" gutterBottom component="div">
            新增禁止詞語
          </Typography>

          <div className="flex-1" />

          <Fab size="small" color="primary" aria-label="add" onClick={() => addForbidContent(-1)}>
            <AddIcon />
          </Fab>
        </div>

        {forbidContents.map((item, index) => (
          <div className="col-span-2 flex items-center mb-1">
            <TextField
              className="flex-1"
              name={`${item}_${index}_name`}
              label="禁語"
              variant="outlined"
              value={item}
              onChange={(e) => changeForbidContent(index, e.target.value)}
            />

            <Fab
              size="small"
              color="primary"
              aria-label="add"
              onClick={() => addForbidContent(index)}
            >
              <AddIcon />
            </Fab>

            <Fab
              size="small"
              color="primary"
              aria-label="add"
              onClick={() => delForbidContent(index)}
            >
              <BlockIcon />
            </Fab>
          </div>
        ))}

        <div className="flex justify-end col-span-2">
          <div className="flex-1" />
          <Fab
            variant="extended"
            color="primary"
            aria-label="add"
            className={classes.margin}
            size="small"
            onClick={() => formik.handleSubmit()}
          >
            {service ? '確認修改' : '確認新增'}
            <CheckIcon />
          </Fab>
        </div>
      </div>
    </div>
  );
};
