import express from 'express';

const app = express();
import 'dotenv/config'; 
import main from './config/database.js';
import cookieParser from 'cookie-parser';
import authRouter from './routes/userAuth.js';
import redisClient from './config/redis.js';
import problemRouter from './routes/problemCreator.js';



app.use(express.json());
app.use(cookieParser());

app.use('/user',authRouter);
app.use('/problem',problemRouter); 

const InitializeConnection = async()=>{
    try{
        await Promise.all([main(),redisClient.connect()]);
        // await main();
        console.log("DB Connected");

        app.listen(process.env.PORT,()=>{
         console.log('Server is listening at port no:',process.env.PORT)
        })
    }
    catch(err){
        console.log('Error'+err);
    }
}

InitializeConnection();

