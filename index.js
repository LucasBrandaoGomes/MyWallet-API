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

app.post("/signup", async (req, res)=> {    
    
  const userSignUp = req.body;

  const userSchema = Joi.object(
      {
        name: Joi.string().min(1),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
        passwordConfirmation: Joi.any().valid(Joi.ref('password'))
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
          password: passwordEncrypted
      });
    
    res.sendStatus(201);
  }catch (error){
    res.sendStatus(error);
}
});

app.post("/login", async (req, res)=> {    
    
  const userSignIn = req.body;

  const userSchema = Joi.object(
      {
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
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
      const token = uuid();

      await db.collection("sessions").insertOne(
        {
        userId: registeredUser._id,
        token
      })

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

app.post('/addcredit', async (req, res) => {
  
  const newCredit = req.body;
  const { authorization } = req.headers
  const token = authorization?.replace('Bearer ', '')
  const session = await db.collection('sessions').findOne({token})
  const day = dayjs().locale('pt-br')
  
  if (!session){
    return res.sendStatus(401)
  }
  
  try{
    await db.collection('wallet').insertOne(
    {
      user: session.userId,
      amount: newCredit.amount,
      discription: newCredit.discription,
      type: "credit",
      date: day.format("DD/MM")
    }
  )
    res.status(200).send("Valor cadastrado com sucesso")
  }catch (error){
    res.sendStatus(error)
  }
})

app.post('/adddebit', async (req, res) => {
  
  const newDebit = req.body;
  const { authorization } = req.headers
  const token = authorization?.replace('Bearer ', '')
  const session = await db.collection('sessions').findOne({token})
  const day = dayjs().locale('pt-br')
  
  if (!session){
    return res.sendStatus(401)
  }

  try{
  
  await db.collection('amount').insertOne(
    {
      user: session.userId,
      amount: newDebit.amount,
      discription: newDebit.discription,
      type: "debit",
      date: day.format("DD/MM")
    }
  )
    res.status(200).send("Valor cadastrado com sucesso")
  }catch (error){
    res.sendStatus(error)
  }
})

app.get('/wallet', async (req, res) => {
  const { authorization } = req.headers
  const token = authorization?.replace('Bearer ', '')
  const session = await db.collection('sessions').findOne({token})
  
  if (!session){
        return res.sendStatus(401)
  }
  
  try{
  
    const wallet = await db.collection('amount').find({userId : session.userId})
    res.send(wallet);
  }catch (error){
    res.status(401)
  }
})
app.listen(5000 ,  () => console.log('server running - port 5000'));