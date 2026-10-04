import { FALLBACK_PHOTO } from '../lib/format';

// Unsplash photo with a local fallback; hides itself if both fail
export default function EventImage({ src, alt = '', className = 'img-cover' }) {
  const onError = (ev) => {
    const img = ev.currentTarget;
    if (!img.dataset.fallback) {
      img.dataset.fallback = '1';
      img.src = FALLBACK_PHOTO;
    } else {
      img.style.visibility = 'hidden';
    }
  };
  return <img src={src} alt={alt} onError={onError} className={className} loading="lazy" />;
}
