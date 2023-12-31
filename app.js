const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;
const initializeAndDdServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:30000");
    });
  } catch (e) {
    console.log(`SERVER ERROR:${e.message}`);
    process.exit(1);
  }
};

initializeAndDdServer();

const convertPascalToCamel = (getMovie) => {
  return {
    movieId: getMovie.movie_id,
    directorId: getMovie.director_id,
    movieName: getMovie.movie_name,
    leadActor: getMovie.lead_actor,
  };
};

//API 1
app.get("/movies/", async (request, response) => {
  const searchMoviesQuery = `SELECT movie_name FROM movie`;
  const moviesArray = await db.all(searchMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//API 2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `INSERT INTO movie (director_id,movie_name,lead_actor)
                                VALUES('${directorId}','${movieName}','${leadActor}');`;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id=${movieId};`;
  const getMovie = await db.get(getMovieQuery);
  response.send(covertPascalToCamel(getMovie));
});

//API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `UPDATE movie 
                                    SET (director_id=${directorId},movie_name='${movieName}',lead_actor='${leadActor}'
                                    WHERE movie_id=${movieId};)`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE * FROM movie WHERE movie_id=${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) => ({
      directorId: eachDirector.directorId,
      directorName: eachDirector.directorName,
    }))
  );
});

//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieQuery = `SELECT movie_name FROM movie WHERE director_id=${directorId}`;
  const getMovieArray = await db.all(getMovieQuery);
  response.send(
    getMovieArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
