
import { Student, Faculty, AttendanceRecord, User, Role, Branch, Semester, FacultyAssignment, PromotionLog } from '../types';

const DB_KEYS = {
  USERS: 'kpt_users',
  STUDENTS: 'kpt_students',
  FACULTY: 'kpt_faculty',
  ATTENDANCE: 'kpt_attendance',
  LOGS: 'kpt_logs',
  SUBJECTS: 'kpt_subjects',
  ASSIGNMENTS: 'kpt_assignments',
  PROMOTION_LOGS: 'kpt_promotion_logs'
};

const BRANCH_NORMALIZATION: Record<string, Branch> = {
  "cs": Branch.CS, "cse": Branch.CS, "computer science": Branch.CS, "computer science and engineering": Branch.CS,
  "auto": Branch.AUTO, "automobile": Branch.AUTO, "automobile engineering": Branch.AUTO,
  "chem": Branch.CHEM, "chemical": Branch.CHEM, "chemical engineering": Branch.CHEM,
  "civil": Branch.CIVIL, "civil engineering": Branch.CIVIL,
  "ec": Branch.EC, "ece": Branch.EC, "electronics": Branch.EC, "electronics and communication": Branch.EC, "electronics and communication engineering": Branch.EC,
  "ee": Branch.EE, "eee": Branch.EE, "electrical": Branch.EE, "electrical and electronics": Branch.EE, "electrical and electronics engineering": Branch.EE,
  "mech": Branch.MECH, "mechanical": Branch.MECH, "mechanical engineering": Branch.MECH,
  "poly": Branch.POLY, "polymer": Branch.POLY, "polymer technology": Branch.POLY
};

