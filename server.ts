import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "cookie-session";
import dotenv from "dotenv";
import helmet from "helmet";
import { Server, EVENTS, Upload } from '@tus/server';
import AWS from 'aws-sdk';
import { S3ClientConfig } from "@aws-sdk/client-s3";
import { S3Store } from '@tus/s3-store';

dotenv.config();

const app = express();

export const isProduction = process.env.NODE_ENV === "prod";

app.use(
  session({
    name: "session",
    keys: ["key1", "key2"],
    secure: isProduction ? true : false,
    httpOnly: true,
    sameSite: "none",
    domain: isProduction ? ".prixelart.com" : "localhost",
    path: "/",
    maxAge: 4 * 60 * 60 * 1000, // 4 hours = 14,400,000 ms
    overwrite: true,
  })
);

const frontEndUrl = process.env.FRONT_END_URL || "";

const allowedOrigins: string[] = [
  `http://${frontEndUrl}`,
  `https://${frontEndUrl}`,
  `http://admin.${frontEndUrl}`,
  `https://admin.${frontEndUrl}`,
  `http://prixer.${frontEndUrl}`,
  `https://prixer.${frontEndUrl}`,
  `https://www.${frontEndUrl}`,
  `www.${frontEndUrl}`,
];


app.disable("x-powered-by");

const tusCors = cors({
  origin: true, // Or your specific origins
  credentials: true,
  exposedHeaders: [
    "Location", "Upload-Offset", "Upload-Length", "Tus-Version",
    "Tus-Resumable", "Tus-Extension", "Tus-Max-Size", "Upload-Metadata",
  ],
  methods: ["OPTIONS", "POST", "HEAD", "PATCH", "DELETE"],
  allowedHeaders: [
    "Authorization", "Content-Type", "Cookie", "Origin", "Tus-Resumable",
    "Upload-Concat", "Upload-Length", "Upload-Metadata", "Upload-Offset",
    "X-HTTP-Method-Override", "X-Requested-With",
  ],
});


const s3EndpointHostname = process.env.PRIVATE_BUCKET_URL;
const s3BucketName = process.env.PUBLIC_BUCKET_NAME;
const s3AccessKeyId = process.env.DO_ACCESS_KEY;
const s3SecretAccessKey = process.env.DO_ACCESS_SECRET;
const s3Region = 'nyc3';

if (!s3EndpointHostname || !s3BucketName || !s3AccessKeyId || !s3SecretAccessKey || !s3Region) {
  console.error("FATAL ERROR: Missing S3 config. Check: PRIVATE_BUCKET_URL, PUBLIC_BUCKET_NAME, DO_ACCESS_KEY, DO_ACCESS_SECRET");
  process.exit(1);
}

// FOR LOCAL DEBUGGING ONLY - REMOVE BEFORE COMMITTING OR DEPLOYING
console.log("DEBUG: PRIVATE_BUCKET_URL:", process.env.PRIVATE_BUCKET_URL);
console.log("DEBUG: PUBLIC_BUCKET_NAME:", process.env.PUBLIC_BUCKET_NAME);
console.log("DEBUG: DO_ACCESS_KEY loaded:", process.env.DO_ACCESS_KEY ? `PRESENT (starts with ${process.env.DO_ACCESS_KEY.substring(0, 4)}...)` : "MISSING or EMPTY");
console.log("DEBUG: DO_ACCESS_SECRET loaded:", process.env.DO_ACCESS_SECRET ? "PRESENT (secret)" : "MISSING or EMPTY");
// END LOCAL DEBUGGING BLOCK

const s3ClientConfigForTus: S3ClientConfig & { bucket: string } = {
  endpoint: `https://${s3EndpointHostname}`,
  region: s3Region,
  credentials: {
    accessKeyId: s3AccessKeyId!,
    secretAccessKey: s3SecretAccessKey!,
  },
  bucket: s3BucketName!, // Crucial: bucket name is inside s3ClientConfig
  forcePathStyle: true,
};

const tusServer = new Server({
  path: '/files',
  datastore: new S3Store({
    partSize: 8 * 1024 * 1024, // ~8MB
    s3ClientConfig: s3ClientConfigForTus, // Pass the correctly typed object
  }),

  // Your onResponseError handler
  async onResponseError(req: any, err: Error | { status_code: number; body: string; }): Promise<{ status_code: number; body: string; }> {
    console.error(`[TUS SERVER - onResponseError] Error for request: ${req.method} ${req.url}`);
    let message = 'Internal Server Error';
    let statusCode = 500;

    if (typeof err === 'object' && err !== null && 'status_code' in err && 'body' in err) {
      statusCode = (err as { status_code: number }).status_code;
      message = (err as { body: string }).body;
    } else if (err instanceof Error) {
      message = err.message;
      console.error(`[TUS SERVER - onResponseError] Name: ${err.name}, Message: ${err.message}, Stack: ${err.stack}`);
    } else {
      console.error(`[TUS SERVER - onResponseError] Unknown error structure:`, err);
    }
    return { status_code: statusCode, body: JSON.stringify({ error: message }) };
  },

  // Debugging hook (if not already present from previous advice)
  async onUploadCreate(req: any, upload: Upload) {
    console.log(`[TUS SERVER - onUploadCreate] Hook. Proposed ID: ${upload.id}, Size: ${upload.size}, Meta: ${JSON.stringify(upload.metadata)}`);
    if (!upload.id) {
      console.error('[TUS SERVER - onUploadCreate] CRITICAL: Upload ID is undefined at onUploadCreate stage!');
    }
    return upload;
  },
  // ... other tusServer configurations
});

