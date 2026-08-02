// High-performance curated student photo avatars & group banners from Unsplash CDN
const studentAvatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=250&auto=format&fit=crop&q=80'
];

const groupBanners = [
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80'
];

const heroPhotos = [
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80'
];

export function getAvatarUrl(avatarOrUserOrName, fallbackName = 'Student', size = 100) {
  let avatar = null;
  let name = 'Student';

  if (avatarOrUserOrName && typeof avatarOrUserOrName === 'object') {
    avatar = avatarOrUserOrName.avatar || avatarOrUserOrName.userAvatar || avatarOrUserOrName.profileImage;
    name = avatarOrUserOrName.name || avatarOrUserOrName.username || avatarOrUserOrName.author || avatarOrUserOrName.creator || 'Student';
  } else if (typeof avatarOrUserOrName === 'string') {
    const val = avatarOrUserOrName.trim();
    if (
      val.startsWith('data:') ||
      val.startsWith('http://') ||
      val.startsWith('https://') ||
      val.startsWith('/') ||
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(val)
    ) {
      avatar = val;
      if (typeof fallbackName === 'string') {
        name = fallbackName;
      }
    } else {
      name = val;
      if (
        typeof fallbackName === 'string' &&
        (fallbackName.startsWith('data:') ||
          fallbackName.startsWith('http://') ||
          fallbackName.startsWith('https://') ||
          fallbackName.startsWith('/') ||
          /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fallbackName))
      ) {
        avatar = fallbackName;
      }
    }
  }

  if (avatar && avatar !== 'default.jpg' && avatar !== 'undefined' && avatar !== 'null') {
    if (avatar.startsWith('data:') || avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/')) {
      return avatar;
    }
    return `/assets/uploads/avatars/${avatar}`;
  }

  const cleanName = (name || 'Student').trim();
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const avatarIndex = Math.abs(hash) % studentAvatars.length;
  return studentAvatars[avatarIndex];
}

export function getBannerUrl(seed = 'group', width = 600, height = 300) {
  const title = (seed || 'CampusConnect').toString();
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const bannerIndex = Math.abs(hash) % groupBanners.length;
  return groupBanners[bannerIndex];
}

export function getHeroImageUrl(index = 0) {
  return heroPhotos[index % heroPhotos.length];
}
