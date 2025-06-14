
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const InstallButton = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();

  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <Button onClick={installApp} variant="outline" size="sm" className="gap-2">
      <Download className="h-4 w-4" />
      Install App
    </Button>
  );
};
