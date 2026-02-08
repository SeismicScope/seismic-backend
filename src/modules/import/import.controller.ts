import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { JwtGuard } from "../auth/guards/jwt.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ImportService } from "./import.service";

@Controller("import")
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async upload(@UploadedFile() file: Express.Multer.File) {
    await this.importService.addImportJob(file.path);

    return { status: "queued" };
  }
}
