import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
const app = await NestFactory.create(AppModule, {
logger: ["log", "error", "warn", "debug", "verbose"],
});
app.enableCors();
const port = process.env.PORT || 4000;
await app.listen(port);
Logger.log(API listening on http://localhost:${port});
}
bootstrap();
