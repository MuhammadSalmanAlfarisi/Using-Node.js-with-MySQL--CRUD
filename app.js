const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

// MySQL
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "",
  database: "nodejs_beers",
});

// Get all beers
app.get("/", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);

    connection.query("SELECT * from beers", (err, rows) => {
      connection.release(); // return the connection to pool

      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
        res.status(500).send("Error retrieving beers");
      }
    });
  });
});

// Search Beer
app.get("/search/:query", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);

    const search = req.params.query;
    connection.query(
      "SELECT * FROM beers WHERE name LIKE ? OR tagline LIKE ?",
      [`%${search}%`, `%${search}%`],
      (err, rows) => {
        connection.release(); // return the connection to the pool

        if (!err) {
          res.send(rows);
        } else {
          console.log(err);
          res.status(500).send("Error retrieving beers");
        }
      }
    );
  });
});

// Get a beer by ID
app.get("/beers/:id", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);

    connection.query(
      "SELECT * from beers WHERE id = ?",
      [req.params.id],
      (err, rows) => {
        connection.release(); // return the connection to pool

        if (!err) {
          res.send(rows);
        } else {
          console.log(err);
          res.status(500).send("Error retrieving beers");
        }
      }
    );
  });
});

// Get beers with isAvailable parameter
app.get("/beers/available/:avail", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);

    const avail = req.params.avail;
    connection.query(
      "SELECT * FROM beers WHERE isAvailable = ?",
      [avail],
      (err, rows) => {
        connection.release(); // return the connection to pool

        if (!err) {
          res.send(rows);
        } else {
          console.log(err);
          res.status(500).send("Error retrieving beers");
        }
      }
    );
  });
});

// Delete a records / beer
app.delete("/delete/:id", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);

    connection.query(
      "DELETE from beers WHERE id = ?",
      [req.params.id],
      (err, rows) => {
        connection.release(); // return the connection to pool

        if (!err) {
          res.send(
            `Beer with the Record ID: ${[req.params.id]} has been removed.`
          );
        } else {
          console.log(err);
          res.status(500).send("Error deleting beers");
        }
      }
    );
  });
});

// Add a record / beer
app.post("/create", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);

    const params = req.body;

    connection.query("INSERT INTO beers SET ?", params, (err, rows) => {
      connection.release(); // return the connection to pool

      if (!err) {
        res.send(`Beer with the name: ${params.name} has been added.`);
      } else {
        console.log(err);
        res.status(500).send("Error creating beers");
      }
    });

    console.log(req.body);
  });
});

// Update a record / beer
app.put("/update", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);

    const { id, name, tagline, description, image } = req.body;

    connection.query(
      "UPDATE beers SET name = ?, tagline = ?, description = ?, image = ? WHERE id = ?",
      [name, tagline, description, image, id],
      (err, rows) => {
        connection.release(); // return the connection to pool

        if (!err) {
          res.send(`Beer with the name: ${name} has been updated.`);
        } else {
          console.log(err);
          res.status(500).send("Error updating beers");
        }
      }
    );

    console.log(req.body);
  });
});

// Listen on enviroment port or 5000
app.listen(port, () => console.log(`Listen on port ${port}`));
