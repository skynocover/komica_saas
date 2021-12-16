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
    errorMessage: 'param_input_empty',
  },

  paramInputFormateError: {
    errorCode: 1001,
    errorMessage: 'param_input_format_error',
  },

  queryNotFound: {
    errorCode: 1002,
    errorMessage: 'query_not_found',
  },

  // postLimit: {
  //   errorCode: 1003,
  //   errorMessage: postLimit,
  // },

  imgLimit: {
    errorCode: 1004,
    errorMessage: 'image_too_large',
  },

  userPermissionDenied: {
    errorCode: 1005,
    errorMessage: 'insufficient_user_rights',
  },

  contentForbidden: {
    errorCode: 1006,
    errorMessage: 'post_contains_prohibited_content',
  },

  domainDuplicate: {
    errorCode: 1007,
    errorMessage: 'domain_already_used',
  },

  domainReachUpLimit: {
    errorCode: 1008,
    errorMessage: 'domain_reached_upper_limi',
  },

  // DB Fail
  systemError: {
    errorCode: 2000,
    errorMessage: 'system_error',
  },
  // User not found
  userNotFound: {
    errorCode: 2001,
    errorMessage: 'user_not_found',
  },
};
