// server.ts CON S3Store, ID plano en onUploadCreate, y corrección CORS

import express, {
  Request as ExpressRequest,
  Response,
  NextFunction,
} from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import session from "cookie-session"
import dotenv from "dotenv"
import helmet from "helmet"
import { Server, EVENTS, Upload, ServerOptions } from "@tus/server"
import { S3Store, S3StoreOptions } from "@tus/s3-store"
import { S3ClientConfig } from "@aws-sdk/client-s3"

import path from "path"
import { fileURLToPath } from "node:url"
import pathNode from "node:path"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

export const isProduction = process.env.NODE_ENV === "prod"

app.use(
  session({
    name: "session",
    keys: [
      "tu_clave_secreta_1_super_segura_y_unica_final_v7",
      "tu_clave_secreta_2_super_segura_y_unica_final_v7",
    ],
    secure: isProduction ? true : false,
    httpOnly: true,
    sameSite: "none",
    domain: isProduction ? ".prixelart.com" : "localhost",
    path: "/",
    maxAge: 4 * 60 * 60 * 1000,
    overwrite: true,
  })
)

const frontEndUrl = process.env.FRONT_END_URL || "http://localhost:3000"
const allowedOrigins: string[] = [
  `http://${frontEndUrl}`,
  `https://${frontEndUrl}`,
  `http://admin.${frontEndUrl}`,
  `https://admin.${frontEndUrl}`,
  `http://prixer.${frontEndUrl}`,
  `https://prixer.${frontEndUrl}`,
  `https://www.${frontEndUrl}`,
  `www.${frontEndUrl}`,
  "http://localhost:3000",
  "http://localhost:5173",
]

app.disable("x-powered-by")

const TUS_EXPOSED_HEADERS_LIST = [
  "Location",
  "Upload-Offset",
  "Upload-Length",
  "Tus-Version",
  "Tus-Resumable",
  "Tus-Extension",
  "Tus-Max-Size",
  "Upload-Metadata",
  "Upload-Defer-Length",
  "Upload-Concat",
  "x-final-url",
]
const TUS_EXPOSED_HEADERS_STRING = TUS_EXPOSED_HEADERS_LIST.join(", ")

const tusCors = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      console.warn(
        `CORS Bloqueado para TUS: Origen '${origin}' no en allowedOrigins.`
      )
      callback(new Error(`Origen '${origin}' no permitido por TUS CORS`))
    }
  },
  credentials: true,
  exposedHeaders: TUS_EXPOSED_HEADERS_STRING,
  methods: ["OPTIONS", "POST", "HEAD", "PATCH", "DELETE"],
  allowedHeaders: [
    "Authorization",
    "Content-Type",
    "Cookie",
    "Origin",
    "Tus-Resumable",
    "Upload-Concat",
    "Upload-Length",
    "Upload-Metadata",
    "Upload-Offset",
    "X-HTTP-Method-Override",
    "X-Requested-With",
  ],
})

const tusFilesPath: string = "/files"

const doSpacesEndpoint: string | undefined = process.env.PRIVATE_BUCKET_URL
const doSpacesRegion: string = process.env.DO_SPACES_REGION || "nyc3"
const doSpacesBucket: string | undefined = process.env.PUBLIC_BUCKET_NAME
const doSpacesAccessKey: string | undefined = process.env.DO_ACCESS_KEY
const doSpacesSecretKey: string | undefined = process.env.DO_ACCESS_SECRET

if (
  !doSpacesEndpoint ||
  !doSpacesRegion ||
  !doSpacesBucket ||
  !doSpacesAccessKey ||
  !doSpacesSecretKey
) {
  console.error(
    "FATAL ERROR: Credenciales y configuración de DigitalOcean Spaces faltantes."
  )
  process.exit(1)
}

const s3ClientConfig: S3ClientConfig & { bucket: string } = {
  bucket: doSpacesBucket,
  region: doSpacesRegion,
  endpoint: `https://${doSpacesEndpoint}`,
  credentials: {
    accessKeyId: doSpacesAccessKey,
    secretAccessKey: doSpacesSecretKey,
  },
  forcePathStyle: true,
}

const s3StoreOptions: S3StoreOptions = {
  s3ClientConfig: s3ClientConfig,
  uploadParams: (req: any, upload: any) => {
    return {
      ACL: "public-read",
    }
  },
}

