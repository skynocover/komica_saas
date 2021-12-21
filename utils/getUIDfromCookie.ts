import Cookies from 'cookies';
import jwt from 'jsonwebtoken';
import { GetServerSidePropsContext } from 'next';

export const getUIDfromCookie = (
  req: GetServerSidePropsContext['req'],
  res: GetServerSidePropsContext['res'],
): string => {
  const cookie = new Cookies(req, res).get(process.env.COOKIE_NAME!);
  let uid = '';
  if (cookie) {
    try {
      const decoded = jwt.verify(cookie, process.env.JWT_SECRET || '');
      if (typeof decoded === 'string') throw new Error(`jwt decode fail`);
      uid = decoded.uid;
    } catch (error: any) {
      const cookies = new Cookies(req, res);
      cookies.set(process.env.COOKIE_NAME!, null);
    }
  }
  return uid;
};
