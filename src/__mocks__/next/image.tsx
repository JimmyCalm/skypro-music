import React from 'react';

interface MockImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  priority?: boolean;
  loader?: () => void;
  loading?: 'eager' | 'lazy';
  unoptimized?: boolean;
  fill?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoadingComplete?: () => void;
  srcSet?: string;
  decoding?: 'async' | 'auto' | 'sync';
  fetchPriority?: 'auto' | 'high' | 'low';
}

const MockImage: React.FC<MockImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  ...props
}) => {
  const imgProps: React.ImgHTMLAttributes<HTMLImageElement> = {
    src,
    alt,
    width: width as number,
    height: height as number,
    className,
    loading: props.loading,
    decoding: props.decoding,
    fetchPriority: props.fetchPriority,
  };

  return <img {...imgProps} />;
};

export default MockImage;
