import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import type { app } from 'firebase-admin';
import { FIREBASE_ADMIN } from './firebaseProvider';

@Controller('admin')
export class AdminActionsController {
    constructor(@Inject(FIREBASE_ADMIN) private readonly firebaseApp: app.App | null) {}

    @Get('status')
    status() {
        if (!this.firebaseApp) {
            throw new ServiceUnavailableException('Firebase Admin SDK is not initialized. Please check environmental variables.');
        }
        return {
            status: 'firebase-admin-ready',
            projectId: this.firebaseApp.options.projectId
        };
    }
}