'use client'

import { AlertCircle } from 'lucide-react';

export default function ErrorAlert({ message }) {
  return (
    <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded-xl flex items-center space-x-2 text-red-700">
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  );
}