
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const accounts = await prisma.account.findMany({
        select: {
            role: true,
            employee: {
                select: {
                    fullName: true,
                    employeeCode: true
                }
            }
        }
    });
    console.log(JSON.stringify(accounts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
