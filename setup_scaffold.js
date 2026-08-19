const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname);

function writeFile(filePath, content) {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(rootDir, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Created:', fullPath);
}

// 1. Root package.json
writeFile('package.json', JSON.stringify({
  name: campifa-root,
  version: 1.0.0,
  private: true,
  description: CampiFa - Campaign Poster Personalization Platform by i-Fa Design,
  scripts: {
    dev: concurrently "npm run dev --prefix backend" "npm run dev --prefix frontend",
    dev:backend: npm run dev --prefix backend,
    dev:frontend: npm run dev --prefix frontend,
    build: npm run build --prefix backend && npm run build --prefix frontend,
    db:push: npm run db:push --prefix backend,
    db:seed: npm run db:seed --prefix backend,
    start: npm run start --prefix backend
  },
  devDependencies: {
    concurrently: ^8.2.2
  }
}, null, 2));

// 2. .env.example
writeFile('.env.example', 
PORT=5000
NODE_ENV=development
APP_URL=http://localhost:3000
API_URL=http://localhost:5000
DATABASE_URL=file:../prisma/dev.db
JWT_SECRET=campifa_super_secret_jwt_key_2026_change_in_production
SESSION_SECRET=campifa_session_secret_2026
UPLOAD_DIR=../uploads
STORAGE_DRIVER=local
# Optional S3 Storage configuration:
# STORAGE_ENDPOINT=https://s3.amazonaws.com
# STORAGE_BUCKET=campifa-assets
# STORAGE_ACCESS_KEY=your_access_key
# STORAGE_SECRET_KEY=your_secret_key
# STORAGE_REGION=us-east-1
);

// 3. Backend package.json
writeFile('backend/package.json', JSON.stringify({
  name: campifa-backend,
  version: 1.0.0,
  description: CampiFa Backend API,
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

// 4. Backend tsconfig.json
writeFile('backend/tsconfig.json', JSON.stringify({
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

// 5. Frontend package.json
writeFile('frontend/package.json', JSON.stringify({
  name: campifa-frontend,
  private: true,
  version: 1.0.0,
  type: module,
  scripts: {
    dev: vite,
    build: tsc && vite build,
    preview: vite preview
  },
  dependencies: {
    canvas-confetti: ^1.9.3,
    clsx: ^2.1.1,
    lucide-react: ^0.441.0,
    qrcode: ^1.5.4,
    react: ^18.3.1,
    react-dom: ^18.3.1,
    react-router-dom: ^6.26.2,
    tailwind-merge: ^2.5.2
  },
  devDependencies: {
    @types/canvas-confetti: ^1.9.0,
    @types/node: ^20.16.5,
    @types/qrcode: ^1.5.5,
    @types/react: ^18.3.5,
    @types/react-dom: ^18.3.0,
    @vitejs/plugin-react: ^4.3.1,
    autoprefixer: ^10.4.20,
    postcss: ^8.4.47,
    tailwindcss: ^3.4.11,
    typescript: ^5.6.2,
    vite: ^5.4.6
  }
}, null, 2));

// 6. Frontend tsconfig.json
writeFile('frontend/tsconfig.json', JSON.stringify({
  compilerOptions: {
    target: ES2020,
    useDefineForClassFields: true,
    lib: [ES2020, DOM, DOM.Iterable],
    module: ESNext,
    skipLibCheck: true,
    moduleResolution: bundler,
    allowImportingTsExtensions: false,
    resolveJsonModule: true,
    isolatedModules: true,
    noEmit: true,
    jsx: react-jsx,
    strict: true,
    noUnusedLocals: false,
    noUnusedParameters: false,
    noFallthroughCasesInSwitch: true
  },
  include: [src]
}, null, 2));

// 7. Frontend vite.config.ts
writeFile('frontend/vite.config.ts', 
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
);

// 8. Tailwind & PostCSS configs
writeFile('frontend/tailwind.config.js', 
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    ./index.html,
    ./src/**/*.{js,ts,jsx,tsx},
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#7B2525',
          secondary: '#BA6A4C',
          light: '#FFF4E5',
          dark: '#242424',
          accent: '#E07A5F',
          muted: '#8D7B7B',
          surface: '#FFFFFF',
          bg: '#FAFAF8',
          card: '#FFFFFF',
          border: '#E8E1D9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)',
        'card': '0 4px 20px -2px rgba(123, 37, 37, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'elevated': '0 20px 25px -5px rgba(123, 37, 37, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
);

writeFile('frontend/postcss.config.js', 
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
);

console.log('Project setup file written successfully.');
