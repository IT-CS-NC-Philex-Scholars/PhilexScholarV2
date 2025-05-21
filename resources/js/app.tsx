import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

// Initialize theme before anything else
initializeTheme();

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


