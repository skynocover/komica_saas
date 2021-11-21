import React, { useContext } from 'react';

import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import ReportIcon from '@material-ui/icons/Report';
import ReplyRoundedIcon from '@material-ui/icons/ReplyRounded';
import Link from '@material-ui/core/Link';
import ReactMarkdown from 'react-markdown';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import * as antd from 'antd';

import { ReportForm } from './ReportForm';
import { PostForm } from './PostForm';
import { Image } from './Image';
import { useRouter } from 'next/router';
import { AppContext, thread, reply } from './AppContext';
import { ServiceAuthCheck } from '../utils/serviceAuth';

export const ListThreads = ({
  onepage,
  serviceId,
  threads,
  auth,
  displayName,
}: {
  onepage: boolean;
  serviceId: string;
  threads: any;
  auth: ServiceAuthCheck;
  displayName?: string;
}) => {
  const appCtx = useContext(AppContext);
  const router = useRouter();

  const ThreadLabel = ({ post }: { post: any }) => {
    const appCtx = useContext(AppContext);

    const [hash, setHash] = React.useState<string>('');

    React.useEffect(() => {
      setHash(new URL('http://fackdomain' + router.asPath).hash.substr(1));
    }, []);

    const deletePost = () => {
      antd.Modal.confirm({
        title: '確認',
        icon: <i />,
        content: post.title ? '確認刪除討論串?' : '確認刪除回應?',
        okText: '確認',
        cancelText: '取消',
        onOk: async () => {
          let data: any;
          if (post.title) {
            data = await appCtx.fetch('delete', '/api/post/thread', { id: post.id, serviceId });
          } else {
            data = await appCtx.fetch('delete', '/api/post/reply', { id: post.id, serviceId });
          }
          if (data) router.reload();
        },
      });
    };

    const topPost = () => {
      antd.Modal.confirm({
        title: '確認',
        icon: <i />,
        content: '確認置頂此文?',
        okText: '確認',
        cancelText: '取消',
        onOk: () => {},
      });
    };

    return (
      <div id={post.id} className="flex pt-2 items-center justify-center">
        {post.title ? (
          <Link href={router.basePath + `/service/${serviceId}/${post.id}`} underline="always">
            <span className="text-red-600"> {post.title}</span>
            <span className="text-blue-400">
              {post.Member ? post.Member.displayName : post.name}
            </span>
            <span className="text-gray-400">
              [{post.createdAt} ID:{post.userId}]
            </span>
          </Link>
        ) : (
          <>
            <span className="text-blue-400">
              {post.Member ? post.Member.displayName : post.name}
            </span>
            <span className={post.id === hash ? 'text-yellow-400' : 'text-gray-400'}>
              [{post.createdAt} ID:{post.userId}]
            </span>
          </>
        )}

        {auth.del ? (
          <IconButton size="small" onClick={() => deletePost()}>
            <DoDisturbIcon />
          </IconButton>
        ) : (
          auth.report && (
            <IconButton size="small" onClick={appCtx.toggle(true, <ReportForm id={post.id} />)}>
              <ReportIcon />
            </IconButton>
          )
        )}

        {/* {post.title && (
          <IconButton size="small" onClick={() => topPost()}>
            <DoneAllIcon />
          </IconButton>
        )} */}

        {post.title && auth.reply && (
          <IconButton
            aria-label="delete"
            size="small"
            onClick={appCtx.toggle(
              true,
              <PostForm key="postform_reply" parentId={post.id} displayName={displayName} />,
            )}
          >
            <ReplyRoundedIcon />
          </IconButton>
        )}
      </div>
    );
  };

  const Post = ({ post, position }: { post: reply | thread; position: 'inside' | 'outside' }) => {
    const contentClassName = {
      inside: 'sm:col-start-1 sm:col-span-3',
      outside: 'sm:col-start-2 sm:col-span-2',
    };

    const markdownClassName = {
      inside: 'sm:col-span-3 ml-2',
      outside: 'sm:col-span-2 ml-2',
    };
    return (
      <>
        <ThreadLabel post={post} />
        <div className="grid grid-cols-1 sm:grid-cols-6">
          {post.image || post.youtubeID ? (
            <div className={contentClassName[position]}>
              {post.image ? (
                <Image image={post.image} />
              ) : (
                <div className="relative" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${post.youtubeID}`}
                    frameBorder="0"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="col-span-0 md:col-end-3"></div>
          )}

          <div className={markdownClassName[position]}>
            <ReactMarkdown children={post.content} />
          </div>
        </div>
      </>
    );
  };

  const Thread = ({ thread }: { thread: thread }) => {
    const appCtx = useContext(AppContext);
    const showReply = onepage ? thread.Reply?.length! : 3; //如果非一頁式瀏覽最多顯示回應數

    return (
      <>
        <Post post={thread} position={'outside'} />
        {thread.Reply?.length! > showReply && (
          <div className="grid grid-cols-1 md:grid-cols-6 ">
            <Accordion className="md:col-start-2 md:col-span-4">
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>被隱藏的回應</Typography>
              </AccordionSummary>

              <AccordionDetails className="flex justify-center">
                <div className="grid gird-cols-1">
                  {thread.Reply?.filter(
                    (item: any, index: any) => index < thread.Reply?.length! - showReply,
                  ).map((item: any) => (
                    <Post key={item.id} post={item} position={'inside'} />
                  ))}
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
        )}

        {thread.Reply?.filter(
          (item: any, index: any) => index >= thread.Reply?.length! - showReply,
        ).map((item: any) => (
          <Post key={item.id} post={item} position={'outside'} />
        ))}
        <Divider className="flex" />
      </>
    );
  };

  return <>{threads && threads.map((item: any) => <Thread key={item.id} thread={item} />)}</>;
};
