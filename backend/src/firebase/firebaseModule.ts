import { Global, Module } from "@nestjs/common";
import { FirebaseProvider } from "./firebaseProvider";
import { AdminActionsController } from "./admin-actionsController";

@Global()
@Module({
    controllers: [AdminActionsController],
    providers: [FirebaseProvider],
    exports: [FirebaseProvider],
})
export class FirebaseModule {}