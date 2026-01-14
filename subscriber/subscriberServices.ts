import { Subscriber } from './subscriberModel.ts';
import { sendWallpaperEmail } from '../utils/emailSender.ts';
import { getDb } from "../mongo.ts";

import fs from 'fs';
import path from 'path';
import { Collection } from 'mongodb';

function subscribersCollection(): Collection<Subscriber> {
  return getDb().collection<Subscriber>("subscribers");
}

export const processWallpaperSubscription = async (email: string, artId: string, artName: string, prixer: string, avatar?: string | null) => {
  const subscribers = subscribersCollection();

 const createSubscriber = await subscribers.updateOne(
    { email: email.toLowerCase() },
    {
      $set: { 
        lastInteraction: new Date(),
        status: 'active' 
      },
      $addToSet: { interests: artId },
      $setOnInsert: { 
        createdAt: new Date(),
        source: 'wallpapers_page',
        convertedToUser: false 
      }
    },
    { upsert: true }
  );

//   console.log(createSubscriber)
  const filePath = path.join(process.cwd(), 'private-assets/wallpapers', `${artId}.jpg`);
  const fileBuffer = fs.readFileSync(filePath);

  return await sendWallpaperEmail(email, artId, artName, prixer, fileBuffer, avatar);
};