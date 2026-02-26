import {z} from "zod";
import {Gender} from "../enums/Gender";

export const UserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email address"),
    phone: z.string("Phone email address"),
    gender: z.enum(Gender),
    password: z.string().min(6, "Password must be at least 6 characters"),
    companyName: z.string().min(3, "Company name is required"),
    address: z.string().optional(),
    description: z.string().optional(),
});