import 'server-only';
import snapshot from '@/generated/kammara-app.json';
import { createContentApi } from './kammara-app-api.mjs';

export const kammaraContentApi = createContentApi(snapshot);
