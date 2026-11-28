let deferredPrompt;
let isInstalled = false;

export function initPWA() {
  if ('serviceWorker' in navigator) {
    registerServiceWorker();
  }

  setupInstallPrompt();
  checkIfInstalled();
  setupOnlineOfflineListeners();
  setupUpdateNotification();
}

async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('[PWA] Service Worker registered successfully:', registration.scope);

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateNotification(registration);
        }
      });
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
  }
}

function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    showInstallBanner();
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed successfully');
    isInstalled = true;
    hideInstallBanner();
    deferredPrompt = null;

    showNotification('ZanziBiz Installed!', 'You can now use ZanziBiz offline', 'success');
  });

  if (isIOS() && !isInstalled) {
    setTimeout(() => {
      showIOSInstallPrompt();
    }, 3000);
  }
}

function isIOS() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

function isInStandaloneMode() {
  return ('standalone' in window.navigator) && (window.navigator.standalone);
}

function showInstallBanner() {
  if (isInstalled || localStorage.getItem('pwa-install-dismissed') === 'true') {
    return;
  }

  setTimeout(() => {
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'fixed top-20 right-4 bg-white text-gray-800 rounded-xl shadow-2xl z-50 transform transition-all duration-300 max-w-sm border-2 border-brand-green';
    banner.style.animation = 'slideInRight 0.4s ease-out';

    banner.innerHTML = `
      <div class="p-4">
        <div class="flex items-start gap-3">
          <div class="w-12 h-12 bg-brand-green rounded-xl flex items-center justify-center flex-shrink-0">
            <img src="/untitled_design.png" alt="ZanziBiz" class="w-10 h-10 object-contain">
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between mb-2">
              <h3 class="font-bold text-base text-gray-900">Add to Home Screen</h3>
              <button onclick="window.pwaDismissInstall()" class="text-gray-400 hover:text-gray-600 -mt-1 -mr-1 p-1">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <p class="text-sm text-gray-600 mb-3">Install ZanziBiz for quick access and offline browsing</p>
            <div class="flex gap-2">
              <button onclick="window.pwaInstall()" class="flex-1 bg-brand-green text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-green/90 transition-colors text-sm">
                Install
              </button>
              <button onclick="window.pwaDismissInstall()" class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium">
                Not Now
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    setTimeout(() => {
      banner.style.animation = '';
    }, 400);
  }, 2000);
}

function hideInstallBanner() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => banner.remove(), 300);
  }
}

window.pwaInstall = async function() {
  if (!deferredPrompt) {
    return;
  }

  deferredPrompt.prompt();

  const { outcome } = await deferredPrompt.userChoice;
  console.log('[PWA] User choice:', outcome);

  if (outcome === 'accepted') {
    console.log('[PWA] User accepted the install prompt');
  } else {
    console.log('[PWA] User dismissed the install prompt');
  }

  deferredPrompt = null;
  hideInstallBanner();
};

window.pwaDismissInstall = function() {
  localStorage.setItem('pwa-install-dismissed', 'true');
  hideInstallBanner();
};

function checkIfInstalled() {
  if (window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')) {
    isInstalled = true;
    localStorage.setItem('pwa-installed', 'true');
    console.log('[PWA] App is running in standalone mode');
    return;
  }

  if (localStorage.getItem('pwa-installed') === 'true') {
    isInstalled = true;
  }

  if ('getInstalledRelatedApps' in navigator) {
    navigator.getInstalledRelatedApps().then((relatedApps) => {
      if (relatedApps.length > 0) {
        isInstalled = true;
        localStorage.setItem('pwa-installed', 'true');
        console.log('[PWA] Related app is installed');
      }
    }).catch((error) => {
      console.log('[PWA] Could not check for related apps:', error);
    });
  }
}

function showIOSInstallPrompt() {
  if (localStorage.getItem('ios-install-dismissed') === 'true') {
    return;
  }

  if (isInStandaloneMode()) {
    return;
  }

  const banner = document.createElement('div');
  banner.id = 'ios-install-banner';
  banner.className = 'fixed top-20 left-4 right-4 md:right-4 md:left-auto md:max-w-sm bg-white text-gray-800 rounded-xl shadow-2xl z-50 transform transition-all duration-300 border-2 border-brand-green';
  banner.style.animation = 'slideInRight 0.4s ease-out';

  banner.innerHTML = `
    <div class="p-4">
      <div class="flex items-start gap-3">
        <div class="w-12 h-12 bg-brand-green rounded-xl flex items-center justify-center flex-shrink-0">
          <img src="/untitled_design.png" alt="ZanziBiz" class="w-10 h-10 object-contain">
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between mb-2">
            <h3 class="font-bold text-base text-gray-900">Install on iPhone</h3>
            <button onclick="window.dismissIOSInstall()" class="text-gray-400 hover:text-gray-600 -mt-1 -mr-1 p-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="text-xs space-y-2 text-gray-600">
            <p class="flex items-start gap-2">
              <span class="font-bold text-brand-green">1.</span>
              <span>Tap <strong>Share</strong>
                <svg class="inline w-3 h-3 mx-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
                </svg>
              </span>
            </p>
            <p class="flex items-start gap-2">
              <span class="font-bold text-brand-green">2.</span>
              <span>Tap <strong>"Add to Home Screen"</strong></span>
            </p>
            <p class="flex items-start gap-2">
              <span class="font-bold text-brand-green">3.</span>
              <span>Tap <strong>"Add"</strong></span>
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  setTimeout(() => {
    banner.style.animation = '';
  }, 400);
}

window.dismissIOSInstall = function() {
  localStorage.setItem('ios-install-dismissed', 'true');
  const banner = document.getElementById('ios-install-banner');
  if (banner) {
    banner.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => banner.remove(), 300);
  }
};

function setupOnlineOfflineListeners() {
  window.addEventListener('online', () => {
    console.log('[PWA] Connection restored');
    showNotification('Back Online', 'Your connection has been restored', 'success');
    updateOnlineStatus(true);
  });

  window.addEventListener('offline', () => {
    console.log('[PWA] Connection lost');
    showNotification('You\'re Offline', 'Some features may be limited', 'warning');
    updateOnlineStatus(false);
  });

  updateOnlineStatus(navigator.onLine);
}

function updateOnlineStatus(isOnline) {
  document.body.classList.toggle('offline', !isOnline);

  const statusIndicator = document.getElementById('online-status');
  if (statusIndicator) {
    statusIndicator.textContent = isOnline ? 'Online' : 'Offline';
    statusIndicator.className = isOnline ? 'online' : 'offline';
  }
}

function setupUpdateNotification() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes slideDown {
      from { transform: translateY(0); opacity: 1; }
      to { transform: translateY(100%); opacity: 0; }
    }
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

function showUpdateNotification(registration) {
  const banner = document.createElement('div');
  banner.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-brand-orange text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-3';
  banner.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
    </svg>
    <span class="font-semibold">New version available!</span>
    <button onclick="this.parentElement.updateApp()" class="bg-white text-[#0A6A94] px-3 py-1 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors ml-2">
      Update
    </button>
  `;

  banner.updateApp = () => {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    banner.remove();
  };

  document.body.appendChild(banner);

  setTimeout(() => {
    banner.style.animation = 'fadeOut 0.3s ease-in';
    setTimeout(() => banner.remove(), 300);
  }, 10000);
}

function showNotification(title, message, type = 'info') {
  const colors = {
    success: 'bg-green-500',
    warning: 'bg-orange-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  const icons = {
    success: '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>',
    warning: '<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>',
    error: '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>',
    info: '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>'
  };

  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 max-w-md transform transition-all duration-300`;
  notification.style.animation = 'slideInRight 0.3s ease-out';
  notification.innerHTML = `
    <svg class="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      ${icons[type]}
    </svg>
    <div class="flex-1 min-w-0">
      <p class="font-semibold">${title}</p>
      <p class="text-sm text-white/90">${message}</p>
    </div>
    <button onclick="this.parentElement.remove()" class="text-white/80 hover:text-white">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('[PWA] Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('[PWA] Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        'YOUR_VAPID_PUBLIC_KEY_HERE'
      )
    });

    console.log('[PWA] Push subscription successful:', subscription);
    return subscription;
  } catch (error) {
    console.error('[PWA] Push subscription failed:', error);
    return null;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isAppInstalled() {
  return isInstalled;
}

export function getInstallPrompt() {
  return deferredPrompt;
}
