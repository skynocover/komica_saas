import { postLimit } from '../utils/setLog';

export interface Tresp {
  errorCode: number;
  errorMessage: string;
}

export const Resp = {
  success: {
    errorCode: 0,
    errorMessage: '',
  },

  // Api Fail
  paramInputEmpty: {
    errorCode: 1000,
    errorMessage: 'param Input Empty',
  },

  paramInputFormateError: {
    errorCode: 1001,
    errorMessage: 'param Input formate error',
  },

  queryNotFound: {
    errorCode: 1002,
    errorMessage: 'param Input not found',
  },

  postLimit: {
    errorCode: 1003,
    errorMessage: postLimit,
  },

  imgLimit: {
    errorCode: 1004,
    errorMessage: '圖檔上傳過大',
  },

  userPermissionDenied: {
    errorCode: 1005,
    errorMessage: '用戶權限不足',
  },

  contentForbidden: {
    errorCode: 1006,
    errorMessage: '發文內容含有禁止內容',
  },

  // DB Fail
  sqlExecFail: {
    errorCode: 2000,
    errorMessage: 'sql exec fail',
  },
  // User not found
  userNotFound: {
    errorCode: 2001,
    errorMessage: 'user not found',
  },

  // Exec Fail
  commandExecFail: {
    errorCode: 3000,
    errorMessage: 'command exec fail',
  },

  // Exec Fail
  userNotExist: {
    errorCode: 3001,
    errorMessage: 'firebase user not found',
  },
};
