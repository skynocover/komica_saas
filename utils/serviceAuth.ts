import dayjs from 'dayjs';
import Cookies from 'cookies';

// 匿名所有用戶 允許匿名 已註冊 僅邀請 僅管理員
export type auth = 'moderator' | 'invited' | 'registered' | 'allowAnonymous' | 'anonymous';

const authArray: auth[] = ['moderator', 'invited', 'registered', 'allowAnonymous', 'anonymous'];

export const auth2Int = (input: auth): number => authArray.findIndex((item) => item === input);
export const int2Auth = (input: number): auth => authArray[input];

export interface ServiceAuth {
  visible: auth;
  thread: auth;
  reply: auth;
  report: auth;
}

export interface ServiceAuthCheck {
  visible: boolean;
  thread: boolean;
  reply: boolean;
  report: boolean;
  del: boolean;
}

export const authText = (input: auth): string => {
  switch (input) {
    case 'moderator':
      return '僅版主';
    case 'invited':
      return '僅受邀請';
    case 'registered':
      return '僅已註冊';
    case 'allowAnonymous':
      return '允許匿名';
    default:
      return '匿名所有用戶';
  }
};
