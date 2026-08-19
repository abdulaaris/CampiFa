const fs = require('fs');
const path = require('path');

function save(relPath, content) {
  const target = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content.trim() + '\n', 'utf8');
  console.log('Created: ' + relPath);
}

// 1. Backend Package JSON
save('backend/package.json', JSON.stringify({
   name: campifa-backend,
  version: 1.0.0,
  main: dist/server.js,
  scripts: {
    build: tsc,
    start: node dist/server.js,
    dev: tsx watch src/server.ts,
    prisma:generate: prisma generate --schema=../prisma/schema.prisma,
    db:push: prisma db push --schema=../prisma/schema.prisma,
    db:seed: tsx src/seed.ts
  },
  dependencies: {
    @prisma/client: ^5.19.1,
    bcryptjs: ^2.4.3,
    cookie-parser: ^1.4.6,
    cors: ^2.8.5,
    dotenv: ^16.4.5,
    express: ^4.21.0,
    express-rate-limit: ^7.4.0,
    helmet: ^7.1.0,
    jsonwebtoken: ^9.0.2,
    morgan: ^1.10.0,
    multer: ^1.4.5-lts.1,
    qrcode: ^1.5.4,
    sharp: ^0.33.5,
    zod: ^3.23.8
  },
  devDependencies: {
    @types/bcryptjs: ^2.4.6,
    @types/cookie-parser: ^1.4.7,
    @types/cors: ^2.8.17,
    @types/express: ^4.17.21,
    @types/jsonwebtoken: ^9.0.7,
    @types/morgan: ^1.9.9,
    @types/multer: ^1.4.12,
    @types/node: ^20.16.5,
    @types/qrcode: ^1.5.5,
    prisma: ^5.19.1,
    tsx: ^4.19.1,
    typescript: ^5.6.2
  }
}, null, 2));

// 2. Backend tsconfig.json
save('backend/tsconfig.json', JSON.stringify({
  compilerOptions: {
    target: ES2022,
    module: CommonJS,
    moduleResolution: node,
    outDir: ./dist,
    rootDir: ./src,
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    resolveJsonModule: true
  },
  include: [src/**/*]
}, null, 2));

// 3. Env
const envStr = PORT=5000
NODE_ENV=development
APP_URL=http://localhost:3000
API_URL=http://localhost:5000
DATABASE_URL=file:../prisma/dev.db
JWT_SECRET=campifa_super_secret_jwt_key_2026_production_grade
SESSION_SECRET=campifa_session_secret_2026
UPLOAD_DIR=../uploads
STORAGE_DRIVER=local;

save('.env.example', envStr);
save('backend/.env', envStr);

// 4. Root package.json
save('package.json', JSON.stringify({
  name: campifa,
  version: 1.0.0,
  private: true,
  scripts: {
    dev:backend: npm run dev --prefix backend,
    dev:frontend: npm run dev --prefix frontend,
    build:backend: npm run build --prefix backend,
    build:frontend: npm run build --prefix frontend,
    db:push: npm run db:push --prefix backend,
    db:seed: npm run db:seed --prefix backend
  }
}, null, 2));

console.log('Backend configs written.');