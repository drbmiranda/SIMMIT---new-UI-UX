// Change v1 to v2 to invalidate the old cache
const CACHE_NAME = 'simmit-rpg-cache-v2';
// This list should include all the core files for the app shell.
// IMPORTANT: Add any new components to this list.
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/components/LoadingSpinner.tsx',
  '/components/MessageItem.tsx',
  '/components/ChatInterface.tsx',
  '/components/RoleSelection.tsx',
  '/components/ProfessorView.tsx',
  '/components/SubjectSelection.tsx',
  '/components/ReportErrorModal.tsx',
  '/components/StudentWelcomeModal.tsx',
  '/components/QuestionGeneratorView.tsx',
  '/components/WelcomeScreen.tsx',
  '/components/StudentDashboard.tsx',
  '/components/StudentHub.tsx',
  '/components/FlashcardView.tsx',
  '/components/OnboardingForm.tsx',
  '/components/EnareWelcomeModal.tsx',
  '/components/EnareView.tsx',
  '/components/UpdateNotification.tsx', // Add the new component
  '/services/geminiService.ts',
  '/services/imagenService.ts',
  '/services/supabaseClient.ts',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event: open cache and add all core files to it
self.addEventListener('install', event => {
  // We don't call skipWaiting() here anymore. We'll wait for the user to trigger it.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error("Failed to cache app shell:", err);
      })
  );
});

// Listen for a message from the client to activate the new service worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open clients
  );
});

// Fetch event: Serve assets with appropriate strategies
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests (like the main HTML page), use a network-first strategy.
  // This ensures the user gets the latest version of the app shell if online.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If the network fails, serve the cached index.html
          return caches.match('/');
        })
    );
    return;
  }

  // For all other requests (JS, CSS, images), use a cache-first strategy.
  // These files are versioned by the CACHE_NAME.
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(networkResponse => {
        // Optional: Cache new resources on the fly, but be careful with external resources
        return networkResponse;
      });
    })
  );
});
