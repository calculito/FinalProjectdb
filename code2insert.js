const user_model = require("./user_model");
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Access-Control-Allow-Headers"
  );
  next();
});

const getusers = () => {
  return new Promise(function (resolve, reject) {
    pool.query("SELECT * FROM users ORDER BY id ASC", (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results.rows);
    });
  });
};
const createuser = (body) => {
  return new Promise(function (resolve, reject) {
    const { name, password } = body;
    pool.query(
      "INSERT INTO users (name, password) VALUES ($1, $2) RETURNING *",
      [name, password],
      (error, results) => {
        if (error) {
          reject(error);
        }
        resolve(`A new user has been added added: ${results.rows[0]}`);
      }
    );
  });
};
const deleteuser = () => {
  return new Promise(function (resolve, reject) {
    const id = parseInt(request.params.id);
    pool.query("DELETE FROM users WHERE id = $1", [id], (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(`user deleted with ID: ${id}`);
    });
  });
};

module.exports = {
  getusers,
  createuser,
  deleteuser,
};
app.get("/", (req, res) => {
  user_model
    .getusers()
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.post("/users", (req, res) => {
  user_model
    .createuser(req.body)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.delete("/user/:id", (req, res) => {
  user_model
    .deleteuser(req.params.id)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});
