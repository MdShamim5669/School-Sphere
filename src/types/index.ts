export type UserRole = "ADMIN" | "TEACHER" | "PARENT" | "STUDENT";

export type UserSex = "MALE" | "FEMALE";

export type BloodType =
  | "A_POSITIVE"
  | "A_NEGATIVE"
  | "B_POSITIVE"
  | "B_NEGATIVE"
  | "AB_POSITIVE"
  | "AB_NEGATIVE"
  | "O_POSITIVE"
  | "O_NEGATIVE";

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiResponse<T> {
  statusCode?: number;
  success: boolean;
  message?: string;
  meta?: PaginationMeta;
  data: T;
}

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole | string;
}

export interface LoginResponseData {
  accessToken: string;
  user: AuthUser;
}

export interface Admin {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  teachers?: Teacher[];
  lessons?: Lesson[];
}

export interface Grade {
  id: string;
  level: number;
  createdAt: string;
  updatedAt: string;
  classes?: ClassItem[];
  students?: Student[];
}

export interface ClassItem {
  id: string;
  name: string;
  capacity: number;
  supervisorId?: string | null;
  gradeId: string;
  createdAt: string;
  updatedAt: string;
  grade?: Grade;
  supervisor?: Teacher | null;
  students?: Student[];
  lessons?: Lesson[];
  events?: EventItem[];
  announcements?: AnnouncementItem[];
  _count?: {
    students?: number;
    lessons?: number;
  };
}

export interface Teacher {
  id: string;
  username: string;
  name: string;
  surname: string;
  email?: string | null;
  phone?: string | null;
  address: string;
  img?: string | null;
  bloodType: BloodType;
  sex: UserSex;
  birthday: string;
  createdAt: string;
  updatedAt: string;
  subjects?: Subject[];
  lessons?: Lesson[];
  supervisedClasses?: ClassItem[];
}

export interface Parent {
  id: string;
  username: string;
  name: string;
  surname: string;
  email?: string | null;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  students?: Student[];
}

export interface Student {
  id: string;
  username: string;
  name: string;
  surname: string;
  email?: string | null;
  phone?: string | null;
  address: string;
  img?: string | null;
  bloodType: BloodType;
  sex: UserSex;
  birthday: string;
  parentId: string;
  classId: string;
  gradeId: string;
  createdAt: string;
  updatedAt: string;
  parent?: Parent;
  class?: ClassItem;
  grade?: Grade;
  attendances?: AttendanceItem[];
  results?: ResultItem[];
}

export interface Lesson {
  id: string;
  name: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  subject?: Subject;
  class?: ClassItem;
  teacher?: Teacher;
  exams?: ExamItem[];
  assignments?: AssignmentItem[];
  attendances?: AttendanceItem[];
}

export interface ExamItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  lessonId: string;
  createdAt: string;
  updatedAt: string;
  lesson?: Lesson;
  results?: ResultItem[];
}

export interface AssignmentItem {
  id: string;
  title: string;
  startDate: string;
  dueDate: string;
  lessonId: string;
  createdAt: string;
  updatedAt: string;
  lesson?: Lesson;
  results?: ResultItem[];
}

export interface ResultItem {
  id: string;
  score: number;
  studentId: string;
  examId?: string | null;
  assignmentId?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: Student;
  exam?: ExamItem | null;
  assignment?: AssignmentItem | null;
}

export interface AttendanceItem {
  id: string;
  date: string;
  present: boolean;
  studentId: string;
  lessonId: string;
  createdAt: string;
  updatedAt: string;
  student?: Student;
  lesson?: Lesson;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  image?: string | null;
  img?: string | null;
  bannerUrl?: string | null;
  classId?: string | null;
  createdAt: string;
  updatedAt: string;
  class?: ClassItem | null;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  description: string;
  date: string;
  classId?: string | null;
  createdAt: string;
  updatedAt: string;
  class?: ClassItem | null;
}
