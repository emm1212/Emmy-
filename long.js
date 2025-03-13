






const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// إعداد اتصال SQL Server
const config = {
    UserName: 'your_Name',
    Password: 'your_Password',
    server: 'your_login', // مثال: localhost
    database: 'your_database',
    options: {
        encrypt: true, // إذا كنت تستخدم Azure
        trustServerCertificate: true // للاتصال المحلي
    }
};

// تسجيل الدخول
app.post('/login', async (req, res) => {
    const { UserName, Password} = req.body;

    try {
        await sql.connect(config);
        const result = await sql.query`SELECT * FROM Users WHERE Number = ${UserName}`;

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            const isPasswordValid = bcrypt.compareSync(Password, user.Password);

            if (isPasswordValid) {
                res.status(200).json({ message: 'Login successful', user });
            } else {
                res.status(401).json({ message: 'Invalid Password' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

// تسجيل مستخدم جديد
app.post('/Register', async (req, res) => {
    const { Full_Name, Password ,Phone  } = req.body;

    try {
        await sql.connect(config);
        const hashedPassword = bcrypt.hashSync(Password, 10);
        await sql.query`INSERT INTO Users (Full_Name, Password ,Phone) VALUES (${Full_Name }, ${Phone},${hashedPassword})`;
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Registration failed', error: err });
    }
});
 
// تشغيل الخادم
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
 