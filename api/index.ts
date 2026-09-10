// Explicit .js extension required: package.json sets "type": "module", so
// Node's ESM loader (unlike CommonJS require()) does not guess file
// extensions on relative imports. Without it, Vercel's Node runtime throws
// ERR_MODULE_NOT_FOUND for every single request, since it can't resolve the
// bare '../server' specifier at all. TypeScript maps '../server.js' to the
// '../server.ts' source file correctly under this project's moduleResolution.
import app from '../server.js';

export default app;
