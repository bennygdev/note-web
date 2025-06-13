const express = require('express');
const router = express.Router();
const { Note } = require('../models');
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const multer = require('multer');
require("dotenv").config();

// Generate a random image name
const randomImageName = (bytes = 16) => crypto.randomBytes(bytes).toString('hex');

// S3 Client Configuration
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer config
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', async (req, res) => {
  try { 
    const notes = await Note.findAll({ order: [['created_at', 'DESC']] });

    // Generate signed URL
    for (const note of notes) {
      if (note.image_url) {
        const command = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: note.image_url,
        });
        // The URL will be valid for 1 hour (3600 seconds)
        note.setDataValue('image_display_url', await getSignedUrl(s3Client, command, { expiresIn: 3600 }));
      }
    }

    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }

    // Generate signed URL if note has image
    if (note.image_url) {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: note.image_url,
      });
      note.setDataValue('image_display_url', await getSignedUrl(s3Client, command, { expiresIn: 3600 }));
    }

    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    let imageUrl = null;

    // If an image is uploaded, send to S3
    if (req.file) {
      const imageName = randomImageName();
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: imageName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      });
      await s3Client.send(command);
      imageUrl = imageName;
    }

    const newNote = await Note.create({ title, content, image_url: imageUrl });
    res.status(201).json(newNote);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findByPk(req.params.id);

    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }

    let newImageUrl = note.image_url;
    const oldImageUrl = note.image_url;

    // If a new image is uploaded
    if (req.file) {
      const imageName = randomImageName();
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: imageName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      });
      await s3Client.send(command);
      newImageUrl = imageName;

      // If there was an old image, delete from S3
      if (oldImageUrl) {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: oldImageUrl,
        });
        await s3Client.send(deleteCommand);
      }
    }

    // Update
    note.title = title;
    note.content = content;
    note.image_url = newImageUrl;
    await note.save();

    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);

    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }

    const imageUrlToDelete = note.image_url;

    // Delete note from database
    await note.destroy();

    // Delete image from S3 bucket
    if (imageUrlToDelete) {
      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: imageUrlToDelete,
      };
      await s3Client.send(new DeleteObjectCommand(deleteParams));
      console.log(`Successfully deleted image ${imageUrlToDelete} from S3.`);
    }

    res.json({ msg: 'Note deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