const seedData = () => {
  if (!localStorage.getItem(DB_KEYS.USERS)) {
    const users: User[] = [
      // 1) Super Admin
      { id: 'u-admin', username: 'admin', password: 'password123', role: Role.SUPER_ADMIN, name: 'Super Admin' },
      
      // 2) Principal
      { id: 'u-principal', username: 'principal', password: 'password123', role: Role.PRINCIPAL, name: 'Dr. Srinivasa Rao' },
      
      // HODs
      { id: 'hod-cs', username: 'hodcs', password: 'password123', role: Role.HOD, name: 'Prof. Rajeshwari K.', department: Branch.CS },
      { id: 'hod-ec', username: 'hodec', password: 'password123', role: Role.HOD, name: 'Prof. Mahesh Bhat', department: Branch.EC },
      { id: 'hod-me', username: 'hodme', password: 'password123', role: Role.HOD, name: 'Prof. Vinay Kumar', department: Branch.MECH },
      { id: 'hod-ch', username: 'hodch', password: 'password123', role: Role.HOD, name: 'Prof. Prema Shanthi', department: Branch.CHEM },

      // Faculty - CS
      { id: 'fac-cs-gen', username: 'faccs', password: 'password123', role: Role.FACULTY, name: 'Prof. Arjun Nair', department: Branch.CS, employeeId: 'EMP_CS_GEN' },
      { id: 'fac-cs-1', username: 'faccs1', password: 'password123', role: Role.FACULTY, name: 'Suresh Kumar', department: Branch.CS, employeeId: 'EMP_CS_001' },
      { id: 'fac-cs-2', username: 'faccs2', password: 'password123', role: Role.FACULTY, name: 'Priya D\'Souza', department: Branch.CS, employeeId: 'EMP_CS_002' },
      { id: 'fac-cs-3', username: 'faccs3', password: 'password123', role: Role.FACULTY, name: 'Kavitha Hegde', department: Branch.CS, employeeId: 'EMP_CS_003' },
      { id: 'fac-cs-4', username: 'faccs4', password: 'password123', role: Role.FACULTY, name: 'Rohan Deshmukh', department: Branch.CS, employeeId: 'EMP_CS_004' },
      { id: 'fac-cs-5', username: 'faccs5', password: 'password123', role: Role.FACULTY, name: 'Abhishek Nair', department: Branch.CS, employeeId: 'EMP_CS_005' },

      // Faculty - EC
      { id: 'fac-ec-1', username: 'facec1', password: 'password123', role: Role.FACULTY, name: 'Kavitha Shenoy', department: Branch.EC, employeeId: 'EMP_EC_001' },
      { id: 'fac-ec-2', username: 'facec2', password: 'password123', role: Role.FACULTY, name: 'Ganesh Prabhu', department: Branch.EC, employeeId: 'EMP_EC_002' },
      { id: 'fac-ec-3', username: 'facec3', password: 'password123', role: Role.FACULTY, name: 'Meena Rao', department: Branch.EC, employeeId: 'EMP_EC_003' },
      { id: 'fac-ec-4', username: 'facec4', password: 'password123', role: Role.FACULTY, name: 'Vikram Bhat', department: Branch.EC, employeeId: 'EMP_EC_004' },
      { id: 'fac-ec-5', username: 'facec5', password: 'password123', role: Role.FACULTY, name: 'Anjali Kamath', department: Branch.EC, employeeId: 'EMP_EC_005' },

      // Faculty - ME
      { id: 'fac-me-1', username: 'facme1', password: 'password123', role: Role.FACULTY, name: 'Rohan Deshmukh', department: Branch.MECH, employeeId: 'EMP_ME_001' },
      { id: 'fac-me-2', username: 'facme2', password: 'password123', role: Role.FACULTY, name: 'Abhishek Nair', department: Branch.MECH, employeeId: 'EMP_ME_002' },
      { id: 'fac-me-3', username: 'facme3', password: 'password123', role: Role.FACULTY, name: 'Sandeep Shet', department: Branch.MECH, employeeId: 'EMP_ME_003' },
      { id: 'fac-me-4', username: 'facme4', password: 'password123', role: Role.FACULTY, name: 'Manoj Karkera', department: Branch.MECH, employeeId: 'EMP_ME_004' },
      { id: 'fac-me-5', username: 'facme5', password: 'password123', role: Role.FACULTY, name: 'Vikas Shenoy', department: Branch.MECH, employeeId: 'EMP_ME_005' },

      // Faculty - CH
      { id: 'fac-ch-1', username: 'facch1', password: 'password123', role: Role.FACULTY, name: 'Dr. Amit Trivedi', department: Branch.CHEM, employeeId: 'EMP_CH_001' },
      { id: 'fac-ch-2', username: 'facch2', password: 'password123', role: Role.FACULTY, name: 'Sunitha Shetty', department: Branch.CHEM, employeeId: 'EMP_CH_002' },
      { id: 'fac-ch-3', username: 'facch3', password: 'password123', role: Role.FACULTY, name: 'Raghavendra Bhat', department: Branch.CHEM, employeeId: 'EMP_CH_003' },
      { id: 'fac-ch-4', username: 'facch4', password: 'password123', role: Role.FACULTY, name: 'Priyanka Desai', department: Branch.CHEM, employeeId: 'EMP_CH_004' },
      { id: 'fac-ch-5', username: 'facch5', password: 'password123', role: Role.FACULTY, name: 'Siddheshwar Swamy', department: Branch.CHEM, employeeId: 'EMP_CH_005' }
    ];
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  }

  if (!localStorage.getItem(DB_KEYS.STUDENTS)) {
    const students: Student[] = [];

    // CS STUDENTS
    const csNames = [
      "Arjun Sharma", "Rohan Varma", "Priya Lakshmi", "Ananya Hegde", "Vikram Reddy", "Sai Krishna", "Kavya Murthy", "Rahul Deshpande",
      "Neha Patil", "Manish Singh", "Siddharth Rao", "Aditya Kulkarni", "Shruti Shetty", "Gautam Iyer", "Varun Prabhu", "Divya Kamath",
      "Prateek Jain", "Megha Rai", "Karthik Gowda", "Aishwarya Shenoy", "Nikhil Poojary", "Deepak Soman", "Akash Bangera", "Harshini D.",
      "Sameer Ahmed", "Pavan Mendon", "Shwetha Rao", "Manoj Shetty", "Preethi Kulal", "Sumanth Amin"
    ];
    csNames.forEach((name, i) => {
      const roll = (i + 1).toString().padStart(3, '0');
      students.push({
        id: `std-cs-${roll}`,
        name,
        age: 18,
        rollNumber: `CS${(i+1).toString().padStart(2, '0')}`,
        regNumber: `103CS23${roll}`,
        branch: Branch.CS,
        semester: 1,
        section: 'A',
        status: 'ACTIVE'
      });
    });

    // EC STUDENTS
    const ecNames = [
      "Abhinav M.", "Bhaskar T.", "Darshan K.", "Eshwar L.", "Fathima Z.", "Girish B.", "Hemanth V.", "Ishaan S.",
      "Janvi K.", "Kishore R.", "Latha M.", "Mohan P.", "Naveena B.", "Omkar S.", "Pallavi G.", "Quasim A.",
      "Rekha N.", "Sanjay D.", "Tarun B.", "Umesh K.", "Vani S.", "Waseem H.", "Xavier D.", "Yogesh B.",
      "Zoya K.", "Amrutha L.", "Bharath S.", "Chetan K.", "Dinesh P.", "Ekta R."
    ];
    ecNames.forEach((name, i) => {
      const roll = (i + 1).toString().padStart(3, '0');
      students.push({
        id: `std-ec-${roll}`,
        name,
        age: 18,
        rollNumber: `EC${(i+1).toString().padStart(2, '0')}`,
        regNumber: `103EC23${roll}`,
        branch: Branch.EC,
        semester: 1,
        section: 'A',
        status: 'ACTIVE'
      });
    });

    // ME STUDENTS
    const meNames = [
      "Siddharth Rao", "Aditya Kulkarni", "Shruti Shetty", "Gautam Iyer", "Varun Prabhu", "Prateek Jain", "Karthik Gowda", "Akash Bangera",
      "Pavan Mendon", "Manoj Shetty", "Sumanth Amin", "Tanvi Naik", "Yashasvi P.", "Deepika R.", "Chaitra S.", "Abhinav M.",
      "Bhaskar T.", "Darshan K.", "Eshwar L.", "Fathima Z.", "Girish B.", "Hemanth V.", "Ishaan S.", "Kishore R.",
      "Mohan P.", "Naveena B.", "Omkar S.", "Pallavi G.", "Quasim A.", "Rekha N."
    ];
    meNames.forEach((name, i) => {
      const roll = (i + 1).toString().padStart(3, '0');
      students.push({
        id: `std-me-${roll}`,
        name,
        age: 18,
        rollNumber: `ME${(i+1).toString().padStart(2, '0')}`,
        regNumber: `103ME23${roll}`,
        branch: Branch.MECH,
        semester: 1,
        section: 'A',
        status: 'ACTIVE'
      });
    });

    // CH STUDENTS
    const chNames = [
      "Megha S. Rai", "Deepak Soman", "Preethi Kulal", "Tanvi Naik", "Akshay Bhat", "Bindu Shenoy", "Chetan M.", "Divya K.",
      "Esha Prabhu", "Farhan Khan", "Girish S.", "Harsha Vardhan", "Indira Hegde", "Jayantha K.", "Kishore Pai", "Laxmi Rao",
      "Mahesh K.", "Nayana D.", "Om Prakash", "Prithvi Raj", "Qadir Ahmed", "Ranjini S.", "Suresh Nayak", "Tushar G.",
      "Usha Kamath", "Vinod Kumar", "Wilson D'Souza", "Yashoda B.", "Zakir Hussain", "Anupama R."
    ];
    chNames.forEach((name, i) => {
      const roll = (i + 1).toString().padStart(3, '0');
      students.push({
        id: `std-ch-${roll}`,
        name,
        age: 18,
        rollNumber: `CH${(i+1).toString().padStart(2, '0')}`,
        regNumber: `103CH23${roll}`,
        branch: Branch.CHEM,
        semester: 1,
        section: 'A',
        status: 'ACTIVE'
      });
    });

    localStorage.setItem(DB_KEYS.STUDENTS, JSON.stringify(students));
  }

  if (!localStorage.getItem(DB_KEYS.FACULTY)) {
    const users: User[] = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const faculty: Faculty[] = users
      .filter(u => u.role === Role.FACULTY)
      .map(u => ({
        id: u.id,
        name: u.name,
        department: u.department!,
        employeeId: u.employeeId!,
        subjects: ['Core Engineering I', 'Process Lab']
      }));
    localStorage.setItem(DB_KEYS.FACULTY, JSON.stringify(faculty));
  }

  if (!localStorage.getItem(DB_KEYS.SUBJECTS)) {
    localStorage.setItem(DB_KEYS.SUBJECTS, JSON.stringify([
      'Data Structures', 'Microprocessors', 'C Programming', 'Operating Systems', 'Cloud Computing',
      'Fluid Mechanics', 'Thermodynamics', 'Digital Electronics', 'Network Analysis', 'Control Systems',
      'Manufacturing Processes', 'Machine Design', 'Heat Transfer', 'Theory of Machines',
      'Chemical Process Principles', 'Mass Transfer', 'Chemical Reaction Engineering', 'Process Control'
    ]));
  }

  if (!localStorage.getItem(DB_KEYS.ATTENDANCE)) {
    localStorage.setItem(DB_KEYS.ATTENDANCE, JSON.stringify([]));
  }
};

