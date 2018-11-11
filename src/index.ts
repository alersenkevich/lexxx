import * as mongoose from 'mongoose';
import { MONGO_URL } from './config';
import { bootstrap } from './init';

mongoose
  .connect(MONGO_URL, { useNewUrlParser: true })
  .then(bootstrap, (reason: any) => console.log(reason));
