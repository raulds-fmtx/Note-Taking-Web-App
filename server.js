const express = require("express");
const generateUniqueId = require("generate-unique-id");
const fs = require("fs");
const path = require("path");

const PORT = 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

// GET request for notes page 
app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/notes.html"));
});

// GET request for notes
app.get("/api/notes", (req, res) => {
  console.info(`GET /api/notes`);

  // Obtain existing notes
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json("Error in retrieving notes.");
    } else {
      // Convert string into JSON object
      const notes = JSON.parse(data);
      res.status(200).json(notes);
    }
  });
});

// POST request to add a note
app.post('/api/notes', (req, res) => {
  // Log that a POST request was received
  console.info(`${req.method} request received to add a note`);

  // Destructuring assignment for the items in req.body
  const { title, text } = req.body;

  // If all the required properties are present
  if (title && text) {
    // Variable for the object we will save
    const newNote = {
      title,
      text,
      id: generateUniqueId(),
    };

    // Obtain existing notes
    fs.readFile("./db/db.json", "utf8", (err, data) => {
      if (err) {
        console.error(err);
      } else {
        // Convert string into JSON object
        const parsedNotes = JSON.parse(data);

        // Add a new review
        parsedNotes.push(newNote);

        // Write updated reviews back to the file
        fs.writeFile(
          "./db/db.json",
          JSON.stringify(parsedNotes, null, 4),
          (writeErr) =>
            writeErr
              ? console.error(writeErr)
              : console.info("Successfully updated notes!")
        );
      }
    });

    const response = {
      status: "success",
      body: newNote,
    };

    console.log(response);

    // res.json() returns data including a status message indicating the success of the request along with the newly created note data.
    res.status(201).json(response);
  } else {
    // the purpose of the else statement is to allow a way to throw an error if either the title or note is not present.
    res.status(500).json('Error in saving note');
  }
});

app.delete("/api/notes/:id", (req, res) => {
  // Log that a DELETE request was received
  console.info(`${req.method} request received to delete a note`);

  if (req.params.id) {
    // Obtain existing notes
    fs.readFile("./db/db.json", "utf8", (err, data) => {
      if (err) {
        console.error(err);
      } else {
        // Convert string into JSON object
        let parsedNotes = JSON.parse(data);
        const currLength = parsedNotes.length;

        // Add a new review
        parsedNotes = parsedNotes.filter((note) => note.id !== req.params.id);
        if (parsedNotes.length === currLength) {
          console.error("Error: id not found");
        }

        // Write updated reviews back to the file
        fs.writeFile(
          "./db/db.json",
          JSON.stringify(parsedNotes, null, 4),
          (writeErr) =>
            writeErr
              ? console.error(writeErr)
              : console.info("Successfully updated notes!")
        );
      }
    });

    const response = {
      status: "success",
      id: req.params.id,
    };

    console.log(response);

    // res.json() returns data including a status message indicating the success of the request along with the newly created note data.
    res.status(201).json(response);
  } else {
    // the purpose of the else statement is to allow a way to throw an error if the id is not present.
    res.status(500).json("Error in deleting note");
  }
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);