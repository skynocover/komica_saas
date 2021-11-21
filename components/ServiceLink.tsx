import React from 'react';
import { GetServerSideProps, GetStaticProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { Divider, LinkTypeMap } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Typography from '@material-ui/core/Typography';
import dayjs from 'dayjs';

import { Notification } from './Notification';
import { prisma } from '../database/db';
import { AppContext } from './AppContext';

import { makeStyles } from '@material-ui/core/styles';
import { Pages } from './Pagination';
import { ListThreads } from './ListThread';
import { ReportForm } from './ReportForm';
import { PostForm } from './PostForm';
import { Thread, Reply } from '.prisma/client';
import ReactMarkdown from 'react-markdown';

import { service } from './Service';

export const TopLink = ({ service }: { service: service }) => {
  return (
    <div className="flex justify-end">
      {service.topLink.length > 0 ? (
        <ButtonGroup variant="text" color="primary" aria-label="text primary button group">
          {service.topLink.map((item, index) => (
            <Button href={item.url} target="_blank" key={index}>
              {item.name}
            </Button>
          ))}
        </ButtonGroup>
      ) : (
        <div className="my-5"></div>
      )}
    </div>
  );
};

export const Header = ({ service }: { service: service }) => {
  return (
    <div>
      <div className="flex justify-center">
        <h1 className="text-4xl">{service.name}</h1>
      </div>
      <div className="flex justify-center">
        {service.headLink.length > 0 ? (
          <ButtonGroup variant="outlined" aria-label="outlined button group">
            {service.headLink.map((item, index) => (
              <Button color="primary" href={item.url} target="_blank" key={index}>
                {item.name}
              </Button>
            ))}
          </ButtonGroup>
        ) : (
          <div className="my-5"></div>
        )}
      </div>
      <Divider />
    </div>
  );
};

export const BottomLink = ({ service }: { service: service }) => {
  const router = useRouter();
  return (
    <div className="flex justify-center">
      <ButtonGroup variant="text" color="primary" aria-label="text primary button group">
        <Button onClick={() => router.push(`/service/${service.id}`)}>回首頁</Button>
      </ButtonGroup>
    </div>
  );
};
