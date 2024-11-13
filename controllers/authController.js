const db = require('../config/db');
const bcrypt = require('bcryptjs');

//user registration function/login
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try{
        //check if the user exists in database
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if(rows.length > 0){
            return res.status(400).json({ message: 'User already exists'})
        }

        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        //insert the record to db
        await db.execute('INSERT INTO users (name, email, password) VALUES (?,?,?', [
            name,
            email,
            hashedPassword
        ]);

        res.status(201).json({ message: 'User registered successfully.'})
    } catch(error) {
        res.status(500).json({ message: 'An error occured.', error});
    }
}

exports.loginUser = async (req, res) => {
    const { email, password } = req.body

        //check if the user exists in database
        const [rows] = await db.execute('SELECT id, name, email FROM users WHERE email = ?', [email]);
        if(rows.length === 0){
            return res.status(400).json({ message: 'User not found. Please register.'});
        }
        const user = [rows];
        //compare password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch){
            return res.status(400).json({ message: 'Invalid creditials'});
        }
        req.session.user = {userId: user.id, name: user.name, email: user.email};
        req.status(200).json('Login successful');
    }        

