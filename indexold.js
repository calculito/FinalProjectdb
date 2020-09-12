const express = require("express");
const app = express();
const port = 3000;
const { Pool } = require("pg");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const morgan = require("morgan"); //logs all the changes

// READ BODIES AND URL FROM REQUESTS
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// LOG ALL REQUEST
app.use(morgan("tiny"));

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "twittApp",
  password: "Qb1p5d.3t",
  port: 5432,
});

app.get("/", (req, res) => {
  console.log("a client connected to the endpoint /");
  res.send("Hello SQL!");
});
app.listen(port, () =>
  console.log(
    `Server is listening on port 3000. Ready to accept requests (use /):${port}`
  )
);

app.post("/newuser", function (req, res) {
  const newUserName = req.body.user_name;
  const newUserPassword = req.body.password;

  const query = "INSERT INTO users (user_name, password) VALUES ($1, $2)";

  pool
    .query("SELECT * FROM users WHERE user_name=$1", [newUserName])
    .then((result) => {
      if (result.rows.length > 0) {
        return res
          .status(400)
          .send("A user with the same name already exists!");
      } else {
        const query = "INSERT INTO users (user_name, password) VALUES ($1, $2)";
        pool
          .query(query, [newUserName, newUserPassword])
          .then(() => res.status(201).send("User created!"))
          .catch((e) => console.error(e));
      }
    });
});

app.post("/tweet", function (req, res) {
  let { content, authorId, hashtags } = req.body;
  let query =
    "INSERT INTO tweets (content, date_of_creating , author_id) VALUES ($1, $2, $3) RETURNING ID;";

  let now = new Date();
  pool
    .query(query, [content, now, authorId])
    .then((result) => res.status(201).send("Tweet created :) !"))
    .catch((error) => {
      console.log(error);
      res.status(500).send("something went wrong :( ...");
    });
});

app.get("/users", function (req, res) {
  pool.query("SELECT * FROM users", (error, result) => {
    res.json(result.rows);
  });
});

app.get("/users/:userId/tweets", function (req, res) {
  let { userId } = req.params;
  let query = 'SELECT * FROM tweets WHERE "author_id" = $1';
  pool
    .query(query, [userId])
    .then((result) => res.status(200).json(result.rows))
    .catch((error) => {
      console.log(error);
      res.status(500).send("something went wrong :( ...");
    });
});

app.put("/tweets/:tweetId", function (req, res) {
  let { content } = req.body;
  let { tweetId } = req.params;
  let query =
    'UPDATE tweets SET content = $1, "updateDate" = $2 WHERE id = $3;';
  let now = new Date();
  pool
    .query(query, [content, now, tweetId])
    .then((result) => res.status(200).send("tweet updated"))
    .catch((error) => {
      console.log(error);
      res.status(500).send("something went wrong :( ...");
    });
});

app.delete("/tweets/:tweetId", function (req, res) {
  let { tweetId } = req.params;
  let query = "DELETE FROM tweets WHERE id = $1;";
  pool
    .query(query, [tweetId])
    .then((result) => res.status(200).send("tweet deleted"))
    .catch((error) => {
      console.log(error);
      res.status(500).send("something went wrong :( ...");
    });
});

app.post("/tweets/:tweetId/like", function (req, res) {
  let { followerId, like } = req.body;
  let { tweetId } = req.params;
  let query =
    'INSERT INTO likes ("tweetId", "followerId", "like") VALUES ($1, $2, $3);';
  pool
    .query(query, [tweetId, followerId, like])
    .then((result) => res.status(200).send("tweet liked :) !"))
    .catch((error) => {
      console.log(error);
      res.status(500).send("something went wrong :( ...");
    });
});

app.get("/users/:userId/liked-tweets", function (req, res) {
  let { userId } = req.params;
  let query = `select t.* from users u
    inner join likes l on l."followerId" = u.id
    inner join tweets t on t.id =l."tweetId" 
    where u.id=$1`;
  pool
    .query(query, [userId])
    .then((result) => res.status(200).json(result.rows))
    .catch((error) => {
      console.log(error);
      res.status(500).send("something went wrong :( ...");
    });
});

app.post("/follower", function (req, res) {
  let { getfollowed_id, follower_id } = req.body;
  let query =
    'INSERT INTO getfollowed ("getfollowed_id", "follower_id") VALUES ($1, $2);';
  pool
    .query(query, [getfollowed_id, follower_id])
    .then((result) => res.status(201).send("new follower :) !"))
    .catch((error) => {
      console.log(error);
      res.status(500).send("something went wrong :( ...");
    });
});

//• Retreive all users that follow a specific user
//• Retrieve all users that are followed by a specific user

app.get("/following/:userId", function (req, res) {
  let { userId } = req.params;
  let query =
    'select * from getfollowed g2   inner join users u on u.id =g2."getfollowed_id"  where getfollowed_id = $1';
  pool
    .query(query, [userId])
    .then((result) => res.status(200).json(result.rows))
    .catch((error) => {
      console.log(error);
      res.status(500).send("something went wrong :( ...");
    });
});

app.get("/getfollowed/:userId", function (req, res) {
  let { userId } = req.params;
  let query =
    'select * from getfollowed g2   inner join users u on u.id =g2."follower_id"  where follower_id = $1';
  pool
    .query(query, [userId])
    .then((result) => res.status(200).json(result.rows))
    .catch((error) => {
      console.log(error);
      res.status(500).send("something went wrong :( ...");
    });
});

app.get("/tweetsWithHashtagsFromFollowed/userId/hashtag", function (req, res) {
  let { followerId, hashtag } = req.body;
  let query =
    'select * from getfollowed g2 inner join users u on u.id =g2."getfollowed_id" inner join tweets t on t.author_id =g2."getfollowed_id" inner join hashtags h on h.tweet_id = t.id where (follower_id = $1 AND h.hashtags =$2);';
  pool
    .query(query, [followerId, hashtag])
    .then((result) => res.status(200).json(result.rows))
    .catch((error) => {
      console.log(error);
      res.status(500).send("something went wrong :( ...");
    });
});
