import React from 'react';
import { useRouter } from 'next/router';
import { Divider } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import Cookies from 'universal-cookie';

import { Notification } from './Notification';
import { service } from './Service';

const cookies = new Cookies();

export const TopLink = ({ service }: { service: service }) => {
  const handleChange = (e: any) => {
    i18n.changeLanguage(e.target.value);
    cookies.set('AkraftLanguage', e.target.value);
  };

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
      <div className="relative inline-flex">
        <svg
          className="absolute top-0 right-0 w-2 h-2 m-4 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 412 232"
        >
          <path
            d="M206 171.144L42.678 7.822c-9.763-9.763-25.592-9.763-35.355 0-9.763 9.764-9.763 25.592 0 35.355l181 181c4.88 4.882 11.279 7.323 17.677 7.323s12.796-2.441 17.678-7.322l181-181c9.763-9.764 9.763-25.592 0-35.355-9.763-9.763-25.592-9.763-35.355 0L206 171.144z"
            fill="#648299"
            fillRule="nonzero"
          />
        </svg>
        <select
          onChange={(e) => handleChange(e)}
          value={i18n.language}
          className="h-10 pl-5 pr-10 text-gray-600 bg-white appearance-none  focus:outline-none"
        >
          <option value="zh_TW">Chinese</option>
          <option value="en">English</option>
        </select>
      </div>
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
  const { t } = useTranslation();
  return (
    <div className="flex justify-center">
      <ButtonGroup variant="text" color="primary" aria-label="text primary button group">
        <Button href={process.env.NEXT_PUBLIC_DOMAIN!} target="_blank">
          Build by Akraft
        </Button>
        <Button onClick={() => router.push(`/service/${service.id}`)}>{t('BackToHomepage')}</Button>
      </ButtonGroup>
    </div>
  );
};
