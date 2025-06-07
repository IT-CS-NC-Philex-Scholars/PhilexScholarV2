<?php

namespace App\Listeners;

use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class LinkStudentProfileToUser implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(Registered $event): void
    {
        /** @var User $user */
        $user = $event->user;

        if ($user && $user->email) {
            $studentProfile = StudentProfile::where('email', $user->email)
                                            ->whereNull('user_id')
                                            ->where('status', 'unclaimed')
                                            ->first();

            if ($studentProfile) {
                $studentProfile->user_id = $user->id;
                $studentProfile->status = 'claimed';
                $studentProfile->save();

                Log::info('Student profile linked to user.', ['user_id' => $user->id, 'student_profile_id' => $studentProfile->id]);
            }
        }
    }
}
