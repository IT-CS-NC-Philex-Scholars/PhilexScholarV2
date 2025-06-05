<?php

declare(strict_types=1);

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

 // Import WebPushMessage

final class DatabaseNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(
        public string $title,
        public string $message,
        public string $type = 'info',
        public ?string $actionUrl = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast', 'mail', WebPushChannel::class];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
            'action_url' => $this->actionUrl,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject($this->title)
            ->line($this->message)
            ->unless($this->actionUrl === null || $this->actionUrl === '' || $this->actionUrl === '0', function ($mail): void {
                $mail->action('View Details', $this->actionUrl);
            })
            ->line('Thank you for using our application!');
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
            'action_url' => $this->actionUrl,
        ]);
    }

    public function broadcastOn(): array
    {
        return [
            new \Illuminate\Broadcasting\PrivateChannel('notifications'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'DatabaseNotification';
    }

    // Add the toWebPush method
    public function toWebPush($notifiable, $notification): \NotificationChannels\WebPush\WebPushMessage
    {
        return (new WebPushMessage)
            ->title($this->title) // Use the notification's title
            ->icon('/approved-icon.png') // Or make this configurable
            ->body($this->message) // Use the notification's message
            ->action('View Action', 'view_action') // Consider making this configurable
            ->options(['TTL' => 1000]); // Consider making this configurable
        // ->data(['id' => $notification->id])
        // ->badge()
        // ->dir()
        // ->image()
        // ->lang()
        // ->renotify()
        // ->requireInteraction()
        // ->tag()
        // ->vibrate()
    }
}
