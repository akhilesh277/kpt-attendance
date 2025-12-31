
import React from 'react';
import { LayoutDashboard, Users, UserCheck, BookOpen, FileBarChart, Settings, ShieldAlert, GraduationCap, FastForward } from 'lucide-react';
import { Branch, Role, Semester } from './types';

export const BRANCHES = Object.values(Branch);
export const SEMESTERS: Semester[] = [1, 2, 3, 4, 5, 6, 7, 8];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: [Role.SUPER_ADMIN, Role.PRINCIPAL, Role.HOD, Role.FACULTY] },
  { id: 'attendance', label: 'Attendance', icon: <UserCheck size={20} />, roles: [Role.SUPER_ADMIN, Role.HOD, Role.FACULTY] },
  { id: 'students', label: 'Students', icon: <GraduationCap size={20} />, roles: [Role.SUPER_ADMIN, Role.PRINCIPAL, Role.HOD, Role.FACULTY] },
  { id: 'faculty', label: 'Faculty', icon: <Users size={20} />, roles: [Role.SUPER_ADMIN, Role.PRINCIPAL, Role.HOD] },
  { id: 'promotion', label: 'Promotion', icon: <FastForward size={20} />, roles: [Role.SUPER_ADMIN, Role.PRINCIPAL] },
  { id: 'reports', label: 'Reports', icon: <FileBarChart size={20} />, roles: [Role.SUPER_ADMIN, Role.PRINCIPAL, Role.HOD] },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} />, roles: [Role.SUPER_ADMIN, Role.PRINCIPAL, Role.HOD, Role.FACULTY] },
];

export const MOCK_STUDENTS_COUNT = 50;
export const MOCK_FACULTY_COUNT = 15;
