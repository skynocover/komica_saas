import requestIp from 'request-ip';
import type { NextApiRequest } from 'next';
import dayjs from 'dayjs';
import md5 from 'md5';

export const genID = (req: NextApiRequest) => {
  const ip = requestIp.getClientIp(req) || '';
  return md5(`${dayjs().format('YYYY-MM-DD')}${ip}`).substr(0, 13);
};
