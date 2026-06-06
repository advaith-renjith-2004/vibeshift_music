import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed as standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the prompt banner after a short delay
      setTimeout(() => setVisible(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setVisible(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    setVisible(false);
    setDeferredPrompt(null);
  };

  if (!visible || installed) return null;

  return (
    <div className="pwa-install-banner" role="alert">
      <div className="pwa-install-icon">
        <Download size={16} />
      </div>
      <div className="pwa-install-text">
        <span className="pwa-install-title">INSTALL VIBESHIFT</span>
        <span className="pwa-install-sub">Add to home screen for offline access</span>
      </div>
      <button className="pwa-install-btn" onClick={handleInstall}>
        INSTALL
      </button>
      <button className="pwa-dismiss-btn" onClick={() => setVisible(false)} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
};
