<?php

namespace App\Console\Commands;

use App\Events\TestNotificationEvent;
use Illuminate\Console\Command;

class TestBroadcast extends Command
{
    protected $signature = 'broadcast:test {--message=Hello World}';
    protected $description = 'Test broadcasting functionality';

    public function handle()
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
        } catch (\Exception $e) {
            $this->error('Broadcast failed: ' . $e->getMessage());
        }
        
        return 0;
    }
}
