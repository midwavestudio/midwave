'use client';

import React from 'react';
import { FiActivity, FiUsers, FiHeart, FiCpu } from 'react-icons/fi';

type IconProps = {
  type: 'interpersonal' | 'social' | 'life' | 'physical';
  className?: string;
  size?: number;
};

const ChallengeTypeIcon: React.FC<IconProps> = ({ type, className = '', size = 24 }) => {
  const iconProps = {
    size,
    className: `${className}`
  };

  switch (type) {
    case 'interpersonal':
      return <FiUsers {...iconProps} />;
    case 'social':
      return <FiHeart {...iconProps} />;
    case 'life':
      return <FiActivity {...iconProps} />;
    case 'physical':
      return <FiCpu {...iconProps} />;
    default:
      return <FiActivity {...iconProps} />;
  }
};

export default ChallengeTypeIcon; 