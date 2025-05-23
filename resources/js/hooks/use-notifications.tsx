import { useEcho } from '@laravel/echo-react';
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
  const echo = useEcho();

  // Load existing notifications
  useEffect(() => {
    fetch('/notifications')
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!echo) {
      console.log('Echo not available yet...');
      return;
    }

    console.log('Setting up Echo channel for notifications...', echo);
    
    const channel = echo.channel('notifications');
    
    // Listen for test notification events
    channel.listen('TestNotification', (data: any) => {
      console.log('Received test notification:', data);
      
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: data.type || 'info',
        title: data.title,
        message: data.message,
        action_url: data.action_url,
        created_at: new Date().toISOString(),
      };

      setNotifications(prev => [newNotification, ...prev]);
      
      // Show toast notification
      toast(data.title, {
        description: data.message,
        action: data.action_url ? {
          label: 'View',
          onClick: () => window.location.href = data.action_url,
        } : undefined,
        duration: 5000,
      });
    });

    // Listen for Laravel's default notification broadcast event
    channel.listen('DatabaseNotification', (data: any) => {
      console.log('Received DatabaseNotification:', data);
      
      const newNotification: Notification = {
        id: data.id || Date.now().toString(),
        type: data.type || 'info',
        title: data.title || 'Notification',
        message: data.message || '',
        action_url: data.action_url,
        created_at: new Date().toISOString(),
      };

      setNotifications(prev => [newNotification, ...prev]);
      
      // Show toast notification
      toast(data.title || 'Notification', {
        description: data.message || '',
        action: data.action_url ? {
          label: 'View',
          onClick: () => window.location.href = data.action_url,
        } : undefined,
        duration: 5000,
      });
    });

    // Also listen for Laravel's broadcast notification event (fallback)
    channel.listen('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', (data: any) => {
      console.log('Received Laravel broadcast notification:', data);
      
      const newNotification: Notification = {
        id: data.id || Date.now().toString(),
        type: data.data?.type || 'info',
        title: data.data?.title || 'Notification',
        message: data.data?.message || '',
        action_url: data.data?.action_url,
        created_at: new Date().toISOString(),
      };

      setNotifications(prev => [newNotification, ...prev]);
      
      // Show toast notification
      toast(data.data?.title || 'Notification', {
        description: data.data?.message || '',
        action: data.data?.action_url ? {
          label: 'View',
          onClick: () => window.location.href = data.data.action_url,
        } : undefined,
        duration: 5000,
      });
    });

    // Log channel subscription success
    channel.subscribed(() => {
      console.log('Successfully subscribed to notifications channel');
    });

    channel.error((error: any) => {
      console.error('Channel subscription error:', error);
    });

    return () => {
      console.log('Cleaning up notification listeners...');
      channel.stopListening('TestNotification');
      channel.stopListening('DatabaseNotification');
      channel.stopListening('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated');
    };
  }, [echo]);

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const markAsRead = async (id: string) => {
    try {
      await router.post(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await router.post('/notifications/mark-all-read');
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const clearNotification = async (id: string) => {
    try {
      await router.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await router.delete('/notifications');
      setNotifications([]);
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
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