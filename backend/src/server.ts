import * as wsApi from "./ws";
import * as restApi from "./rest";

async function bootstrap() {
  try {
    const port = 8000;
    const httpServer = restApi.listen(port);
    wsApi.listen(httpServer);
  } catch (err) {
    console.log("App Bootstrap Error: ", err);
  }
}

bootstrap();