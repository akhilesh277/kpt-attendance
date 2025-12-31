
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  PRINCIPAL = 'PRINCIPAL',
  HOD = 'HOD',
  FACULTY = 'FACULTY'
}

export enum Branch {
  CS = 'Computer Science and Engineering',
  AUTO = 'Automobile Engineering',
  CHEM = 'Chemical Engineering',
  CIVIL = 'Civil Engineering',
  EC = 'Electronics and Communication Engineering',
  EE = 'Electrical and Electronics Engineering',
  MECH = 'Mechanical Engineering',
  POLY = 'Polymer Technology'
}

export type Semester = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type StudentStatus = 'ACTIVE' | 'ARCHIVED';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: Role;
  name: string;
  department?: Branch;
  employeeId?: string;
}

export interface Student {
  id: string;
  name: string;
  age: number;
  rollNumber: string;
  regNumber: string;
  branch: Branch;
  semester: Semester;
  section: string;
  status?: StudentStatus;
}

export interface PromotionLog {
  id: string;
  date: string;
  performedBy: string;
  type: 'ODD' | 'EVEN';
  studentCount: number;
  previousStates: Student[]; // For undo functionality
}

export interface FacultyAssignment {
  id: string;
  facultyId: string;
  branch: Branch;
  semester: Semester;
  subject: string;
}

export interface Faculty {
  id: string;
  name: string;
  department: Branch;
  employeeId: string;
  subjects: string[];
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // ISO format
  status: 'P' | 'A';
  subject: string;
  semester: Semester;
  branch: Branch;
  markedBy: string; // Faculty ID
}

export interface AttendanceSummary {
  studentId: string;
  studentName: string;
  rollNumber: string;
  totalClasses: number;
  presentClasses: number;
  percentage: number;
}