const tusServer = new Server({
  path: tusFilesPath,
  datastore: new S3Store(s3StoreOptions),

  async onUploadCreate(req: any, upload: Upload) {
    const originalFilename = upload.metadata?.filename || upload.metadata?.name
    let extension = ""
    if (originalFilename && typeof originalFilename === "string") {
      extension = pathNode.extname(originalFilename)
    }
    // Usar un ID plano (UUID + extensión) para la clave S3
    upload.id = `${upload.id}${extension}`

    console.log(
      `[TUS SERVER (S3Store) - onUploadCreate] Hook. ID modificado a S3 Key (plano): ${
        upload.id
      }, Size: ${upload.size}, Meta: ${JSON.stringify(upload.metadata)}`
    )
    return upload
  },

  onUploadFinish: async (req: any, upload: Upload): Promise<any> => {
    console.log(
      `[onUploadFinish] Subida finalizada para ID (S3 Key): ${upload.id}`
    )
    const objectKey = upload.id // Ahora es el ID plano + extensión
    if (!objectKey) {
      console.error(
        `[onUploadFinish] Error: No se pudo determinar objectKey para upload ID: ${upload.id}`
      )
      return {
        status_code: 500,
        body: "Error Interno del Servidor: No object key.",
      }
    }

    const cleanObjectKey = objectKey.startsWith("/")
      ? objectKey.substring(1)
      : objectKey
    const finalUrl = `https://${doSpacesBucket}.${doSpacesEndpoint}/${cleanObjectKey}` // URL directa al objeto en S3

    console.log(
      `[onUploadFinish] Devolviendo encabezados: x-final-url y Access-Control-Expose-Headers`
    )
    return {
      headers: {
        "x-final-url": finalUrl,
        "Access-Control-Expose-Headers": TUS_EXPOSED_HEADERS_STRING,
      },
    }
  },

  onResponseError: async (
    req: any,
    error: Error | { status_code: number; body: string }
  ) => {
    console.error("[onResponseError] Error del Servidor TUS:", error)
    if (error instanceof Error) {
      return {
        status_code: 500,
        body: `Ocurrió un error inesperado: ${error.message}`,
      }
    }
    return error as { status_code: number; body: string }
  },
})

tusServer.on(
  EVENTS.POST_CREATE,
  (req: ExpressRequest, res: Response, upload: Upload) => {
    console.log(
      `[TUS SERVER (S3Store) - ${EVENTS.POST_CREATE}] Evento recibido.`
    )
    console.log(`  ---> ID en POST_CREATE: ${upload.id}`)
    // ... otros logs ...
  }
)

tusServer.on(
  EVENTS.POST_FINISH,
  (req: ExpressRequest, res: Response, upload: Upload) => {
    console.log(
      `[TUS SERVER (S3Store) - ${EVENTS.POST_FINISH}] Listener: Subida finalizada para ID: ${upload.id}.`
    )
  }
)

app.use(helmet())
const tusMiddleware = tusServer.handle.bind(tusServer)
app.use(tusFilesPath, tusCors, tusMiddleware)

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true)
      } else {
        const msg =
          "La política CORS para este sitio no permite el acceso desde el Origen especificado."
        return callback(new Error(msg), false)
      }
    },
    exposedHeaders: ["Location"],
  })
)
app.use(cookieParser())
app.use(express.urlencoded({ limit: "1mb", extended: false }))
app.use(express.json({ limit: "1mb" }))

app.get("/ping", (req, res) => {
  res.status(200).send("pong desde Express!")
})

import userRoutes from "./user/userRoutes.js"
import prixerRoutes from "./prixer/prixerRoutes.js"
import adminRoutes from "./admin/adminRoutes.js"
import preferencesRoutes from "./preferences/preferencesRoutes.js"
import artRoutes from "./art/artRoutes.js"
import productRoutes from "./product/productRoutes.js"
import orderRoutes from "./order/orderRoutes.js"
import orderArchiveRoutes from "./orderArchive/orderArchiveRoutes.js"
import testimonialRoutes from "./testimonials/testimonialRoutes.js"
import discountRoutes from "./discount/discountRoutes.js"
import accountRoutes from "./account/accountRoutes.js"
import movementsRoutes from "./movements/movementRoutes.js"
import servicesRoutes from "./serviceOfPrixers/serviceRoutes.js"
import organizationsRoutes from "./organizations/organizationRoutes.js"
import surchargeRoutes from "./surcharge/surchargeRoutes.js"

app.use("/", userRoutes)
app.use("/", prixerRoutes)
app.use("/", adminRoutes)
app.use("/", artRoutes)
app.use("/", productRoutes)
app.use("/", orderRoutes)
app.use("/", orderArchiveRoutes)
app.use("/", preferencesRoutes)
app.use("/", testimonialRoutes)
app.use("/", discountRoutes)
app.use("/", accountRoutes)
app.use("/", movementsRoutes)
app.use("/", servicesRoutes)
app.use("/", organizationsRoutes)
app.use("/", surchargeRoutes)

app.use(
  (err: any, _req: ExpressRequest, res: Response, _next: NextFunction) => {
    console.error("Error no manejado:", err)
    res.status(err.status || 500)
    res.json({ error: err.message || "Error desconocido" })
  }
)

export default app
