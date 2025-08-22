"use client";

import React from 'react';
import { Header } from './Header';

interface GlobalHeaderProps {
  className?: string;
}

export function GlobalHeader({ className = "" }: GlobalHeaderProps) {
  return (
    <div className="w-full sticky top-0 z-40 backdrop-blur-sm">
      <div className="w-full">
        <Header 
          mode="normal"
          className={className}
        />
      </div>
    </div>
  );
}