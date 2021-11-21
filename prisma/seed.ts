import { PrismaClient } from '@prisma/client';
import sha256 from 'crypto-js/sha256';
const prisma = new PrismaClient();

async function main() {
  //   await prisma.user.create({
  //     data: {
  //       id: '6191e7115d0be0d33d66f016',
  //       account: 'admin',
  //       password: sha256('123456').toString(),
  //     },
  //   });
  // await prisma.service.create({
  //   data: {
  //     name: 'Dota2',
  //     topLink: JSON.stringify([
  //       { name: 'komica', url: 'https://www.komica.org' },
  //       { name: 'Github', url: 'https://github.com/skynocover/komica_nextjs' },
  //     ]),
  //     headLink: JSON.stringify([
  //       { name: 'Dota2', url: 'https://www.dota2.com/home' },
  //       { name: 'Dota2 Wiki', url: 'https://dota2.gamepedia.com/Dota_2_Wiki' },
  //       { name: 'Underlords', url: 'https://underlords.com' },
  //     ]),
  //     description:
  //       '標題及內文為必填,名稱及圖檔為選填  發文限制為每五分鐘三次  回應若不想推文請勾選Sage',
  //     Owner: { connect: { id: '6191e7115d0be0d33d66f016' } },
  //   },
  // });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
