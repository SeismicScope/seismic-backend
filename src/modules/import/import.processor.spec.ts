import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { PrismaService } from "prisma/prisma.service";

import { ImportProcessor } from "./import.processor";

describe("ImportProcessor", () => {
  let processor: ImportProcessor;
  let tmpDir: string;

  const mockTx = {
    earthquake: {
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    $executeRawUnsafe: jest.fn().mockResolvedValue(0),
  };

  const mockPrisma = {
    importJob: {
      update: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn((cb: any) => cb(mockTx)),
  };

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "import-test-"));
    processor = new ImportProcessor(mockPrisma as unknown as PrismaService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true });
    }
  });

  function createCsvFile(content: string): string {
    const filePath = path.join(tmpDir, "test.csv");
    fs.writeFileSync(filePath, content);

    return filePath;
  }

  function createMockJob(filePath: string, jobId = 1) {
    return { data: { filePath, jobId } } as any;
  }

  it("should throw error when file does not exist", async () => {
    const job = createMockJob("/nonexistent/file.csv");

    await expect(processor.process(job)).rejects.toThrow("File not found");
  });

  it("should process valid CSV rows", async () => {
    const csvContent = [
      "time,latitude,longitude,id,mag,depth,place",
      "2023-01-15T10:30:00.000Z,35.05,139.129,us2023abc,6.3,15,Tokyo",
      "2023-02-20T14:00:00.000Z,-33.86,151.2,us2023xyz,4.5,25,Sydney",
    ].join("\n");

    const filePath = createCsvFile(csvContent);
    const job = createMockJob(filePath);

    const result = await processor.process(job);

    expect(result).toEqual({ success: true, total: 2 });
    expect(mockPrisma.importJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: "completed", processed: 2 },
      }),
    );
  });

  it("should skip invalid rows", async () => {
    const csvContent = [
      "time,latitude,longitude,id,mag,depth,place",
      "invalid-date,35.05,139.129,us2023abc,6.3,15,Tokyo",
      "2023-02-20T14:00:00.000Z,-33.86,151.2,us2023xyz,4.5,25,Sydney",
    ].join("\n");

    const filePath = createCsvFile(csvContent);
    const job = createMockJob(filePath);

    const result = await processor.process(job);

    expect(result).toEqual({ success: true, total: 1 });
  });

  it("should update status to processing before starting", async () => {
    const csvContent = "time,latitude,longitude,id,mag,depth,place\n";
    const filePath = createCsvFile(csvContent);
    const job = createMockJob(filePath, 42);

    await processor.process(job);

    expect(mockPrisma.importJob.update).toHaveBeenCalledWith({
      where: { id: 42 },
      data: { status: "processing" },
    });
  });

  it("should delete file after successful processing", async () => {
    const csvContent = "time,latitude,longitude,id,mag,depth,place\n";
    const filePath = createCsvFile(csvContent);
    const job = createMockJob(filePath);

    await processor.process(job);

    expect(fs.existsSync(filePath)).toBe(false);
  });

  it("should delete file after failed processing", async () => {
    const csvContent = [
      "time,latitude,longitude,id,mag,depth,place",
      "2023-01-15T10:30:00.000Z,35.05,139.129,us2023abc,6.3,15,Tokyo",
    ].join("\n");

    const filePath = createCsvFile(csvContent);
    const job = createMockJob(filePath);

    mockPrisma.$transaction.mockRejectedValueOnce(new Error("DB Error"));

    await expect(processor.process(job)).rejects.toThrow("DB Error");

    expect(fs.existsSync(filePath)).toBe(false);
  });

  it("should set status to failed on error", async () => {
    const csvContent = [
      "time,latitude,longitude,id,mag,depth,place",
      "2023-01-15T10:30:00.000Z,35.05,139.129,us2023abc,6.3,15,Tokyo",
    ].join("\n");

    const filePath = createCsvFile(csvContent);
    const job = createMockJob(filePath, 7);

    mockPrisma.$transaction.mockRejectedValueOnce(new Error("DB Error"));

    await expect(processor.process(job)).rejects.toThrow();

    expect(mockPrisma.importJob.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { status: "failed" },
    });
  });

  it("should handle empty CSV file", async () => {
    const csvContent = "time,latitude,longitude,id,mag,depth,place\n";
    const filePath = createCsvFile(csvContent);
    const job = createMockJob(filePath);

    const result = await processor.process(job);

    expect(result).toEqual({ success: true, total: 0 });
  });

  it("should use transaction for batch processing", async () => {
    const csvContent = [
      "time,latitude,longitude,id,mag,depth,place",
      "2023-01-15T10:30:00.000Z,35.05,139.129,us001,6.3,15,Tokyo",
    ].join("\n");

    const filePath = createCsvFile(csvContent);
    const job = createMockJob(filePath);

    await processor.process(job);

    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(mockTx.earthquake.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skipDuplicates: true,
      }),
    );
  });
});
