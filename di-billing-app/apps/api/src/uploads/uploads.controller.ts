import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as path from "path";
import { UploadsService } from "./uploads.service";

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9.-]+/g, "");
}

@Controller("uploads")
export class UploadsController {
  constructor(private readonly svc: UploadsService) {}

  @Get()
  list() {
    return this.svc.list();
  }

  @Delete('invoice/:id')
  deleteInvoice(@Param('id') id: string) {
    return this.svc.deleteInvoice(id);
  }

  @Post("invoice")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: path.resolve("uploads"),
        filename: (req, file, cb) =>
          cb(null, Date.now() + "_" + sanitize(file.originalname)),
      }),
    })
  )
  async uploadInvoice(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { program: string; period: string }
  ) {
    if (!file) throw new BadRequestException("No file");
    return this.svc.handleInvoiceUpload(
      file.path,
      file.originalname,
      body.program,
      body.period
    );
  }

  @Post("salesforce/subscriptions")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: path.resolve("uploads"),
        filename: (req, file, cb) =>
          cb(null, Date.now() + "_" + sanitize(file.originalname)),
      }),
    })
  )
  async uploadSubscriptions(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("No file");
    return this.svc.handleSubscriptionsUpload(file.path);
  }

  @Post("salesforce/accounts")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: path.resolve("uploads"),
        filename: (req, file, cb) =>
          cb(null, Date.now() + "_" + sanitize(file.originalname)),
      }),
    })
  )
  async uploadAccounts(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("No file");
    return this.svc.handleAccountsUpload(file.path);
  }

  @Post("salesforce/pricing")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: path.resolve("uploads"),
        filename: (req, file, cb) =>
          cb(null, Date.now() + "_" + sanitize(file.originalname)),
      }),
    })
  )
  async uploadPricing(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("No file");
    return this.svc.handlePricingUpload(file.path);
  }
}