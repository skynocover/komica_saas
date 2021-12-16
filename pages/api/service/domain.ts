import type { NextApiRequest, NextApiResponse } from 'next';
import dayjs from 'dayjs';

import * as cfdns from 'cf_dns_sdk';
import * as vercel from 'vercel_domains_sdk';
// import vercel from 'vercel_domains_sdk';

import { prisma } from '../../../database/db';
import { Resp, Tresp } from '../../../resp/resp';
import { setLog } from '../../../utils/setLog';
import { getBinarySize } from '../../../utils/getStringSize';
import { firebaseAuth } from '../../../firebase/auth';

cfdns.InitDNSSDK(process.env.CF_ZONE_ID!, process.env.CF_DNS_TOKEN!);
vercel.Init(process.env.VERCEL_PROJECT_ID!, process.env.VERCEL_TOKEN!);

const vercelIP = '76.76.21.21';

const domainUplimit = 30;

const getRealDomain = (): string => {
  if (process.env.NEXT_PUBLIC_DOMAIN === 'http://localhost:3000') {
    return 'akraft.net';
  }
  return new URL(process.env.NEXT_PUBLIC_DOMAIN!).host;
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  async function getDomain() {
    try {
      const decodeToken = await firebaseAuth(req);
      const offset = req.query.offset ? +req.query.offset : undefined;
      const limit = req.query.limit ? +req.query.limit : undefined;

      const user = await prisma.user.findFirst({ where: { account: decodeToken.uid } });
      if (!user) {
        res.json(Resp.queryNotFound);
        return;
      }

      const services = await prisma.service.findMany({
        where: { ownerId: user.id, deletedAt: null },
        select: { id: true, name: true, Domain: true },
        take: limit,
        skip: offset,
      });

      const count = await prisma.service.count({
        where: { ownerId: user.id, deletedAt: null },
      });

      const allDomainCount = await prisma.domain.count();

      res.json({ ...Resp.success, services, count, doRemain: domainUplimit - allDomainCount });
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.systemError });
    }
  }

  async function postDomain() {
    let cfDNSID: string = '';
    let delDomain: string = '';
    try {
      const decodeToken = await firebaseAuth(req);

      const { serviceId, domainName } = req.body;

      if (!serviceId || !domainName) {
        res.json(Resp.paramInputEmpty);
        return;
      }

      const service = await prisma.service.findFirst({
        where: {
          id: serviceId,
          Owner: { account: decodeToken.uid },
        },
      });

      if (!service) {
        res.json(Resp.queryNotFound);
        return;
      }

      const domain = await prisma.domain.findFirst({ where: { name: domainName } });
      if (domain) {
        res.json(Resp.domainDuplicate);
        return;
      }

      const domainCount = await prisma.domain.count();
      if (domainCount >= domainUplimit) {
        res.json(Resp.domainReachUpLimit);
        return;
      }

      delDomain = domainName + '.' + getRealDomain();

      const { errorMessages: vercelError } = await vercel.VercelAddDomain(delDomain);
      if (vercelError) {
        throw new Error(vercelError);
      }
      const { result, errorMessages } = await cfdns.CreateDNS({
        name: domainName,
        content: vercelIP,
      });

      if (!result) {
        throw new Error(errorMessages);
      }
      cfDNSID = result.id;

      await prisma.domain.create({
        data: { name: domainName, cfDNSID, Service: { connect: { id: service.id } } },
      });

      res.json(Resp.success);
    } catch (error: any) {
      if (delDomain) {
        vercel.VercelDeleteDomain(delDomain).catch((error) => {
          console.log(error);
        });
      }
      if (cfDNSID) {
        cfdns.DeleteDNS(cfDNSID).catch((error) => {
          console.log(error);
        });
      }

      console.log(error.message);
      res.json({ error: error.message, ...Resp.systemError });
    }
  }

  async function delDoamin() {
    try {
      const decodeToken = await firebaseAuth(req);

      const { id } = req.body;

      const domain = await prisma.domain.findFirst({
        where: { id, Service: { Owner: { account: decodeToken.uid } } },
      });

      if (!domain) {
        res.json(Resp.queryNotFound);
        return;
      }

      const cfError = await cfdns.DeleteDNS(domain.cfDNSID);
      if (cfError.errorMessages) {
        throw new Error(cfError.errorMessages);
      }

      const vercerError = await vercel.VercelDeleteDomain(domain.name + '.' + getRealDomain());
      if (vercerError?.errorMessages) {
        throw new Error(vercerError.errorMessages);
      }

      await prisma.domain.delete({ where: { id } });

      res.json(Resp.success);
    } catch (error: any) {
      console.log(error.message);
      res.json({ error: error.message, ...Resp.systemError });
    }
  }

  switch (req.method) {
    case 'GET':
      return await getDomain();
    case 'POST':
      return await postDomain();
    case 'DELETE':
      return await delDoamin();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
