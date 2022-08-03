const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");
const nodemon = require("nodemon");

const router = express.Router();

//Route1: Get all the notes as per logged in user : Get '/api/notes/fetchallnotes'. Login required
router.get("/fetchallnotes", fetchUser, async (req, res) => {
  try {
    const allNoted = await Notes.find({ user: req.user.id });
    res.json(allNoted);
  } catch (error) {
    res.status(500).send(error.msg);
  }
});

//Route2: Add a new notes : POST '/api/notes/addnote'. Login required
router.post(
  "/addnote",
  fetchUser,
  [
    body("title", "Enter valid name").isLength({ min: 3 }),
    body("description", "Description must be at least 5 charecters").isLength({ min: 3 }) 
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { title, description, tag } = req.body;
      const note = new Notes({
        title, description, tag, user: req.user.id
      });
      const saveNotes = await note.save();
      res.json(saveNotes); 
    } catch (error) {
      res.status(500).send(error.msg);
    }
  }
);

//Route3: update an existing notes : PUT '/api/notes/updatenote'. Login required
router.put(
  "/updatenote/:id",
  fetchUser,
  [
    body("title", "Enter valid name").isLength({ min: 3 }),
    body("description", "Description must be at least 5 charecters").isLength({ min: 3 }) 
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { title, description, tag } = req.body;

      const newNote = {};

      if (title) {
        newNote.title = title;
      }
      if (description) {
        newNote.description = description;
      }

      if (tag) {
        newNote.tag = tag;
      }

      //find the notes and update it
      const note = await Notes.findById(req.params.id);

      if (!note) {
        return res.status(404).send('not found');
      }

      if (note.user.toString() !== req.user.id) {
        return res.status(401).send('Not allowed');
      }

      const isnoteUpdated = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true}); 
      res.json(note); 
    } catch (error) {
      res.status(500).send(error.msg);
    }
  }
);

//Route4: Delete an existing notes : Delete '/api/notes/deletenote'. Login required
router.delete("/deletenote/:id", fetchUser, async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      //find the notes and delete it
      const note = await Notes.findById(req.params.id);

      if (!note) {
        return res.status(404).send('not found');
      }

      if (note.user.toString() !== req.user.id) {
        return res.status(401).send('Not allowed');
      }

      const isnoteUpdated = await Notes.findByIdAndDelete(req.params.id); 
      res.json({success: 'Note has been deleted'}); 
    } catch (error) {
      res.status(500).send(error.msg);
    }
  }
);
module.exports = router;
