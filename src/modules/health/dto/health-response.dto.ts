import { ApiProperty } from "@nestjs/swagger";

export class HealthResponseDto {
  @ApiProperty({ example: "ok", enum: ["ok", "error"] })
  status!: string;

  @ApiProperty({ example: 12345.67 })
  uptime!: number;

  @ApiProperty({ example: "2023-01-15T10:30:00.000Z" })
  timestamp!: string;

  @ApiProperty({ example: "connected", enum: ["connected", "disconnected"] })
  db!: string;
}
