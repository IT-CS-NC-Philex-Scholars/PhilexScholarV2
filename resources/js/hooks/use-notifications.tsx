
import { router } from '@inertiajs/react';
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  read_at?: string;
  created_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);


  // Load existing notifications
  useEffect(() => {
    fetch('/notifications')
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const echoInstance = (window as any).Echo;

    if (!echoInstance) {
      console.error("CRITICAL: window.Echo is not defined. Ensure Echo is initialized globally (e.g., in app.tsx or bootstrap.js) and assigned to window.Echo.");
      return;
    }
    
    if (typeof echoInstance.private !== 'function') {
      console.error("CRITICAL: window.Echo.private is not a function. The global Echo instance (window.Echo) appears to be misconfigured or not a full Echo instance. Current window.Echo:", echoInstance);
      return;
    }

    console.log('Setting up Echo private channel "notifications" using window.Echo:', echoInstance);
    
    const channel = echoInstance.private('notifications');
    
    // Listen for TestNotificationEvent from 'php artisan broadcast:test'
    // The default broadcastAs name is the class name if not overridden.
    // Ensure TestNotificationEvent class broadcasts on 'private-notifications' channel.
    channel.listen('TestNotificationEvent', (data: any) => { // Or whatever TestNotificationEvent broadcastAs() returns
      console.log('Received TestNotificationEvent:', data);
      
      const newNotification: Notification = {
        id: data.id || Date.now().toString(), 
        type: data.type || 'info',
        title: data.title || 'Broadcast Test',
        message: data.message || '',
        action_url: data.action_url,
        created_at: new Date().toISOString(),
      };

      setNotifications(prev => [newNotification, ...prev]);
      
      toast(newNotification.title, {
        description: newNotification.message,
        action: newNotification.action_url ? {
          label: 'View',
          onClick: () => { if(newNotification.action_url) window.location.href = newNotification.action_url; },
        } : undefined,
        duration: 5000,
      });
    });

    // Listen for DatabaseNotification (from 'php artisan notification:test')
    // This should match the broadcastAs() value in DatabaseNotification.php
    channel.listen('DatabaseNotification', (data: any) => {
      console.log('Received DatabaseNotification event:', data);
      
      // Data here is directly the payload from toBroadcast() in DatabaseNotification.php
      // because we are listening to the specific 'DatabaseNotification' event name.
      const newNotification: Notification = {
        id: data.id || Date.now().toString(), // Ensure 'id' is part of your toBroadcast payload if needed
        type: data.type || 'info',
        title: data.title || 'Notification',
        message: data.message || '',
        action_url: data.action_url,
        created_at: data.created_at || new Date().toISOString(), 
      };

      setNotifications(prev => [newNotification, ...prev]);
      
      toast(newNotification.title, {
        description: newNotification.message,
        action: newNotification.action_url ? {
          label: 'View',
          onClick: () => { if(newNotification.action_url) window.location.href = newNotification.action_url; },
        } : undefined,
        duration: 5000,
      });
    });

    // Log channel subscription success
    channel.subscribed(() => {
      console.log('Successfully subscribed to private-notifications channel');
    });

    channel.error((error: any) => {
      console.error('Channel subscription error (private-notifications):', error);
    });

    return () => {
      console.log('Cleaning up notification listeners for channel:', channel.name);
      // Stop listening to specific events before leaving.
      channel.stopListening('TestNotificationEvent');
      channel.stopListening('DatabaseNotification'); // Now listening for this directly
      // No longer listening for .Illuminate\\Notifications\\Events\\BroadcastNotificationCreated
      
      // Use the main Echo instance to leave the channel.
      if (echoInstance && typeof echoInstance.leave === 'function') {
        echoInstance.leave('notifications');
      }
    };
  }, []); // Empty dependency array: run once on mount and clean up on unmount

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const markAsRead = (id: string) => {
    router.post(`/notifications/${id}/read`, {}, {
      onSuccess: (page: any) => {
        console.log('Success response props (markAsRead):', page.props);
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
        );
        // Toast handling is now in AppSidebarLayout
      },
      onError: (errors: any) => {
        console.error('Error response (markAsRead):', errors);
        // Toast handling is now in AppSidebarLayout
      },
      preserveScroll: true,
    });
  };

  const markAllAsRead = () => {
    router.post('/notifications/mark-all-read', {}, {
      onSuccess: (page: any) => {
        console.log('Success response props (markAllAsRead):', page.props);
        setNotifications(prev =>
          prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
        );
        // Toast handling is now in AppSidebarLayout
        // No specific error status expected from backend for this action other than general errors
      },
      onError: (errors: any) => {
        console.error('Error response (markAllAsRead):', errors);
        // Toast handling is now in AppSidebarLayout
      },
      preserveScroll: true,
    });
  };

  const clearNotification = (id: string) => {
    router.delete(`/notifications/${id}`, {
      onSuccess: (page: any) => {
        console.log('Success response props (clearNotification):', page.props);
        setNotifications(prev => prev.filter(n => n.id !== id));
        // Toast handling is now in AppSidebarLayout
      },
      onError: (errors: any) => {
        console.error('Error response (clearNotification):', errors);
        // Toast handling is now in AppSidebarLayout
      },
      preserveScroll: true,
    });
  };

  const clearAllNotifications = () => {
    router.delete('/notifications', {
      onSuccess: (page: any) => {
        console.log('Success response props (clearAllNotifications):', page.props);
        setNotifications([]);
        // Toast handling is now in AppSidebarLayout
        // No specific error status expected from backend for this action other than general errors
      },
      onError: (errors: any) => {
        console.error('Error response (clearAllNotifications):', errors);
        // Toast handling is now in AppSidebarLayout
      },
      preserveScroll: true,
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}