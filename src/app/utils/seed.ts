import { envVars } from "../../config/env";
import { Role } from "../../generated/prisma/enums"
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma"

export const seedAdmin = async () => {
    try {
        const isAdminExist = await prisma.user.findFirst({
            where: {
                role: Role.ADMIN
            }
        });
        if (isAdminExist) {
            console.log('Admin alreday exist. Skipping seeding admin');
            return;
        }

        const adminUser = await auth.api.signUpEmail({
            body: {
                name: envVars.ADMIN_NAME,
                email: envVars.ADMIN_EMAIL,
                password: envVars.ADMIN_PASSWORD,
                image: envVars.ADMIN_IMAGE,
                role: Role.ADMIN,
                needPasswordChange: false,
                rememberMe: false,
            }
        })

        await prisma.user.update({
            where: {
                id: adminUser.user.id
            },
            data: {
                emailVerified: true,
            }
        })

        const admin = await prisma.user.findFirst({
            where: {
                id: adminUser.user.id
            }
        })

        console.log('Admin created successfully', admin);
    } catch (error) {
        console.log('Failed to seed admin', error);
        await prisma.user.delete({
            where: {
                email: envVars.ADMIN_EMAIL
            }
        })
    }
}