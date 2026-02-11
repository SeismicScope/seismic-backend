import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

import { JwtGuard } from "../auth/guards/jwt.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ImportService } from "./import.service";

@Controller("import")
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(
            null,
            `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB
      },
      fileFilter: (_req, file, cb) => {
        if (extname(file.originalname).toLowerCase() !== ".csv") {
          return cb(new Error("Only CSV files are allowed"), false);
        }

        cb(null, true);
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.importService.createImport(file.path, file.originalname);
  }

  @UseGuards(JwtGuard)
  @Get("status/:id")
  async getStatus(@Param("id", ParseIntPipe) id: number) {
    return this.importService.getImportStatus(id);
  }
}
