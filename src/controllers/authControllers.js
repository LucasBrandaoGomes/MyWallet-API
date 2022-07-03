import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import Joi from "joi";
import db from '../db.js';

const token = uuid();

export async function SignUp(req, res){    
    
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
  };

export async function SignIn(req, res){    
    
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
          email:registeredUser.email,
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
  };

