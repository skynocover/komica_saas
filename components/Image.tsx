import React, { useCallback } from 'react';
import ImageViewer from 'react-simple-image-viewer';
import NImage from 'next/image';

export const Image = ({ image }: { image: string }) => {
  const [currentImage, setCurrentImage] = React.useState(0);
  const [isViewerOpen, setIsViewerOpen] = React.useState(false);

  const openImageViewer = useCallback(() => setIsViewerOpen(true), []);

  const closeImageViewer = () => {
    setCurrentImage(0);
    setIsViewerOpen(false);
  };

  const imgURL = `${process.env.NEXT_PUBLIC_CF_IMAGE_URL}/${image}/public`;

  return (
    <div>
      <img src={imgURL} onClick={() => openImageViewer()} width="100%" style={{ margin: '2px' }} />

      {isViewerOpen && (
        <ImageViewer
          src={[imgURL]}
          currentIndex={currentImage}
          onClose={closeImageViewer}
          disableScroll={false}
          backgroundStyle={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
          closeOnClickOutside={true}
        />
      )}
    </div>
  );
};
