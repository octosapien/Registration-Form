const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const ejs = require('ejs');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

mongoose.connect('mongodb://localhost:27017/userDB', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);

// ... previous code ...

// Route to serve login form
app.get('/login', (req, res) => {

res.sendFile('login.html', { root: __dirname });

});

// Route to serve registration form
app.get('/register', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

// Route to handle login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username: username, password: password }).exec();

        if (!user) {
            res.redirect('/login'); // Redirect to login form in case of incorrect credentials
        } else {
            req.session.user = user;
            res.redirect('/dashboard'); // Redirect to profile dashboard
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});
// Route to handle registration
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Generate username as <name>+<123>
    const username = `${name}123`;

    const newUser = new User({
        username: username,
        email: email,
        password: password
    });

    try {
        await newUser.save();
        // res.status(200).send('User registered successfully');
        return res.redirect('/dashboard')
        
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error registering user');
    }
});

// Route to display profile dashboard
app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.render('dashboard', {
            username: req.session.user.username,
            email: req.session.user.email
        });
    } else {
        res.redirect('/login'); // Redirect to login if not logged in
    }
});

// Route to handle logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
