import dayjs from 'dayjs';

const youtubeURL_Regex =
  /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;

export const isYoutubeURL = (url: string): boolean => youtubeURL_Regex.test(url);
export const getYoutubeId = (url: string): string | null => {
  const temp = url.match(youtubeURL_Regex);
  return temp ? temp[1] : null;
};
