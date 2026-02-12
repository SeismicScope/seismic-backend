import Joi from "joi";

export const envValidationSchema = Joi.object({
  DATABASE_URL: Joi.string().uri().required(),

  IO_REDIS_HOST: Joi.string().default("localhost"),
  IO_REDIS_PORT: Joi.number().port().default(6379),

  PORT: Joi.number().port().default(3000),

  JWT_SECRET: Joi.string().min(8).required(),

  NODE_ENV: Joi.string()
    .valid("develop", "production", "test")
    .default("develop"),

  FRONTEND_URL: Joi.string().uri().required(),

  SENTRY_DSN: Joi.string().allow("").default(""),
});
