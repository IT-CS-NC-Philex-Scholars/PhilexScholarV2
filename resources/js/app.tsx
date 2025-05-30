import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Initialize theme before anything else
initializeTheme();

(window as any).Pusher = Pusher;

(window as any).Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST ?? window.location.hostname,
    wsPort: parseInt(import.meta.env.VITE_REVERB_PORT ?? '8080', 10),
    wssPort: parseInt(import.meta.env.VITE_REVERB_PORT ?? '8080', 10),
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    // If you had specific Reverb options like `authorizer` or `authEndpoint`
    // that differ from Echo defaults, you might need to add them here.
    // For basic Reverb, this should be okay.
    // `enableLogging: true` can be useful for Echo's own logs during development:
    // logToConsole: true, // Older Echo versions
    // enableLogging: true, // Newer Echo versions might have this directly or via connector options
});

// Wrap in a try-catch to debug JSON parsing errors
try {
    const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
    
    createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
} catch (error) {
    console.error('Error initializing Inertia app:', error);
    document.body.innerHTML = '<div style="padding: 20px;"><h1>Application Error</h1><p>The application failed to initialize. Please try again.</p><pre>' + (error instanceof Error ? error.message : String(error)) + '</pre></div>';
}


