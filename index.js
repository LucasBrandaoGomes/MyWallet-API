import express, { json, urlencoded } from "express"
import  cors  from "cors"
import { MongoClient, ObjectId } from "mongodb";
import Joi from "joi";
import dayjs from "dayjs";
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

const token = uuid();
dotenv.config();
const app = express()

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions));



app.use(json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient.connect().then(() => {
	db = mongoClient.db("api_mywallet");
});

app.post("/signup", async (req, res, next)=> {    
    
  const userSignUp = req.body;

  const userSchema = Joi.object(
      {
        name: Joi.string().min(1).required(),
        email: Joi.email().required(),
        password: Joi.password().required(),
        passwordConfirmation: Joi.any().valid(Joi.ref('password')).required()
      });

  const userValidation = userSchema.validate(req.body)
  const {error} = userValidation
 
  const passwordEncrypted = bcrypt.hashSync(req.body.password, 10)


  if (error){
    const errorMsgs = error.details.map(err => err.message)
    res.status(422).send(errorMsgs)
    return;
  }

  try{
    const registeredUser = await db.collection("users").findOne({email : req.body.email})
    if (registeredUser){
      res.status(409).send("Usuário já existente, escolha outro email de usuário")
      return;
    }

    await db.collection("users").insertOne(
      {
          name: req.body.name.trim(),
          email: req.body.email.trim(),
          password: passwordEncrypted.trim(),
      });
    
    res.sendStatus(201);
  }catch (error){
    res.sendStatus(error);
}
});

app.post("/login", async (req, res, next)=> {    
    
  const userSignIn = req.body;

  const userSchema = Joi.object(
      {
        email: Joi.email().required(),
        password: Joi.password().required(),
      });

  const userValidation = userSchema.validate(req.body)
  const {error} = userValidation

  if (error){
    const errorMsgs = error.details.map(err => err.message)
    res.status(422).send(errorMsgs)
    return;
  }

  try{
    const registeredUser = await db.collection("users").findOne({email : userSignIn.email})
    const passwordVerification = bcrypt.compareSync(userSignIn.password, registeredUser.password)

    if (registeredUser && passwordVerification){
      const token = uuid()

      res.status(200).send({
        name:registeredUser.name,
        token: token
      })
      return;
    }else{
        res.status(401).send("Senha ou email incorreto.")
    }
  }catch (error){
    res.sendStatus(error);
}
});

app.listen(5000 ,  () => console.log('server running - port 5000'));