// Initial seeding
seedData();

export const db = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(DB_KEYS.USERS);
    if (!data) {
      seedData();
      return JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    }
    return JSON.parse(data);
  },
  saveUsers: (users: User[]) => localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users)),
  
  getStudents: (): Student[] => {
    const data = localStorage.getItem(DB_KEYS.STUDENTS);
    if (!data) {
      seedData();
      return JSON.parse(localStorage.getItem(DB_KEYS.STUDENTS) || '[]');
    }
    return JSON.parse(data);
  },
  saveStudents: (students: Student[]) => localStorage.setItem(DB_KEYS.STUDENTS, JSON.stringify(students)),
  
  getFaculty: (): Faculty[] => {
    const data = localStorage.getItem(DB_KEYS.FACULTY);
    if (!data) {
      seedData();
      return JSON.parse(localStorage.getItem(DB_KEYS.FACULTY) || '[]');
    }
    return JSON.parse(data);
  },
  saveFaculty: (faculty: Faculty[]) => localStorage.setItem(DB_KEYS.FACULTY, JSON.stringify(faculty)),

  getSubjects: (): string[] => {
    const data = localStorage.getItem(DB_KEYS.SUBJECTS);
    if (!data) {
      seedData();
      return JSON.parse(localStorage.getItem(DB_KEYS.SUBJECTS) || '[]');
    }
    return JSON.parse(data);
  },
  
  getAssignments: (): FacultyAssignment[] => JSON.parse(localStorage.getItem(DB_KEYS.ASSIGNMENTS) || '[]'),
  saveAssignments: (asg: FacultyAssignment[]) => localStorage.setItem(DB_KEYS.ASSIGNMENTS, JSON.stringify(asg)),
  
  getAttendance: (): AttendanceRecord[] => JSON.parse(localStorage.getItem(DB_KEYS.ATTENDANCE) || '[]'),
  saveAttendance: (records: AttendanceRecord[]) => localStorage.setItem(DB_KEYS.ATTENDANCE, JSON.stringify(records)),

  getPromotionLogs: (): PromotionLog[] => JSON.parse(localStorage.getItem(DB_KEYS.PROMOTION_LOGS) || '[]'),
  savePromotionLogs: (logs: PromotionLog[]) => localStorage.setItem(DB_KEYS.PROMOTION_LOGS, JSON.stringify(logs)),

  logActivity: (user: string, action: string) => {
    const logs = JSON.parse(localStorage.getItem(DB_KEYS.LOGS) || '[]');
    logs.push({ timestamp: new Date().toISOString(), user, action });
    localStorage.setItem(DB_KEYS.LOGS, JSON.stringify(logs.slice(-100)));
  },

  normalizeBranch: (raw: string): Branch | null => {
    const clean = raw.trim().toLowerCase();
    return BRANCH_NORMALIZATION[clean] || null;
  }
};

// don't remove the previous chatbot personality behaviours'
// don't alter current look which is great and add looks
