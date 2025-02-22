import { 
  employees, departments, positions, employeePositions, compensation,
  emergencyContacts, performanceReviews, benefits, employeeBenefits,
  type Employee, type InsertEmployee,
  type Department, type InsertDepartment,
  type Position, type InsertPosition,
  type EmployeePosition, type InsertEmployeePosition,
  type Compensation, type InsertCompensation,
  type EmergencyContact, type InsertEmergencyContact,
  type PerformanceReview, type InsertPerformanceReview,
  type Benefit, type InsertBenefit,
  type EmployeeBenefit, type InsertEmployeeBenefit
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Employee operations
  getEmployee(id: number): Promise<Employee | undefined>;
  getEmployeeByEmail(email: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee>;

  // Department operations
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;

  // Position operations
  getPosition(id: number): Promise<Position | undefined>;
  createPosition(position: InsertPosition): Promise<Position>;

  // Employee Position operations
  assignPosition(employeePosition: InsertEmployeePosition): Promise<EmployeePosition>;
  getCurrentPosition(employeeId: number): Promise<EmployeePosition | undefined>;

  // Compensation operations
  getCompensation(employeeId: number): Promise<Compensation | undefined>;
  createCompensation(compensation: InsertCompensation): Promise<Compensation>;

  // Emergency Contact operations
  getEmergencyContacts(employeeId: number): Promise<EmergencyContact[]>;
  createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact>;

  // Performance Review operations
  getPerformanceReviews(employeeId: number): Promise<PerformanceReview[]>;
  createPerformanceReview(review: InsertPerformanceReview): Promise<PerformanceReview>;

  // Benefit operations
  getBenefit(id: number): Promise<Benefit | undefined>;
  createBenefit(benefit: InsertBenefit): Promise<Benefit>;

  // Employee Benefit operations
  getEmployeeBenefits(employeeId: number): Promise<EmployeeBenefit[]>;
  enrollInBenefit(enrollment: InsertEmployeeBenefit): Promise<EmployeeBenefit>;
}

export class DatabaseStorage implements IStorage {
  // Employee operations
  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async getEmployeeByEmail(email: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.email, email));
    return employee;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db.insert(employees).values(employee).returning();
    return newEmployee;
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee> {
    const [updatedEmployee] = await db
      .update(employees)
      .set(employee)
      .where(eq(employees.id, id))
      .returning();
    return updatedEmployee;
  }

  // Department operations
  async getDepartment(id: number): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department;
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const [newDepartment] = await db.insert(departments).values(department).returning();
    return newDepartment;
  }

  // Position operations
  async getPosition(id: number): Promise<Position | undefined> {
    const [position] = await db.select().from(positions).where(eq(positions.id, id));
    return position;
  }

  async createPosition(position: InsertPosition): Promise<Position> {
    const [newPosition] = await db.insert(positions).values(position).returning();
    return newPosition;
  }

  // Employee Position operations
  async assignPosition(employeePosition: InsertEmployeePosition): Promise<EmployeePosition> {
    const [assignment] = await db.insert(employeePositions).values(employeePosition).returning();
    return assignment;
  }

  async getCurrentPosition(employeeId: number): Promise<EmployeePosition | undefined> {
    const [currentPosition] = await db
      .select()
      .from(employeePositions)
      .where(
        and(
          eq(employeePositions.employeeId, employeeId),
          eq(employeePositions.endDate, null)
        )
      );
    return currentPosition;
  }

  // Compensation operations
  async getCompensation(employeeId: number): Promise<Compensation | undefined> {
    const [currentCompensation] = await db
      .select()
      .from(compensation)
      .where(eq(compensation.employeeId, employeeId))
      .orderBy(compensation.effectiveDate)
      .limit(1);
    return currentCompensation;
  }

  async createCompensation(comp: InsertCompensation): Promise<Compensation> {
    const [newCompensation] = await db.insert(compensation).values(comp).returning();
    return newCompensation;
  }

  // Emergency Contact operations
  async getEmergencyContacts(employeeId: number): Promise<EmergencyContact[]> {
    return db
      .select()
      .from(emergencyContacts)
      .where(eq(emergencyContacts.employeeId, employeeId));
  }

  async createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact> {
    const [newContact] = await db.insert(emergencyContacts).values(contact).returning();
    return newContact;
  }

  // Performance Review operations
  async getPerformanceReviews(employeeId: number): Promise<PerformanceReview[]> {
    return db
      .select()
      .from(performanceReviews)
      .where(eq(performanceReviews.employeeId, employeeId))
      .orderBy(performanceReviews.reviewDate);
  }

  async createPerformanceReview(review: InsertPerformanceReview): Promise<PerformanceReview> {
    const [newReview] = await db.insert(performanceReviews).values(review).returning();
    return newReview;
  }

  // Benefit operations
  async getBenefit(id: number): Promise<Benefit | undefined> {
    const [benefit] = await db.select().from(benefits).where(eq(benefits.id, id));
    return benefit;
  }

  async createBenefit(benefit: InsertBenefit): Promise<Benefit> {
    const [newBenefit] = await db.insert(benefits).values(benefit).returning();
    return newBenefit;
  }

  // Employee Benefit operations
  async getEmployeeBenefits(employeeId: number): Promise<EmployeeBenefit[]> {
    return db
      .select()
      .from(employeeBenefits)
      .where(eq(employeeBenefits.employeeId, employeeId));
  }

  async enrollInBenefit(enrollment: InsertEmployeeBenefit): Promise<EmployeeBenefit> {
    const [newEnrollment] = await db.insert(employeeBenefits).values(enrollment).returning();
    return newEnrollment;
  }
}

export const storage = new DatabaseStorage();