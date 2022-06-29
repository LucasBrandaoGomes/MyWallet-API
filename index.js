import express, { json } from "express"
import  cors  from "cors"
import { MongoClient, ObjectId } from "mongodb";
import Joi from "joi";
import dayjs from "dayjs";
//import dotenv from 'dotenv';

//dotenv.config();

const app = express()

app.use(cors());
app.use(json());

const mongoClient = new MongoClient("mongodb+srv://lucas_brandao:290400@cluster-brandao.f5lms.mongodb.net/?retryWrites=true&w=majority");
let db;

mongoClient.connect().then(() => {
	db = mongoClient.db("api_mywallet");
});

app.post("/cadastro", async (req, res)=> {    
    
		const userSignUp = req.body;

    const userSchema = Joi.object(
        {
	        name: Joi.string().min(1).required(),
			email: Joi.email().required(),
			password: Joi.password().required(),
			passwordConfirmation: Joi.password().required()
        });

    const userValidation = userSchema.validate(req.body)
    const {error} = userValidation
   
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
            password: req.body.password.trim(),
            passwordConfirmation: req.body.trim()
        });
      await db.collection("messages").insertOne(
        {
          from: req.body.name.trim(),
          to: 'Todos',
          text: 'entra na sala...',
          type: 'status',
          time: hora.format('HH:mm:ss')
        }
      );
      res.sendStatus(201);
    }catch (error){
      res.sendStatus(error);
  }
});