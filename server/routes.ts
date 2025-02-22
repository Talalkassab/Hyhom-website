import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Employee Profile Routes
  app.get("/api/employees/:id", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      const employee = await storage.getEmployee(employeeId);

      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      // Get all related information
      const [
        currentPosition,
        compensation,
        emergencyContacts,
        performanceReviews,
        benefits
      ] = await Promise.all([
        storage.getCurrentPosition(employeeId),
        storage.getCompensation(employeeId),
        storage.getEmergencyContacts(employeeId),
        storage.getPerformanceReviews(employeeId),
        storage.getEmployeeBenefits(employeeId)
      ]);

      // Get department and position details if available
      let department = null;
      let position = null;
      if (currentPosition) {
        position = await storage.getPosition(currentPosition.positionId);
        if (position) {
          department = await storage.getDepartment(position.departmentId);
        }
      }

      // Get manager details if available
      let manager = null;
      if (employee.managerId) {
        manager = await storage.getEmployee(employee.managerId);
      }

      res.json({
        ...employee,
        position,
        department,
        manager: manager ? {
          id: manager.id,
          firstName: manager.firstName,
          lastName: manager.lastName,
          email: manager.email
        } : null,
        compensation,
        emergencyContacts,
        performanceReviews,
        benefits
      });
    } catch (error) {
      console.error("Error fetching employee profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      const employee = await storage.getEmployee(employeeId);

      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const updatedEmployee = await storage.updateEmployee(employeeId, req.body);
      res.json(updatedEmployee);
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}