const express = require('express')
const mongoose = require('mongoose')
const RegisterUser = require('./models')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const middleware = require('./middleware')
const app = express()

mongoose.connect('mongodb://localhost:27017/login_app').then(
    () => console.log("connected to MongoDB")
)

app.use(express.json())
app.use(cors({origin:"*"}))

app.post('/register', async (req,res)=> {
    try {
        const {username,email,password,confirmpassword} = req.body
        let exists = await RegisterUser.findOne({email})
        if(exists){
            return res.status(400).send('User Already Registered')
        }
        if (password !== confirmpassword){
            return res.status(400).send("Password is not Matching")
        }
        let newUser = new RegisterUser({
            username,
            email,
            password,
            confirmpassword
        })
        await newUser.save()
        res.status(200).send("User Registered Successfully")

    } catch (err) {
        console.log(err)
        return res.status(500).send('Internal Server Error')
    }
})

app.post('/login', async (req,res)=> {
    try {
        const {email,password} = req.body
        let exists = await RegisterUser.findOne({email})
        if(!exists){
            return res.status(400).send('User Not found')
        }
        if (exists.password !== password){
            return res.status(400).send("Incorrect Password")
        }
        
        let payload = {
            user:{
                id: exists.id
            }
        }
        jwt.sign(payload,"saicharankey",{expiresIn:"5h"},
            (err,token) => {
                if (err) throw err;
                return res.json({token})
            }  
        )

    } catch (err) {
        console.log(err)
        return res.status(500).send('Internal Server Error')
    }
})

app.get('/profile',middleware,async (req,res)=> {
    try {
        let exists = await RegisterUser.findById(req.user.id)
        if (!exists){
            return res.status(400).send("User Not Found")
        }
        res.json(exists)
    } catch (error) {
        console.log(error)
    }
})

app.listen(5000, () => {
    console.log("Server Running....")
})