import { Provider, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as admin from "firebase-admin";

export const FIREBASE_ADMIN = 'FIREBASE_ADMIN';

export const FirebaseProvider: Provider = {
    provide: FIREBASE_ADMIN,
    inject: [ConfigService],
    useFactory: (config: ConfigService) => {
        const logger = new Logger('FirebaseProvider');

        if (admin.apps.length) {
            return admin.app();
        }

        const projectId = config.get('FIREBASE_PROJECT_ID');
        const clientEmail = config.get('FIREBASE_CLIENT_EMAIL');
        const privateKey = config.get('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');

        if (!projectId || !clientEmail || !privateKey) {
            logger.warn('Firebase admin credentials are not set (FIREBASE_PROJECT_ID / ' + ' FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY). Skipping Admin SDK init - ' + 'admin-only routes will be unavailable until these are provided.');
            return null;
        }

        const app = admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey
            }),
        });

        logger.log(`Firebase Admin initialized for project "${projectId}"`);
        return app;
    },
};