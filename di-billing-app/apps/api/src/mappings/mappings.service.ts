import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MappingsService {
constructor(private readonly db: PrismaService) {}
async list() {
return this.db.pricing.findMany({ orderBy: { productCode: "asc" } });
}
}