// Event Listeners: Use 'any' for req and res where the specific TUS types are not exported.
// Upload type should be available.
tusServer.on(EVENTS.POST_CREATE, (req: any, res: any, upload: Upload) => {
  console.log(`[TUS SERVER - ${EVENTS.POST_CREATE}] Upload creation process started.`);
  console.log(`  ID: ${upload.id}`);
  console.log(`  Size: ${upload.size}`);
  console.log(`  Metadata: ${JSON.stringify(upload.metadata)}`);
  if (upload.storage) {
    console.log(`  Storage Details: ${JSON.stringify(upload.storage)}`);
  }
});

tusServer.on(EVENTS.POST_RECEIVE, (req: any, upload: Upload) => {
  // console.log(`[TUS SERVER - ${EVENTS.POST_RECEIVE}] Upload receiving data for ID: ${upload.id}, Offset: ${upload.offset}`);
});

tusServer.on(EVENTS.POST_FINISH, (req: any, res: any, upload: Upload) => {
  console.log(`[TUS SERVER - ${EVENTS.POST_FINISH}] Upload finished: ${upload.id}`);
});

tusServer.on(EVENTS.POST_TERMINATE, (req: any, res: any, id: string) => {
  console.log(`[TUS SERVER - ${EVENTS.POST_TERMINATE}] Upload terminated: ${id}`);
});

app.options("/files", tusCors);
app.options("/files/*", tusCors);
app.all("/files", tusCors, tusServer.handle.bind(tusServer));
app.all("/files/*", tusCors, tusServer.handle.bind(tusServer));

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
    },
    exposedHeaders: ['Location'],
  })
);

app.use(helmet());
app.use(cookieParser());
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma"
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
  } else {
    next();
  }
});

// Importing routes
import userRoutes from "./user/userRoutes";
import prixerRoutes from "./prixer/prixerRoutes";
import adminRoutes from "./admin/adminRoutes";
import preferencesRoutes from "./preferences/preferencesRoutes";
import artRoutes from "./art/artRoutes";
import productRoutes from "./product/productRoutes";
import orderRoutes from "./order/orderRoutes";
import orderArchiveRoutes from "./orderArchive/orderArchiveRoutes";
import testimonialRoutes from "./testimonials/testimonialRoutes";
import discountRoutes from "./discount/discountRoutes";
import accountRoutes from "./account/accountRoutes";
import movementsRoutes from "./movements/movementRoutes";
import servicesRoutes from "./serviceOfPrixers/serviceRoutes";
import organizationsRoutes from "./organizations/organizationRoutes";
import surchargeRoutes from "./surcharge/surchargeRoutes";


app.use(express.urlencoded({ limit: "1mb", extended: false }));
app.use(express.json({ limit: "1mb" }));

app.use("/", userRoutes);
app.use("/", prixerRoutes);
app.use("/", adminRoutes);
app.use("/", artRoutes);
app.use("/", productRoutes);
app.use("/", orderRoutes);
app.use("/", orderArchiveRoutes);
app.use("/", preferencesRoutes);
app.use("/", testimonialRoutes);
app.use("/", discountRoutes);
app.use("/", accountRoutes);
app.use("/", movementsRoutes);
app.use("/", servicesRoutes);
app.use("/", organizationsRoutes);
app.use("/", surchargeRoutes);

import { promises as fs } from "fs";
import path from "path";

const uploadsDir = path.join(__dirname, "uploads");
const expireAfter = 3 * 24 * 60 * 60 * 1000; // 3 days

async function cleanOldFiles() {
  try {
    const files = await fs.readdir(uploadsDir);
    const now = Date.now();
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = await fs.stat(filePath);
      if (now - stats.mtime.getTime() > expireAfter) {
        await fs.unlink(filePath);
        console.log(`Deleted expired file: ${file}`);
      }
    }
  } catch (error) {
    console.error("Error cleaning old files:", error);
  }
}

setInterval(cleanOldFiles, 24 * 60 * 60 * 1000);

// Error-handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(err.status || 500);
  res.json({ error: err });
});

export default app;
