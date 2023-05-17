import {Request, Response, Router} from 'express';
import { Song } from '../lib/song';


export const song_router = Router();

// get all songs and filter to only get the ones we want
// middleware not needed for this bc can just return to whoever needs it
song_router.get('/', async (req: Request, res: Response): Promise<void> => {
    const songArr = await Song.all();
    const filteredArr = songArr.map(song => {
      return{'name': song.name,
       'id': song.id,
       'artists': song.artists};
    });

    res.status(200).send(filteredArr);
  });