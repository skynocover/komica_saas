import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
  // Check incoming query type
  if (params.model == 'Reply') {
    if (params.action == 'delete') {
      params.action = 'update';
      params.args['data'] = { deletedAt: new Date() };
    }
    if (params.action == 'deleteMany') {
      params.action = 'updateMany';
      if (params.args.data != undefined) {
        params.args.data['deletedAt'] = new Date();
      } else {
        params.args['data'] = { deletedAt: new Date() };
      }
    }
  }

  if (params.model == 'Thread') {
    if (params.action == 'delete') {
      params.action = 'update';
      params.args['data'] = { deletedAt: new Date() };
    }
    if (params.action == 'deleteMany') {
      params.action = 'updateMany';
      if (params.args.data != undefined) {
        params.args.data['deletedAt'] = new Date();
      } else {
        params.args['data'] = { deletedAt: new Date() };
      }
    }
  }

  if (params.model == 'Service') {
    if (params.action == 'delete') {
      params.action = 'update';
      params.args['data'] = { deletedAt: new Date() };
    }
    if (params.action == 'deleteMany') {
      params.action = 'updateMany';
      if (params.args.data != undefined) {
        params.args.data['deletedAt'] = new Date();
      } else {
        params.args['data'] = { deletedAt: new Date() };
      }
    }
  }

  return next(params);
});
