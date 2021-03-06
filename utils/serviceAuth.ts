import dayjs from 'dayjs';

// 僅管理員 僅成員 已註冊 允許匿名
export type auth = 'moderator' | 'invited' | 'registered' | 'allowAnonymous';

const authArray: auth[] = ['moderator', 'invited', 'registered', 'allowAnonymous'];

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
