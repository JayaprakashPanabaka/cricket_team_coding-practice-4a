const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

// initialization of the Database
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // localhost server
    app.listen(3000, () =>
      console.log("Server is Running at http://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//Home API
app.get("/", (req, res) => {
  res.send("Hi Darling...!");
});

//Convert DB Object to Response Object
const convertBDObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//GET Players API 1
app.get("/players/", async (req, res) => {
  const getAllPlayersQuery = `
    SELECT
    *
    FROM
    cricket_team;`;

  const playersArray = await db.all(getAllPlayersQuery);
  res.send(
    playersArray.map((eachPlayer) =>
      convertBDObjectToResponseObject(eachPlayer)
    )
  );
});

//POST Player API 2
app.post("/players/", async (req, res) => {
  const { playerName, jerseyNumber, role } = req.body;
  const addPlayerQuery = `
    INSERT INTO cricket_team(player_name, jersey_number, role)
    VALUES('${playerName}', ${jerseyNumber}, '${role}')
    ;`;

  const player = await db.run(addPlayerQuery);
  res.send("Player Added to Team");
});

//GET Player API 3
app.get("/players/:playerId", async (req, res) => {
  const { playerId } = req.params;
  const getPlayerQuery = `
  SELECT 
    * 
  FROM 
    cricket_team
  WHERE
    player_id = ${playerId};
  `;

  const player = await db.get(getPlayerQuery);
  res.send(convertBDObjectToResponseObject(player));
});

//PUT Player API 4
app.put("/players/:playerId", async (req, res) => {
  const { playerId } = req.params;
  const { playerName, jerseyNumber, role } = req.body;

  const updatePlayerQuery = `
    UPDATE
        cricket_team
    SET
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
    WHERE
        player_id = ${playerId};
    `;

  await db.run(updatePlayerQuery);
  res.send("Player Details Updated");
});

//DELETE Player API 5
app.delete("/players/:playerId", async (req, res) => {
  const { playerId } = req.params;
  const deletePlayerQuery = `
    DELETE FROM
        cricket_team
    WHERE
        player_id = ${playerId};
    `;

  await db.run(deletePlayerQuery);
  res.send("Player Removed");
});

module.exports = app;
