import { pgTable, text, serial, integer, timestamp, date, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Departments Table
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

// Positions Table
export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  departmentId: integer("department_id").references(() => departments.id).notNull(),
});

// Employees Table with self-referencing manager_id
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dob: date("dob"),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  managerId: integer("manager_id").references(() => employees.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Employee Positions Junction Table
export const employeePositions = pgTable("employee_positions", {
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  positionId: integer("position_id").references(() => positions.id).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
});

// Compensation Table
export const compensation = pgTable("compensation", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull(),
  effectiveDate: date("effective_date").notNull(),
});

// Emergency Contacts Table
export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  contactName: text("contact_name").notNull(),
  relationship: text("relationship").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
});

// Performance Reviews Table
export const performanceReviews = pgTable("performance_reviews", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  reviewDate: date("review_date").notNull(),
  rating: integer("rating").notNull(),
  comments: text("comments"),
  managerId: integer("manager_id").references(() => employees.id).notNull(),
});

// Benefits Table
export const benefits = pgTable("benefits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

// Employee Benefits Junction Table
export const employeeBenefits = pgTable("employee_benefits", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  benefitId: integer("benefit_id").references(() => benefits.id).notNull(),
  enrollmentDate: date("enrollment_date").notNull(),
});

// Create insert schemas with validation
export const insertDepartmentSchema = createInsertSchema(departments);
export const insertPositionSchema = createInsertSchema(positions);
export const insertEmployeeSchema = createInsertSchema(employees, {
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters").optional(),
});
export const insertEmployeePositionSchema = createInsertSchema(employeePositions);
export const insertCompensationSchema = createInsertSchema(compensation);
export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts);
export const insertPerformanceReviewSchema = createInsertSchema(performanceReviews);
export const insertBenefitSchema = createInsertSchema(benefits);
export const insertEmployeeBenefitSchema = createInsertSchema(employeeBenefits);

// Export types
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type Position = typeof positions.$inferSelect;
export type InsertPosition = z.infer<typeof insertPositionSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type EmployeePosition = typeof employeePositions.$inferSelect;
export type InsertEmployeePosition = z.infer<typeof insertEmployeePositionSchema>;

export type Compensation = typeof compensation.$inferSelect;
export type InsertCompensation = z.infer<typeof insertCompensationSchema>;

export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type InsertEmergencyContact = z.infer<typeof insertEmergencyContactSchema>;

export type PerformanceReview = typeof performanceReviews.$inferSelect;
export type InsertPerformanceReview = z.infer<typeof insertPerformanceReviewSchema>;

export type Benefit = typeof benefits.$inferSelect;
export type InsertBenefit = z.infer<typeof insertBenefitSchema>;

export type EmployeeBenefit = typeof employeeBenefits.$inferSelect;
export type InsertEmployeeBenefit = z.infer<typeof insertEmployeeBenefitSchema>;

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;
export type SignupCredentials = z.infer<typeof signupSchema>;