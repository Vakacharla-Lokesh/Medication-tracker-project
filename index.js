import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import ejs from "ejs";

// Database connection
// const db = new pg.Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'medication_tracker',
//   password: 'your_password',
//   port: 5432,
// });

// Middleware
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "gfg",
  password: "luckyloki",
  port: 5432,
});

db.connect();

const port = 3000;
var curr_user = null;
let userMedications = [];


// Routes
app.post('/register', registerUser);
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // console.log(req.body);
  // const query = {
  //   text: `SELECT * FROM users WHERE username = $1 AND password = $2`,
  //   values: [username, password],
  // };
  // try {
  //   const result = await db.query(query);
  //   if (result.rows.length > 0) {
  //     curr_user = result.rows[0];
  //     res.render('dashboard.ejs', {
  //       current : curr_user
  //     });
  //     // res.json({ message: 'Login successful' });
  //   } else {
  //     res.status(401).json({ message: 'Invalid username or password' });
  //   }
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).json({ message: 'Error logging in' });
  // }

  try {
    const query = {
      text: `SELECT * FROM users WHERE username = $1 AND password = $2`,
      values: [username, password],
    };
    console.log(query);
    db.query(query, async(err, result) => {
      console.log(err);
      if (err) {
        return res.status(500).send({ error: 'Failed to query database' });
      }
      if (result.rows.length === 0) {
        return res.status(401).send({ error: 'Invalid username or password' });
      }
      const user = result.rows[0];
      console.log(user);
      curr_user = user;
      res.redirect('/user');
    });
  } catch (err) {
    return res.status(500).send({ error: 'Failed to login' });
  }
});
// app.get('/medications', getMedications);
// app.post('/medications', createMedication);
app.get('/medication_log', getMedicationLog);
app.post('/medication_log', logMedication);

// Register user
async function registerUser(req, res) {
  const { username, password } = req.body;
  console.log(req.body);
  const query = {
    text: `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *`,
    values: [username, password],
  };
  try {
    const result = await db.query(query);
    res.json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user' });
  }
}

// Login user

// Get medications
async function getMedications(req, res) {
  const userId = req.user.id;
  const query = {
    text: `SELECT * FROM medications WHERE user_id = $1`,
    values: [userId],
  };
  try {
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting medications' });
  }
}

// Create medication
async function createMedication(req, res) {
  const userId = req.user.id;
  const { name, dosage, frequency, duration } = req.body;
  const query = {
    text: `INSERT INTO medications (user_id, name, dosage, frequency, duration) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    values: [userId, name, dosage, frequency, duration],
  };
  try {
    const result = await db.query(query);
    res.json({ message: 'Medication created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating medication' });
  }
}

// Get medication log
async function getMedicationLog(req, res) {
  const userId = req.user.id;
  const query = {
    text: `SELECT * FROM medication_log WHERE user_id = $1`,
    values: [userId],
  };
  try {
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting medication log' });
  }
}

// Log medication
async function logMedication(req, res) {
  const userId = req.user.id;
  const medicationId = req.body.medication_id;
  const query = {
    text: `INSERT INTO medication_log (user_id, medication_id) VALUES ($1, $2) RETURNING *`,
    values: [userId, medicationId],
  };
  try {
    const result = await db.query(query);
    res.json({ message: 'Medication logged successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging medication' });
  }
}


// Start server
app.get('/', (req, res) =>{
  if(curr_user == null){
    res.render('login.ejs');
  }else{
    res.render('dashboard.ejs', {
      current: curr_user,
    });
  }
});

app.get('/user', (req, res) =>{
  res.render('dashboard.ejs', {
    current: curr_user,
  });
});

app.get('/search', (req, res) =>{
  res.render("search.ejs");
});

app.get('/medications', (req, res) =>{
  res.render("add.ejs");
});

// Create a route to handle the medication data
app.post('/medications-post', (req, res) => {
  const medicationData = req.body;
  console.log(`Received medication data: ${JSON.stringify(medicationData)}`);

  // Here, you can store the medication data in a database or perform any other server-side logic
  userMedications.push(medicationData);
  // For this example, we'll just send a success response back to the client
  res.json({ message: 'Medication data received successfully!' });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});