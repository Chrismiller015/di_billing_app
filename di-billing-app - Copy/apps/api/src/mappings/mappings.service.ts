import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMappingDto } from "./dto/create-mapping.dto";
import { UpdateMappingDto } from "./dto/update-mapping.dto";
import { ListMappingsQueryDto } from "./dto/list-mappings.dto";

@Injectable()
export class MappingsService {
  constructor(private readonly db: PrismaService) {}

  create(createMappingDto: CreateMappingDto) {
    return this.db.pricing.create({ data: createMappingDto });
  }

  async list(query: ListMappingsQueryDto) {
    const { productCode, canonical, program } = query;
    const where: any = {};

    if (productCode) where.productCode = { contains: productCode, mode: 'insensitive' };
    if (canonical) where.canonical = { contains: canonical, mode: 'insensitive' };
    if (program) where.program = program;

    return this.db.pricing.findMany({ 
      where,
      orderBy: { productCode: "asc" } 
    });
  }

  async update(productCode: string, updateMappingDto: UpdateMappingDto) {
    try {
      return await this.db.pricing.update({
        where: { productCode },
        data: updateMappingDto,
      });
    } catch (error) {
      throw new NotFoundException(`Mapping with product code "${productCode}" not found`);
    }
  }

  async remove(productCode: string) {
    try {
      return await this.db.pricing.delete({ where: { productCode } });
    } catch (error) {
      throw new NotFoundException(`Mapping with product code "${productCode}" not found`);
    }
  }
}