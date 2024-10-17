'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Messages from '@/components/Messages';

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <Messages />
    </ProtectedRoute>
  );
}