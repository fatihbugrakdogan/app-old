"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Cmd/Ctrl + 1 for Dashboard
      if ((event.metaKey || event.ctrlKey) && event.key === '1') {
        event.preventDefault();
        router.push('/dashboard');
      }

      // Cmd/Ctrl + 2 for Migrations
      if ((event.metaKey || event.ctrlKey) && event.key === '2') {
        event.preventDefault();
        router.push('/dashboard/migrations');
      }

      // Cmd/Ctrl + N for New Migration
      if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
        event.preventDefault();
        router.push('/dashboard/migrations');
      }

      // Escape to clear search
      if (event.key === 'Escape') {
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput && document.activeElement === searchInput) {
          searchInput.blur();
          searchInput.value = '';
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router]);
}
