<?php

namespace App\Console\Commands;

use App\Models\CommunityServiceReport;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;

class CleanupOrphanCommunityServiceReports extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'community-service:cleanup-orphans';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Find and delete community service reports with broken relationships (missing application, student, or program).';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Starting cleanup of orphan community service reports...');

        // Find reports that are missing the application, or the application is missing its student/user or program.
        $orphanReports = CommunityServiceReport::where(function (Builder $query) {
            $query->whereDoesntHave('scholarshipApplication')
                  ->orWhereHas('scholarshipApplication', function (Builder $subQuery) {
                      $subQuery->whereDoesntHave('studentProfile.user')
                               ->orWhereDoesntHave('scholarshipProgram');
                  });
        })->get();


        $count = $orphanReports->count();

        if ($count === 0) {
            $this->info('No orphan reports found. Your database is clean!');
            return 0;
        }

        $this->warn("Found {$count} report(s) with broken relationships.");

        if ($this->confirm('Do you want to delete these orphan reports? This action cannot be undone.')) {
            $deletedCount = 0;
            foreach ($orphanReports as $report) {
                $this->line("Deleting report ID: {$report->id} (points to application ID: {$report->scholarship_application_id})");
                $report->delete();
                $deletedCount++;
            }
            $this->info("Successfully deleted {$deletedCount} orphan report(s).");
        } else {
            $this->info('Cleanup aborted by user.');
        }

        return 0;
    }
} 