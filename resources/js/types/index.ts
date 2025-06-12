export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  role: 'admin' | 'student';
  avatar: string | null;
  cover_image: string | null;
  facebook_avatar: string | null;
  facebook_profile_url: string | null;
}

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  external?: boolean;
}

export interface SchoolData {
  school_name: string;
  school_type: 'high_school' | 'college';
}

export interface StudentProfile {
  id: number;
  user_id: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone_number: string;
  school_type: 'high_school' | 'college';
  school_level: string;
  school_name: string;
  student_id?: string;
  gpa?: number;
  scholarship_applications?: ScholarshipApplication[];
}

export interface ScholarshipProgram {
  id: number;
  name: string;
  description: string;
  total_budget: number;
  per_student_budget: number;
  available_slots: number;
  school_type_eligibility: 'high_school' | 'college' | 'both';
  min_gpa: number;
  min_units: number | null;
  semester: string;
  academic_year: string;
  application_deadline: string;
  community_service_days: number;
  active: boolean;
}

export interface DocumentRequirement {
  id: number;
  scholarship_program_id: number;
  name: string;
  description: string;
  is_required: boolean;
}

export interface ScholarshipApplication {
  id: number;
  student_profile_id: number;
  scholarship_program_id: number;
  status: string;
  admin_notes: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  scholarship_program?: ScholarshipProgram;
  student_profile?: StudentProfile & { user?: User };
  document_uploads?: DocumentUpload[];
  community_service_reports?: CommunityServiceReport[];
  community_service_entries?: CommunityServiceEntry[];
  disbursements?: Disbursement[];
}

export interface DocumentUpload {
  id: number;
  scholarship_application_id: number;
  document_requirement_id: number;
  file_path: string;
  original_filename: string;
  status: string;
  rejection_reason: string | null;
  uploaded_at: string;
  reviewed_at: string | null;
  documentRequirement?: DocumentRequirement;
}

export interface CommunityServiceReport {
  id: number;
  scholarship_application_id: number;
  description: string;
  pdf_report_path: string | null;
  report_type: 'tracked' | 'pdf_upload';
  days_completed: number;
  total_hours: number;
  status: string;
  rejection_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommunityServiceEntry {
  id: number;
  scholarship_application_id: number;
  service_date: string;
  time_in: string;
  time_out: string | null;
  task_description: string;
  lessons_learned: string | null;
  photos: string[] | null;
  hours_completed: number;
  status: 'in_progress' | 'completed' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Disbursement {
  id: number;
  scholarship_application_id: number;
  amount: number;
  status: string;
  payment_method: string | null;
  reference_number: string | null;
  disbursement_date: string;
  notes: string | null;
}