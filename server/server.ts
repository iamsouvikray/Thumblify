import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import axios from 'axios';

import AuthRouter from './routes/AuthRoutes.js';
import ThumbnailRouter from './routes/ThumbnailRoutes.js';
import UserRouter from './routes/UserRoutes.js';

declare module 'express-session' {
  interface SessionData {
    isLoggedIn: boolean;
    userId: string;
  }
}

await connectDB();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://thumblify-myeh.vercel.app'

  ],
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI as string,
    collectionName: 'sessions'
  })
}));

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Server is Live!');
});

// RapidAPI Thumbnail Generator Route
app.post('/api/generate-image', async (req: Request, res: Response) => {

  try {

    const { prompt } = req.body;

    const response = await axios.post(
      'https://ai-text-to-image-generator-flux-free-api.p.rapidapi.com/aaaaaaaaaaaaaaaaaiimagegenerator/quick.php',
      {
        prompt,
        style_id: 4,
        size: '1-1'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host':
            'ai-text-to-image-generator-flux-free-api.p.rapidapi.com',
          'x-rapidapi-key': process.env.RAPIDAPI_KEY as string
        }
      }
    );

    res.json(response.data);

  } catch (error: any) {

    console.log(error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: 'Image generation failed'
    });
  }
});

app.use('/api/auth', AuthRouter);
app.use('/api/thumbnail', ThumbnailRouter);
app.use('/api/user', UserRouter);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});