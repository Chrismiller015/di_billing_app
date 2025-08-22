import { Controller, Get } from "@nestjs/common";
import { MappingsService } from "./mappings.service";

@Controller("mappings")
export class MappingsController {
constructor(private readonly svc: MappingsService) {}
@Get()
list() {
return this.svc.list();
}
}
