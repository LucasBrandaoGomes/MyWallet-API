import db from "../db.js";
import dayjs from "dayjs";
import Joi from "joi";


export async function AddCredit(req, res){
  
    const newCredit = req.body;
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '')
    const session = await db.collection('sessions').findOne({token})
    const day = dayjs().locale('pt-br')
    
    if (!session){
      return res.sendStatus(401)
    }

    {/*const newCreditSchema = Joi.object(
        {
          amount: Joi.number(),
          discription: Joi.string()
        });
  
    const newCreditValidation = newCreditSchema.validate(req.body)
    const {error} = newCreditValidation

    if (error){
      const errorMsgs = error.details.map(err => err.message)
      res.status(422).send(errorMsgs)
      return;
    }*/}
    
    try{
      await db.collection('wallet').insertOne(
      {
        user: session.email,
        amount: newCredit.amount.parseFloat().toFixed(2),
        discription: newCredit.discription,
        type: "credit",
        date: day.format("DD/MM")
      }
    )
      res.status(200).send("Valor cadastrado com sucesso")
    }catch (error){
      res.sendStatus(error)
    }
  }

export async function AddDebit(req, res){
  
    const newDebit = req.body;
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
        user: session.email,
        amount: newDebit.amount,
        discription: newDebit.discription,
        type: "debit",
        date: day.format("DD/MM")
      }
    )
      res.status(201).send("Valor cadastrado com sucesso")
    }catch (error){
      res.sendStatus(error)
    }
  }

export async function GetWalletValues(req, res){
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '')
    const session = await db.collection('sessions').findOne({token})
    
    if (!session){
        return res.sendStatus(401)
    }
    
    try{
      const wallet = await db.collection('wallet').find({user:session.email}).toArray()
      res.send(wallet);
    }catch (error){
      res.status(401)
    }
  }

export async function DeleteWalletValues(req, res){
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '')
    const session = await db.collection('sessions').findOne({token})
    const id = req.params.id;
   
    
    if (!session){
      return res.sendStatus(401)
    }
    try{

         {/*const valueToDelete = await db.collection('wallet').findOne({_id: new ObjectId(id)})
      console.log(valueToDelete)
      
      if (!valueToDelete){
        res.sendStatus(404);
        return;
      }
   
      console.log(valueToDelete._id)
      if(valueToDelete._id !== new ObjectId(id)){
        res.sendStatus("aqui", 401);
        return;
      }*/}
      console.log("passou")
      await db.collection('wallet').deleteOne({ _id: ObjectId(id)})
      res.send("Valor deletado com sucesso").status(200)
  
    }catch (error){
      res.send(error)
    }
  };

export async function Logout(req, res){
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '')
    const session = await db.collection('sessions').findOne({token})
  
    if (!session){
      return res.sendStatus(401)
    }
    
    try{
      await db.collection('sessions').deleteOne({token: session.token})
      res.send("Usuário deslogado com sucesso").status(200)
  
    }catch (error){
      res.send(error)
  }
}