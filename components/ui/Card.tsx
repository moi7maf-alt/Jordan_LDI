

import React, { forwardRef } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

// FIX: Wrap Card component with forwardRef to allow passing refs to the underlying div element.
const Card = forwardRef<HTMLDivElement, CardProps>(({ children, className = '' }, ref) => {
  return (
    <div
      ref={ref}
      className={`bg-white rounded-xl shadow-md p-6 transition-shadow hover:shadow-lg ${className}`}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;