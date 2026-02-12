import winston from "winston";
import { utilities as nestWinstonModuleUtilities } from "nest-winston";

const isProduction = process.env.NODE_ENV === "production";

export const winstonConfig: winston.LoggerOptions = {
  level: isProduction ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.ms(),
    winston.format.errors({ stack: true }),
    nestWinstonModuleUtilities.format.nestLike("Nest", {
      colors: true,
      prettyPrint: true,
    }),
  ),
  transports: [new winston.transports.Console()],
};
