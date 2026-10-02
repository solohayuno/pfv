"use server";

import {
  findSacramentDate,
  type FindSacramentDateInput,
  type FindSacramentDateOutput,
} from "@/ai/flows/sacrament-date-finder";
import allowedEmails from '@/lib/allowed-emails.json';
import fs from 'fs/promises';
import path from 'path';

// Define the path to the enrollments file
const enrollmentsPath = path.join(process.cwd(), 'enrollments.json');

async function getEnrollments() {
  try {
    await fs.access(enrollmentsPath);
    const data = await fs.readFile(enrollmentsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist, return an empty array
    return [];
  }
}

export async function findSacramentDateAction(
  input: FindSacramentDateInput
): Promise<FindSacramentDateOutput> {
  try {
    const result = await findSacramentDate(input);
    return result;
  } catch (error) {
    console.error("Error in findSacramentDateAction:", error);
    throw new Error("An error occurred while trying to find the sacrament date.");
  }
}

export async function checkEmailAccess(email: string): Promise<{ hasAccess: boolean }> {
  const emailList: string[] = allowedEmails.emails;
  const hasAccess = emailList.includes(email.toLowerCase());
  return { hasAccess };
}

export async function saveEnrollmentAction(formData: any): Promise<{ success: boolean; error?: string }> {
  try {
    const enrollments = await getEnrollments();
    
    const newEnrollment = {
      ...formData,
      submissionDate: new Date().toISOString(),
    };

    enrollments.push(newEnrollment);

    await fs.writeFile(enrollmentsPath, JSON.stringify(enrollments, null, 2));

    return { success: true };
  } catch (error) {
    console.error("Error saving enrollment:", error);
    return { success: false, error: "Failed to save enrollment." };
  }
}
