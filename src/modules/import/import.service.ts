import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";

@Injectable()
export class ImportService {
  constructor(
    @InjectQueue("import-earthquakes") private readonly earthquakeQueue: Queue,
  ) {}

  async addImportJob(filePath: string) {
    await this.earthquakeQueue.add("import", { filePath });
  }
}
