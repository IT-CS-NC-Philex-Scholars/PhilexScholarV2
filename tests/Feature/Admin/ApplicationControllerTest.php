<?php

declare(strict_types=1);

use App\Models\CommunityServiceReport;
use App\Models\Disbursement;
use App\Models\DocumentUpload;
use App\Models\ScholarshipApplication;
use App\Models\User;
use App\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Notification;

test('admin can view all applications', function (): void {
    // Create an admin user
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    // Create some scholarship applications
    $applications = ScholarshipApplication::factory()->count(3)->create();

    // Visit the applications index page as admin
    $response = $this->actingAs($admin)
        ->get(route('admin.applications.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Application/Index')
        ->has('applications.data', 3)
    );
});

test('admin can view a specific application', function (): void {
    // Create an admin user
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    // Create an application
    $application = ScholarshipApplication::factory()->create();

    // Visit the application show page as admin
    $response = $this->actingAs($admin)
        ->get(route('admin.applications.show', $application));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Application/Show')
        ->has('application')
        ->where('application.id', $application->id)
    );
});

test('admin can update application status', function (): void {
    // Create an admin user
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    // Create an application
    $application = ScholarshipApplication::factory()->create([
        'status' => 'submitted',
    ]);

    // Update the application status
    $response = $this->actingAs($admin)
        ->patch(route('admin.applications.status.update', $application), [
            'status' => 'documents_approved',
            'admin_notes' => 'All documents look good',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    // Check the database was updated
    $this->assertDatabaseHas('scholarship_applications', [
        'id' => $application->id,
        'status' => 'documents_approved',
        'admin_notes' => 'All documents look good',
    ]);
});

test('admin can review document uploads', function (): void {
    // Create an admin user
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    // Create a document upload
    $document = DocumentUpload::factory()->create([
        'status' => 'pending',
    ]);

    // Review the document
    $response = $this->actingAs($admin)
        ->patch(route('admin.documents.review', $document), [
            'status' => 'approved',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    // Check the database was updated
    $this->assertDatabaseHas('document_uploads', [
        'id' => $document->id,
        'status' => 'approved',
        'reviewed_at' => now()->startOfSecond(),
    ]);
});

test('admin can review service reports', function (): void {
    // Create an admin user
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    // Create a service report
    $report = CommunityServiceReport::factory()->create([
        'status' => 'pending',
    ]);

    // Review the service report
    $response = $this->actingAs($admin)
        ->patch(route('admin.service-reports.review', $report), [
            'status' => 'approved',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    // Check the database was updated
    $this->assertDatabaseHas('community_service_reports', [
        'id' => $report->id,
        'status' => 'approved',
        'reviewed_at' => now()->startOfSecond(),
    ]);
});

test('admin can create a disbursement for an application', function (): void {
    // Create an admin user
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    // Create an application
    $application = ScholarshipApplication::factory()->create([
        'status' => 'documents_approved',
    ]);

    // Create a disbursement
    $response = $this->actingAs($admin)
        ->post(route('admin.disbursements.store', $application), [
            'amount' => 1000,
            'payment_method' => 'direct_deposit',
            'reference_number' => 'REF12345',
            'disbursement_date' => now()->format('Y-m-d'),
            'notes' => 'First semester payment',
            'status' => 'processed',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    // Check the database was updated
    $this->assertDatabaseHas('disbursements', [
        'scholarship_application_id' => $application->id,
        'amount' => 1000,
        'payment_method' => 'direct_deposit',
        'reference_number' => 'REF12345',
        'status' => 'processed',
    ]);

    // Check the application status was updated
    $this->assertDatabaseHas('scholarship_applications', [
        'id' => $application->id,
        'status' => 'disbursement_processed',
    ]);
});

test('admin can update an existing disbursement', function (): void {
    // Create an admin user
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    // Create an application and disbursement
    $application = ScholarshipApplication::factory()->create();
    $disbursement = Disbursement::factory()->create([
        'scholarship_application_id' => $application->id,
        'amount' => 500,
        'payment_method' => 'check',
        'status' => 'pending',
    ]);

    // Update the disbursement
    $response = $this->actingAs($admin)
        ->patch(route('admin.disbursements.update', $disbursement), [
            'amount' => 1000,
            'payment_method' => 'direct_deposit',
            'reference_number' => 'UPDATED-REF',
            'disbursement_date' => now()->format('Y-m-d'),
            'notes' => 'Updated payment',
            'status' => 'processed',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    // Check the database was updated
    $this->assertDatabaseHas('disbursements', [
        'id' => $disbursement->id,
        'amount' => 1000,
        'payment_method' => 'direct_deposit',
        'reference_number' => 'UPDATED-REF',
        'status' => 'processed',
    ]);
});

test('notification is sent when application status is updated', function (): void {
    Notification::fake();

    // Create an admin user
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    // Create an application with a student
    $application = ScholarshipApplication::factory()->create([
        'status' => 'submitted',
    ]);

    // Update the application status
    $response = $this->actingAs($admin)
        ->patch(route('admin.applications.status.update', $application), [
            'status' => 'documents_approved',
            'admin_notes' => 'Congratulations!',
        ]);

    $response->assertSessionHasNoErrors();

    // Assert notification was sent to the student
    Notification::assertSentTo(
        $application->studentProfile->user,
        DatabaseNotification::class,
        fn($notification): bool => $notification->title === 'Application Status Update' &&
               str_contains((string) $notification->message, 'approved')
    );
});

test('notification is sent when document status is reviewed', function (): void {
    Notification::fake();

    // Create an admin user
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    // Create a document upload with application
    $document = DocumentUpload::factory()->create([
        'status' => 'pending_review',
    ]);

    // Review the document
    $response = $this->actingAs($admin)
        ->patch(route('admin.documents.review', $document), [
            'status' => 'approved',
        ]);

    $response->assertSessionHasNoErrors();

    // Assert notification was sent to the student
    Notification::assertSentTo(
        $document->scholarshipApplication->studentProfile->user,
        DatabaseNotification::class,
        fn($notification): bool => $notification->title === 'Document Review Update' &&
               str_contains((string) $notification->message, 'approved')
    );
});

test('notification is sent when document is rejected with reason', function (): void {
    Notification::fake();

    // Create an admin user
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    // Create a document upload
    $document = DocumentUpload::factory()->create([
        'status' => 'pending_review',
    ]);

    // Reject the document
    $response = $this->actingAs($admin)
        ->patch(route('admin.documents.review', $document), [
            'status' => 'rejected_invalid',
            'rejection_reason' => 'Document is not clear enough',
        ]);

    $response->assertSessionHasNoErrors();

    // Assert notification was sent to the student
    Notification::assertSentTo(
        $document->scholarshipApplication->studentProfile->user,
        DatabaseNotification::class,
        fn($notification): bool => $notification->title === 'Document Review Update' &&
               str_contains((string) $notification->message, 'rejected') &&
               str_contains((string) $notification->message, 'Document is not clear enough')
    );
});

test('no notification is sent when status does not change', function (): void {
    Notification::fake();

    // Create an admin user
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    // Create an application
    $application = ScholarshipApplication::factory()->create([
        'status' => 'documents_approved',
    ]);

    // "Update" to the same status
    $response = $this->actingAs($admin)
        ->patch(route('admin.applications.status.update', $application), [
            'status' => 'documents_approved',
            'admin_notes' => 'Still approved',
        ]);

    $response->assertSessionHasNoErrors();

    // Assert no notification was sent
    Notification::assertNothingSent();
});
