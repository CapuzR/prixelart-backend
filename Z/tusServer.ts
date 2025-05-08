/* // uploadServer.ts
import express from "express";
import { Server as TusServer } from "@tus/server";
import { FileStore } from "@tus/file-store";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const uploadPath = path.join(__dirname, "uploads");

const tusServer = new TusServer({
    path: "/files",
    datastore: new FileStore({ directory: uploadPath }),
});

app.all("/files", (req, res) => {
    tusServer.handle(req.raw, res.raw);
});
app.all("/files/*", (req, res) => {
    tusServer.handle(req.raw, res.raw);
});

// 🎯 Listen for upload completion
tusServer.on(tusServer.EVENTS.EVENT_UPLOAD_COMPLETE, async (event) => {
    const filepath = path.join(uploadPath, event.file.id);
    const fileStream = fs.createReadStream(filepath);

    const metadata = event.file.upload_metadata || {};
    const filename = metadata.filename || `upload-${Date.now()}`;

    const s3 = new S3Client({
        endpoint: process.env.DO_SPACES_ENDPOINT, // e.g. https://nyc3.digitaloceanspaces.com
        region: "us-east-1",
        credentials: {
            accessKeyId: process.env.DO_SPACES_KEY!,
            secretAccessKey: process.env.DO_SPACES_SECRET!,
        },
    });

    try {
        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.DO_SPACES_BUCKET!,
                Key: `uploads/${filename}`,
                Body: fileStream,
                ACL: "public-read",
            })
        );
        fs.unlinkSync(filepath);
        console.log(`✅ Uploaded ${filename} to DO Spaces`);
    } catch (err) {
        console.error("❌ Upload to Spaces failed:", err);
    }
});

app.listen(3000, () => {
    console.log("✅ tus server running on http://localhost:3000/files");
});
 */