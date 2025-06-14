
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Debug logging
    console.log('PWA Hook: Initializing');
    console.log('PWA Hook: Service Worker supported?', 'serviceWorker' in navigator);
    console.log('PWA Hook: Already installed?', window.matchMedia('(display-mode: standalone)').matches);
    
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA Hook: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      console.log('PWA Hook: appinstalled event fired');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('PWA Hook: App is running in standalone mode');
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    console.log('PWA Hook: installApp called, deferredPrompt:', !!deferredPrompt);
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('PWA Hook: User choice:', outcome);
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    } catch (error) {
      console.error('PWA Hook: Error during installation:', error);
    }
  };

  // Debug logging for state changes
  useEffect(() => {
    console.log('PWA Hook: State update - isInstallable:', isInstallable, 'isInstalled:', isInstalled);
  }, [isInstallable, isInstalled]);

  return {
    isInstallable,
    isInstalled,
    installApp
  };
};
