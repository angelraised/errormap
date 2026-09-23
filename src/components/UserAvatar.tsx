import React from 'react';

interface UserAvatarProps {
  name: string;
  src?: string;
  size?: number;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ name, src, size = 56 }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size, borderRadius: 'var(--radius-full)', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || '?';

  return (
    <div
      aria-label={name}
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--radius-full)',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
        background: 'linear-gradient(135deg, var(--primary), var(--accent-purple))',
        color: '#fff',
        fontSize: size * 0.32,
        fontWeight: 800
      }}
    >
      {initials}
    </div>
  );
};
