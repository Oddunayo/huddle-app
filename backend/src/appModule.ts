import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/healthModule';
import { FirebaseModule } from './firebase/firebaseModule';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        FirebaseModule,
        HealthModule
    ],
})
export class AppModule {}