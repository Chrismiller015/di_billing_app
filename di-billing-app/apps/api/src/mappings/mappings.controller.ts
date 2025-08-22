import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from "@nestjs/common";
import { MappingsService } from "./mappings.service";
import { CreateMappingDto } from "./dto/create-mapping.dto";
import { UpdateMappingDto } from "./dto/update-mapping.dto";

@Controller("mappings")
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class MappingsController {
constructor(private readonly svc: MappingsService) {}

@Post()
create(@Body() createMappingDto: CreateMappingDto) {
return this.svc.create(createMappingDto);
}

@Get()
list() {
return this.svc.list();
}

@Patch(':productCode')
update(@Param('productCode') productCode: string, @Body() updateMappingDto: UpdateMappingDto) {
return this.svc.update(productCode, updateMappingDto);
}

@Delete(':productCode')
remove(@Param('productCode') productCode: string) {
return this.svc.remove(productCode);
}
}
