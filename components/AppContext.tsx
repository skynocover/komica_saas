import React from 'react';
import axios from 'axios';
import * as antd from 'antd';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, Auth, User } from 'firebase/auth';
import { useRouter } from 'next/router';
import i18n from 'i18next';
import Cookies from 'universal-cookie';
import Drawer from '@material-ui/core/Drawer';
import { makeStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import { PostForm } from './PostForm';
// import { User } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import { auth } from '../firebase/firebaseClient';
import { Notification } from '../components/Notification';
import { useAuthState } from 'react-firebase-hooks/auth';

const cookies = new Cookies();

export interface thread {
  id?: string;
  posterId?: string;
  title: string;
  image?: string;
  youtubeID?: string;
  content: string;
  name?: string;
  Reply?: reply[];
  createdAt?: string;
  serviceId: string;
}

export interface reply {
  id?: string;
  parentId: string;
  posterId?: string;
  image?: string;
  youtubeID?: string;
  content: string;
  name?: string;
  sage: boolean;
  createdAt?: string;
}

export interface report {
  postId?: string;
  reason: string;
  content: string;
}

interface AppContextProps {
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;

  fetch: (
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    url: string,
    param?: any,
  ) => Promise<any>;

  setDrawOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggle: (open: boolean, form?: any) => (event: any) => void;
  sanckBar: (label: string, severity: 'success' | 'error') => void;

  setModal: (modal: any, width?: number) => void;

  auth: Auth;
  login: () => Promise<void>;
  logout: () => void;
}

const AppContext = React.createContext<AppContextProps>(undefined!);

interface AppProviderProps {
  children: React.ReactNode;
}

const AppProvider = ({ children }: AppProviderProps) => {
  const router = useRouter();

  const [authUser, loading, error] = useAuthState(auth);
  const [language, setLanguage] = React.useState<string>('zh_TW');

  // modal
  const [modal, setmodal] = React.useState<any>(null);
  const [modalWidth, setModalWidth] = React.useState<number>(520);
  const setModal = (modal: any, width: number = 520) => {
    setModalWidth(width);
    setmodal(modal);
  };

  // toggle
  const [drawOpen, setDrawOpen] = React.useState(false);
  const [Form, setForm] = React.useState<any>(<PostForm />);

  const toggle = (open: boolean, form?: any) => (event: any) => {
    setDrawOpen(open);
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    if (open) {
      setForm(form);
    } else {
      setForm(null);
    }
  };

  // snack bar
  const [barOpen, setBarOpen] = React.useState(false);
  const [successLabel, setSuccessLabel] = React.useState('success');
  const [severity, setSeverity] = React.useState<any>('success');
  const SuccessClose = (_event: any, reason: any) => {
    if (reason === 'clickaway') return;
    setBarOpen(false);
  };

  const sanckBar = (label: string, severity: 'success' | 'error') => {
    setSuccessLabel(label);
    setSeverity(severity);
    setBarOpen(true);
  };

  /////////////////////////////////////////////////////

  React.useEffect(() => {
    axios.defaults.baseURL = '';
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    const lng = cookies.get('AkraftLanguage');
    i18n.changeLanguage(lng || 'en');
  }, []);

  const fetch = async (
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    url: string,
    param?: any,
  ) => {
    let data: any = null;
    try {
      const token = await authUser?.getIdToken();
      const response = await axios({
        method,
        url,
        data: param,
        headers: { Authorization: token },
      });
      console.log('response', response.data);

      if (response.data.errorCode !== 0) throw new Error(response.data.errorMessage);

      data = response.data;
    } catch (error: any) {
      sanckBar(error.message, 'error');
    }
    return data;
  };

  //////// firebase

  const provider = new GoogleAuthProvider();
  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const authToken = await user.getIdToken();
      await axios.post('/api/account', {}, { headers: { Authorization: authToken } });
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.log({ errorCode, errorMessage, email, credential });
    }
  };

  const logout = async () => {
    auth.signOut();
    axios.delete('/api/account', {});
    router.push('/');
  };

  /////////////////////////////////////////////////////

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,

        fetch,

        auth,
        login,
        logout,

        setDrawOpen,
        toggle,
        sanckBar,
        setModal,
      }}
    >
      {children}

      <Snackbar open={barOpen} autoHideDuration={1500} onClose={SuccessClose}>
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={() => setBarOpen(false)}
          severity={severity}
        >
          {successLabel}
        </MuiAlert>
      </Snackbar>

      {drawOpen && (
        <Drawer anchor="bottom" open={drawOpen} onClose={toggle(false)}>
          <div className="m-3">{Form}</div>
        </Drawer>
      )}

      {modal && (
        <antd.Modal
          visible={modal !== null}
          onOk={() => setModal(null)}
          onCancel={() => setModal(null)}
          footer={null}
          closable={false}
          width={modalWidth}
        >
          {modal}
        </antd.Modal>
      )}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
