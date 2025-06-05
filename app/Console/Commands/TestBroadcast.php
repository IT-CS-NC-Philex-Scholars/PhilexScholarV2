<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Events\TestNotificationEvent;
use Exception;
use Illuminate\Console\Command;

final class TestBroadcast extends Command
{
    protected $signature = 'broadcast:test {--message=Hello World}';

    protected $description = 'Test broadcasting functionality';

    public function handle(): int
    {
        $message = $this->option('message');

        $this->info('Testing broadcast...');

        try {
            event(new TestNotificationEvent(
                'Test Broadcast',
                $message,
                'info'
            ));

            $this->info('Broadcast sent successfully!');
        } catch (Exception $exception) {
            $this->error('Broadcast failed: '.$exception->getMessage());
        }

        return 0;
    }
}
