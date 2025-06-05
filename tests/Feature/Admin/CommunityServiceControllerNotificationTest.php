<?php

declare(strict_types=1);

namespace Tests\Feature\Admin;

use App\Models\CommunityServiceEntry;
use App\Models\CommunityServiceReport;
use App\Models\ScholarshipApplication;
use App\Models\ScholarshipProgram;
use App\Models\StudentProfile;
use App\Models\User;
use App\Notifications\DatabaseNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

final class CommunityServiceControllerNotificationTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;

    private User $studentUser;

    private ScholarshipApplication $application;

    private CommunityServiceReport $report;

    private CommunityServiceEntry $entry;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin user
        $this->adminUser = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin@test.com',
        ]);

        // Create student user
        $this->studentUser = User::factory()->create([
            'role' => 'student',
            'email' => 'student@test.com',
        ]);

        // Create student profile
        $studentProfile = StudentProfile::factory()->create([
            'user_id' => $this->studentUser->id,
        ]);

        // Create scholarship program
        $scholarshipProgram = ScholarshipProgram::factory()->create([
            'community_service_days' => 10,
        ]);

        // Create scholarship application
        $this->application = ScholarshipApplication::factory()->create([
            'student_profile_id' => $studentProfile->id,
            'scholarship_program_id' => $scholarshipProgram->id,
            'status' => 'enrolled',
        ]);

        // Create community service report
        $this->report = CommunityServiceReport::factory()->create([
            'scholarship_application_id' => $this->application->id,
            'status' => 'pending_review',
            'total_hours' => 40.0,
            'days_completed' => 5,
        ]);

        // Create community service entry
        $this->entry = CommunityServiceEntry::factory()->create([
            'scholarship_application_id' => $this->application->id,
            'status' => 'completed',
            'hours_completed' => 8.0,
        ]);
    }

    public function test_notification_sent_when_report_status_changes(): void
    {
        Notification::fake();

        $this->actingAs($this->adminUser)
            ->patch(route('admin.community-service.update-status', $this->report), [
                'status' => 'approved',
            ]);

        Notification::assertSentTo(
            $this->studentUser,
            DatabaseNotification::class,
            fn($notification): bool => $notification->title === 'Community Service Report Update' &&
                   str_contains((string) $notification->message, 'approved')
        );
    }

    public function test_notification_sent_when_report_rejected_with_reason(): void
    {
        Notification::fake();

        $this->actingAs($this->adminUser)
            ->patch(route('admin.community-service.update-status', $this->report), [
                'status' => 'rejected_insufficient_hours',
                'rejection_reason' => 'Not enough hours completed',
            ]);

        Notification::assertSentTo(
            $this->studentUser,
            DatabaseNotification::class,
            fn($notification): bool => $notification->title === 'Community Service Report Update' &&
                   str_contains((string) $notification->message, 'rejected - insufficient hours') &&
                   str_contains((string) $notification->message, 'Not enough hours completed')
        );
    }

    public function test_notification_sent_when_entry_status_changes(): void
    {
        Notification::fake();

        $this->actingAs($this->adminUser)
            ->patch(route('admin.community-service.entries.update-status', $this->entry), [
                'status' => 'approved',
                'admin_notes' => 'Great work!',
            ]);

        Notification::assertSentTo(
            $this->studentUser,
            DatabaseNotification::class,
            fn($notification): bool => $notification->title === 'Community Service Entry Update' &&
                   str_contains((string) $notification->message, 'approved') &&
                   str_contains((string) $notification->message, 'Great work!')
        );
    }

    public function test_no_notification_sent_when_status_unchanged(): void
    {
        Notification::fake();

        // Update with same status
        $this->actingAs($this->adminUser)
            ->patch(route('admin.community-service.update-status', $this->report), [
                'status' => 'pending_review',
            ]);

        Notification::assertNothingSent();
    }

    public function test_bulk_update_sends_notifications(): void
    {
        Notification::fake();

        // Create another report
        $report2 = CommunityServiceReport::factory()->create([
            'scholarship_application_id' => $this->application->id,
            'status' => 'pending_review',
        ]);

        $this->actingAs($this->adminUser)
            ->post(route('admin.community-service.bulk-update'), [
                'report_ids' => [$this->report->id, $report2->id],
                'action' => 'approve',
            ]);

        Notification::assertSentTo(
            $this->studentUser,
            DatabaseNotification::class,
            fn($notification): bool => $notification->title === 'Community Service Report Update' &&
                   str_contains((string) $notification->message, 'approved')
        );

        // Should send 2 notifications (one for each report)
        Notification::assertSentTimes(DatabaseNotification::class, 2);
    }
}
