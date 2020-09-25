const { Pool } = require("pg");
const pool = new Pool({
  user: "xsbjvtjumysmhw",
  host: "ec2-54-228-209-117.eu-west-1.compute.amazonaws.com",
  database: "dep96lbfhaflev",
  password: "953a9a31f94156044cb942916c614b1ed295e2454b8e6d033899333ae79d4bc5",
  port: 5432,
});
const getusers = () => {
  return new Promise(function (resolve, reject) {
    pool.query("SELECT name FROM users ORDER BY id ASC", (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results.rows);
    });
  });
};
const getusersalldata = () => {
  return new Promise(function (resolve, reject) {
    pool.query("SELECT * FROM users ORDER BY id ASC", (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results.rows);
    });
  });
};
const getlinks = () => {
  return new Promise(function (resolve, reject) {
    pool.query("SELECT * FROM links ORDER BY id ASC", (error, results) => {
      if (error) {
        reject(error);
      }
      resolve(results.rows);
    });
  });
};
const getuserclassname = () => {
  return new Promise(function (resolve, reject) {
    pool.query(
      "SELECT users.name, class_name  FROM class INNER JOIN users ON class.id=users.class_id;",
      (error, results) => {
        if (error) {
          reject(error);
        }
        resolve(results.rows);
      }
    );
  });
};
const getuserrecordings = () => {
  return new Promise(function (resolve, reject) {
    const idR = request.params.id;
    pool.query(
      "select * from recordings r inner join class c2 on c2.id = r.class_id inner join users u on u.class_id = c2.id where u.name = $1;",
      [id],
      (error, results) => {
        if (error) {
          reject(error);
        }
        resolve.json(results.rows);
      }
    );
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
  getusersalldata,
  createuser,
  deleteuser,
  getlinks,
  getuserclassname,
  getuserrecordings,
};
