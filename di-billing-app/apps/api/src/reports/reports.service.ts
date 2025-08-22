import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReportsService {
constructor(private readonly db: PrismaService) {}
async list() {
return this.db.report.findMany({ orderBy: { createdAt: "desc" } });
}
}
