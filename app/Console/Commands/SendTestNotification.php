<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\DatabaseNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

final class SendTestNotification extends Command
{
    protected $signature = 'notification:test {--title=Test Notification} {--message=This is a test notification} {--type=info}';

    protected $description = 'Send a test notification to all users';

    public function handle(): int
    {
        $title = $this->option('title');
        $message = $this->option('message');
        $type = $this->option('type');

        $users = User::all();

        if ($users->isEmpty()) {
            $this->error('No users found in the database.');

            return 1;
        }

        $this->info("Sending test notification to {$users->count()} users...");

        Notification::send($users, new DatabaseNotification($title, $message, $type));

        $this->info('Test notification sent successfully!');

        return 0;
    }
}
