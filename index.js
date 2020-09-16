const express = require("express");
const app = express();
const port = 3001;
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const morgan = require("morgan"); //logs all the changes
const { Pool } = require("pg");
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "fp",
  password: "Qb1p5d.3t",
  port: 5432,
});
// READ BODIES AND URL FROM REQUESTS
//app.use(express.urlencoded({ extended: true }));
//app.use(express.json());
const user_model = require("./user_model");
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Access-Control-Allow-Headers",
    "Content-Type",
    "application/json"
  );
  next();
});
// LOG ALL REQUEST
app.use(morgan("tiny"));

app.get("/us", (req, res) => {
  console.log("a client connected to the endpoint /");
  res.send("Hello SQL!");
});
app.listen(port, () =>
  console.log(
    `Server is listening on port 3001. Ready to accept requests (use /):${port}`
  )
);

app.get("/usersION", function (req, res) {
  pool.query("SELECT * FROM users", (error, result) => {
    res.json(result.rows);
  });
});
//get all info users for name, class, role
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
//get all the links general NOT IN USE!!!!
app.get("/links", (req, res) => {
  user_model
    .getlinks()
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});
//get the userrole
app.get("/userrole", (req, res) => {
  user_model
    .getuserrole()
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});
//get the recordings by id
app.get("/userrecordings/:id", function (req, res) {
  const idR = req.params.id;
  if (idR == 0 || idR == "") {
    return res.status(400).send("Please log in!");
  }
  pool
    .query(
      "select * from recordings r inner join class c2 on c2.id = r.class_id inner join users u on u.class_id = c2.id where u.name = $1 ORDER BY r.id DESC;",
      [idR]
    )
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});
//get userlinks by id --> only general links
app.get("/userlinks/:id", function (req, res) {
  const idL = req.params.id;
  if (idL == 0 || idL == "") {
    return res.status(400).send("Please log in!");
  }
  pool
    .query(
      "select l.description, l.id, stars from class c inner join links l on c.id = l.class_id where class_id=$1 ORDER BY l.id DESC;",
      [idL]
    )
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});
///////////////    get userlinks by id --> only PERSONAL links    /////////////////////
app.get("/userpersonallinks/:id", function (req, res) {
  const username = req.params.id;
  if (username == 0 || username == "") {
    return res.status(400).send("Please log in!");
  }
  pool
    .query(
      "select description, name, p.id, stars from perslinks p inner join users u on u.id = p.user_id where name=$1 ORDER BY p.id DESC;",
      [username]
    )
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});
///////////////    get calendar by id    /////////////////////
app.get("/usercalendar/:id", function (req, res) {
  const userclass = req.params.id;
  if (userclass == 0 || userclass == "") {
    return res.status(400).send("Please log in!");
  }
  pool
    .query(
      "select title, tdate, tstart, tend from classes where class_id = $1 order by tdate asc",
      [userclass]
    )
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});
///////////////    get userhomeworks finished by id --> only for Students    /////////////////
app.get("/userhomeworksSYES/:id", function (req, res) {
  const username = req.params.id;
  if (username == 0 || username == "") {
    return res.status(400).send("Please log in!");
  }
  pool
    .query(
      "select name, h2.link, h2.optional, hf.finished, linkhwfinished  from users u inner join homework_finished hf on hf.user_id = u.id inner join homeworks h2 on h2.id = hf.homeworks_id where finished='yes' and  u.name=$1;",
      [username]
    )
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});
//////////////   get userhomeworks UNfinished by id --> only for Students   /////////////////
app.get("/userhomeworksSNO/:id", function (req, res) {
  const username = req.params.id;
  if (username == 0 || username == "") {
    return res.status(400).send("Please log in!");
  }
  pool
    .query(
      "select * from (select name, h2.id, h2.optional, h2.link, (select hf.finished from   homework_finished hf inner join homeworks h on hf.homeworks_id = h2.id inner join users u2 on u.id = hf.user_id where finished = 'yes' and u.id = u2.id and h2.id = h.id)  from homeworks h2 inner join class c2 on c2.id = h2.class_id inner join users u on c2.id = u.class_id where u.name=$1) foo where foo.finished IS DISTINCT from 'yes'",
      [username]
    )
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});
/////////////   get userhomeworks  by id --> only for Instructors      ////////////////
app.get("/userhomeworksALL/:id", function (req, res) {
  const userclass = req.params.id;
  if (userclass == 0 || userclass == "") {
    return res.status(400).send("Please log in!");
  }
  pool
    .query(
      "select h.id,h.optional, h.link, u2.name, u2.user_role, (select hf.finished from   homework_finished hf inner join homeworks h2 on hf.homeworks_id = h2.id inner join users u on u.id = hf.user_id where u.id = u2.id and h2.id = h.id ), (select hf.linkhwfinished from   homework_finished hf inner join homeworks h2 on hf.homeworks_id = h2.id inner join users u on u.id = hf.user_id where u.id = u2.id and h2.id = h.id ) from   homeworks h inner join class c2 on c2.id = h.class_id inner join users u2 on c2.id = u2.class_id where c2.id = $1 and u2.user_role = 'Student' ORDER BY h.id DESC;",
      [userclass]
    )
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});
///////////  CHANGE STATUS HOMEWORK   /////////////////
app.post("/homeworkfinished/:homeworkId", function (req, res) {
  let homeworkId = req.params.homeworkId;
  const userId = req.body.userId;
  pool
    .query(
      "insert into homework_finished (homeworks_id, user_id, finished) values ($1, $2, 'yes')",
      [homeworkId, userId]
    )
    .then(() => res.status(200).send("homework updated"))
    .catch((error) => {
      console.log(error);
      res.status(500).send("something went wrong :( ...");
    });
});
///////////  CHANGE LINK FINISHED HOMEWORK FROM NULL TO LINK  /////////////////
app.put("/homeworkfinishedlink/:homeworkId", function (req, res) {
  let homeworkId = req.params.homeworkId;
  const linkToHomework = req.body.link;
  const userId = req.body.userId;
  console.log(linkToHomework);
  pool
    .query(
      "UPDATE homework_finished SET linkhwfinished = $2 WHERE homeworks_id=$1 AND user_id=$3",
      [homeworkId, linkToHomework, userId]
    )
    .then(() => res.status(200).send("link to homework updated"))
    .catch((error) => {
      console.log(error);
      res.status(500).send("something went wrong :( ...");
    });
});
///////////  CHANGE HOMEWORK TO OPTIONAL /////////////////
app.put("/homeworkoptional/:homeworkId", function (req, res) {
  let homeworkId = req.params.homeworkId;
  const homeworkOptional = req.body.optional;

  pool
    .query("UPDATE homeworks SET optional = $2 WHERE id=$1", [
      homeworkId,
      homeworkOptional,
    ])
    .then(() => res.status(200).send("homework optional updated"))
    .catch((error) => {
      console.log(error);
      res.status(500).send("something went wrong :( ...");
    });
});
///////////  INSERT NEW PERSONAL LINK  /////////////////
app.post("/postpersonallink/:userId", function (req, res) {
  let userId = req.params.userId;
  const personallink = req.body.link;
  pool
    .query("insert into perslinks (user_id, description) values ($1, $2)", [
      userId,
      personallink,
    ])
    .then(() => res.status(200).send("new personal link set"))
    .catch((error) => {
      console.log(error);
      res.status(500).send("something went wrong :( ...");
    });
});
///////////  INSERT NEW GENERAL LINK  /////////////////
app.post("/postgenerallink/:classId", function (req, res) {
  let classid = req.params.classId;
  const generallink = req.body.link;
  pool
    .query("insert into links (class_id, description) values ($1, $2)", [
      classid,
      generallink,
    ])
    .then(() => res.status(200).send("new personal link set"))
    .catch((error) => {
      console.log(error);
      res.status(500).send("something went wrong :( ...");
    });
});
///////////  INSERT NEW HOMEWORK AS INSTRUCTOR /////////////////
app.post("/posthomework/:classId", function (req, res) {
  let classid = req.params.classId;
  const newhomework = req.body.link;
  pool
    .query("insert into homeworks (class_id, link) values ($1, $2)", [
      classid,
      newhomework,
    ])
    .then(() => res.status(200).send("new homework set"))
    .catch((error) => {
      console.log(error);
      res.status(500).send("something went wrong :( ...");
    });
});
//////////////  DELETE GENERAL LINK    ////////////
app.delete("/deletegenlink", function (req, res) {
  const linkdescription = req.body.link;
  pool
    .query("DELETE FROM links WHERE id = $1", [linkdescription])
    .then(() => res.send(`Link ${linkdescription} deleted!`))
    .catch((e) => res.status(400).send("The link can't be deleted!"));
});
//////////////  DELETE PERSONAL LINK    ////////////
app.delete("/deletepersonallink", function (req, res) {
  const linkdescription = req.body.link;
  pool
    .query("DELETE FROM perslinks WHERE id = $1", [linkdescription])
    .then(() => res.send(`Link ${linkdescription} deleted!`))
    .catch((e) => res.status(400).send("The link can't be deleted!"));
});
///////////  CHANGE STARS PERSONAL LINKS     /////////////////
app.put("/personallinkstars/:linkId", function (req, res) {
  let linkId = req.params.linkId;
  const numberStars = req.body.link;

  pool
    .query("UPDATE perslinks SET stars = $2 WHERE id=$1", [linkId, numberStars])
    .then(() => res.status(200).send("Stars updated"))
    .catch((error) => {
      console.log(error);
      res.status(500).send("something went wrong :( ...");
    });
});
///////////  CHANGE STARS GENERAL LINKS     /////////////////
app.put("/generallinkstars/:linkId", function (req, res) {
  let linkId = req.params.linkId;
  const numberStars = req.body.link;

  pool
    .query("UPDATE links SET stars = $2 WHERE id=$1", [linkId, numberStars])
    .then(() => res.status(200).send("Stars updated"))
    .catch((error) => {
      console.log(error);
      res.status(500).send("something went wrong :( ...");
    });
});
//////////////   POST    ////////////////
app.post("/user", (req, res) => {
  user_model
    .createuser(req.body)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});
/////////////   DELETE     ///////////////
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
