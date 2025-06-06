import express, {
  Request as ExpressRequest,
  Response,
  NextFunction,
} from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import session from "cookie-session"
import dotenv from 'dotenv'
import helmet from "helmet"
import { Server, EVENTS, Upload, ServerOptions } from "@tus/server"
import { S3Store } from "@tus/s3-store"
import {
  S3Client,
  S3ClientConfig,
  GetObjectCommand,
  PutObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3"

import path from "path"
import { fileURLToPath } from "node:url"
import pathNode from "node:path"
import sharp from "sharp"
import { Readable } from "stream"

dotenv.config()

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

const app = express()

export const isProduction = process.env.NODE_ENV === "production"

app.use(
  session({
    name: "session",
    keys: [
      "tu_clave_secreta_1_super_segura_y_unica_final_v8",
      "tu_clave_secreta_2_super_segura_y_unica_final_v8",
    ],
    secure: true,
    httpOnly: true,
    sameSite: "none",
    domain:  ".prixelart.com",
    path: "/",
    maxAge: 12 * 60 * 60 * 1000,
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
const publicBucketName: string | undefined = process.env.PUBLIC_BUCKET_NAME
const privateBucketName: string | undefined = process.env.PRIVATE_BUCKET_NAME
const doSpacesAccessKey: string | undefined = process.env.DO_ACCESS_KEY
const doSpacesSecretKey: string | undefined = process.env.DO_ACCESS_SECRET

if (
  !doSpacesEndpoint ||
  !doSpacesRegion ||
  !publicBucketName ||
  !privateBucketName ||
  !doSpacesAccessKey ||
  !doSpacesSecretKey
) {
  console.error(
    "FATAL ERROR: Credenciales y configuración de DigitalOcean Spaces faltantes."
  )
  process.exit(1)
}


interface MyS3StoreOptions {
  s3ClientConfig: S3ClientConfig & { bucket: string };
  uploadParams?: (
    req: any, 
    upload: any 
  ) => {
    ACL?: ObjectCannedACL; 
    ContentType?: string;
    [key: string]: any;
  };
}

const s3ClientConfigForStore: S3ClientConfig & { bucket: string } = {
  bucket: privateBucketName,
  region: doSpacesRegion,
  endpoint: `https://${doSpacesEndpoint}`,
  credentials: {
    accessKeyId: doSpacesAccessKey,
    secretAccessKey: doSpacesSecretKey,
  },
  forcePathStyle: true,
}

const s3StoreOptions: MyS3StoreOptions = {
  s3ClientConfig: s3ClientConfigForStore,
  uploadParams: (req: any, upload: any) => {
    const metadata = upload.metadata || {}
    const filetype = (metadata.filetype as string) || "application/octet-stream"

    // console.log(
    //   `[s3StoreOptions.uploadParams] Para ID: ${upload.id}, Contexto: ${metadata.context}. ` +
    //     `Subida inicial a bucket PRIVADO ('${privateBucketName}') con ACL 'private', ContentType: '${filetype}'`
    // )
    return {
      ACL: "private" as ObjectCannedACL,
      ContentType: filetype,
    }
  },
}

const streamToBuffer = (stream: Readable): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
    stream.on("error", reject)
    stream.on("end", () => resolve(Buffer.concat(chunks)))
  })

const genericS3Client = new S3Client({
  region: doSpacesRegion,
  endpoint: `https://${doSpacesEndpoint}`,
  credentials: {
    accessKeyId: doSpacesAccessKey,
    secretAccessKey: doSpacesSecretKey,
  },
  forcePathStyle: true,
})

const tusServer = new Server({
  path: tusFilesPath,
  datastore: new S3Store(s3StoreOptions),

  async onUploadCreate(req: any, upload: Upload) {
    const originalFilename =
      upload.metadata?.filename || upload.metadata?.name || `file-${Date.now()}`
    let extension = ""
    if (originalFilename && typeof originalFilename === "string") {
      extension = pathNode.extname(originalFilename)
    }
    upload.id = `${upload.id}${extension}`

    // console.log(
    //   `[TUS SERVER - onUploadCreate] S3 Key en bucket privado será: ${
    //     upload.id
    //   }, Size: ${upload.size}, Meta: ${JSON.stringify(upload.metadata)}`
    // )
    return upload
  },

  onUploadFinish: async (req: any, upload: Upload): Promise<any> => {
    const metadata = upload.metadata || {}
    // console.log(
    //   `[onUploadFinish] Hook para ID (Key en bucket PRIVADO): ${
    //     upload.id
    //   }, Metadata: ${JSON.stringify(metadata)}`
    // )

    const objectKeyInPrivateBucket = upload.id
    if (!objectKeyInPrivateBucket) {
      console.error(
        `[onUploadFinish] Error: No objectKey para upload ID: ${upload.id}`
      )
      return { status_code: 500, body: "Error Interno: No object key." }
    }
    const cleanKeyInPrivateBucket = objectKeyInPrivateBucket.startsWith("/")
      ? objectKeyInPrivateBucket.substring(1)
      : objectKeyInPrivateBucket

    const isArtUpload = metadata.context === "artPieceImage"
    let finalUrlToClient: string

    try {
      if (isArtUpload) {
        // console.log(
        //   `[onUploadFinish] Procesando "Arte" upload: ${cleanKeyInPrivateBucket}`
        // )
        const getObjectParams = {
          Bucket: privateBucketName,
          Key: cleanKeyInPrivateBucket,
        }
        // console.log(
        //   `[onUploadFinish] Obteniendo objeto original de: s3://${privateBucketName}/${cleanKeyInPrivateBucket}`
        // )
        const getObjectResult = await genericS3Client.send(
          new GetObjectCommand(getObjectParams)
        )

        if (
          !getObjectResult.Body ||
          !(getObjectResult.Body instanceof Readable)
        ) {
          throw new Error(
            "El cuerpo del objeto original no es un stream legible."
          )
        }

        const streamToBuffer = (stream: Readable): Promise<Buffer> =>
          new Promise((resolve, reject) => {
            const chunks: Buffer[] = []
            stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
            stream.on("error", reject)
            stream.on("end", () => resolve(Buffer.concat(chunks)))
          })

        const originalImageBuffer = await streamToBuffer(getObjectResult.Body)

        const processedImageBuffer = await sharp(originalImageBuffer)
          .webp({ quality: 50 })
          .toBuffer()
        const originalFileNameNoExt = pathNode.basename(
          cleanKeyInPrivateBucket,
          pathNode.extname(cleanKeyInPrivateBucket)
        )
        const publicArtObjectKey = `arte_procesado/${originalFileNameNoExt}_q50_${Date.now()}.webp`
        const putPublicArtParams = {
          Bucket: publicBucketName,
          Key: publicArtObjectKey,
          Body: processedImageBuffer,
          ACL: "public-read" as ObjectCannedACL,
          ContentType: "image/webp",
        }
        // console.log(
        //   `[onUploadFinish] Subiendo imagen de arte pública procesada a: s3://${publicBucketName}/${publicArtObjectKey}`
        // )
        await genericS3Client.send(new PutObjectCommand(putPublicArtParams))

        finalUrlToClient = `https://${publicBucketName}.${doSpacesEndpoint.replace(
          "https://",
          ""
        )}/${publicArtObjectKey}`
        // console.log(
        //   `[onUploadFinish] URL pública (Arte procesado) para el cliente: ${finalUrlToClient}`
        // )
      } else {
        const getObjectParams = {
          Bucket: privateBucketName!,
          Key: cleanKeyInPrivateBucket,
        }
        console.log(
          `[onUploadFinish] Obteniendo objeto original (no-arte) de: s3://${privateBucketName}/${cleanKeyInPrivateBucket}`
        )
        const getObjectResult = await genericS3Client.send(
          new GetObjectCommand(getObjectParams)
        )

        if (
          !getObjectResult.Body ||
          !(getObjectResult.Body instanceof Readable)
        ) {
          // Asegurarse que Body es Readable
          throw new Error(
            "Cuerpo del objeto original (no-arte) no es un stream legible."
          )
        }
        console.log(
          `[onUploadFinish] Convirtiendo stream a buffer para ${cleanKeyInPrivateBucket} (no-arte)...`
        )
        const originalNonArtBuffer = await streamToBuffer(
          getObjectResult.Body as Readable
        )
        console.log(
          `[onUploadFinish] Buffer creado para ${cleanKeyInPrivateBucket} (no-arte), tamaño: ${originalNonArtBuffer.length}`
        )

        const publicNonArtObjectKey = `otros_archivos_publicos/${cleanKeyInPrivateBucket}`
        const putPublicNonArtParams = {
          Bucket: publicBucketName!,
          Key: publicNonArtObjectKey,
          Body: originalNonArtBuffer, // <--- Usar el Buffer
          ACL: "public-read" as ObjectCannedACL,
          ContentType:
            (metadata.filetype as string) || "application/octet-stream",
        }
        console.log(
          `[onUploadFinish] Subiendo copia pública (no-arte) a: s3://${publicBucketName}/${publicNonArtObjectKey}`
        )
        await genericS3Client.send(new PutObjectCommand(putPublicNonArtParams))
        finalUrlToClient = `https://${publicBucketName}.${doSpacesEndpoint.replace(
          "https://",
          ""
        )}/${publicNonArtObjectKey}`
      }
    } catch (error: any) {
      console.error(`[onUploadFinish] Error general en el hook: `, error)
      return {
        status_code: 500,
        body: `Error en servidor durante finalización de subida: ${error.message}`,
      }
    }

    // console.log(
    //   `[onUploadFinish] Devolviendo encabezado x-final-url: ${finalUrlToClient}`
    // )
    return {
      headers: {
        "x-final-url": finalUrlToClient,
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
    // console.log(`  ---> ID en POST_CREATE: ${upload.id}`)
  }
)

tusServer.on(
  EVENTS.POST_FINISH,
  (req: ExpressRequest, res: Response, upload: Upload) => {
    // console.log(
    //   `[TUS SERVER (S3Store) - ${EVENTS.POST_FINISH}] Listener: Subida finalizada para ID: ${upload.id}.`
    // )
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
