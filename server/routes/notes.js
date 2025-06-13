const express = require('express');
const router = express.Router();
const { pool } = require('../db/db');
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

require("dotenv").config();

// Generate a random image name
const randomImageName = (bytes = 16) =>
  crypto.randomBytes(bytes).toString('hex');

// S3 Client Configuration
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

router.get('/upload-url', async (req, res) => {
  const imageName = randomImageName();
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: imageName,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 }); // URL expires in 60 seconds
    res.json({ uploadUrl: signedUrl, key: imageName });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ error: 'Could not generate upload URL' });
  }
});

router.get('/', async (req, res) => {
  try { 
    const { rows } = await pool.query(
      'SELECT * FROM notes ORDER BY created_at DESC'
    );

    // Generate signed URL
    for (const note of rows) {
      if (note.image_url) {
        const command = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: note.image_url,
        });
        // The URL will be valid for 1 hour (3600 seconds)
        note.image_display_url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      }
    }

    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      'SELECT * FROM notes WHERE note_id = $1',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Note not found' });
    }

    const note = rows[0];

    // Generate signed URL if note has image
    if (note.image_url) {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: note.image_url,
      });
      note.image_display_url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/', async (req, res) => {
  const { title, content, image_url } = req.body;

  try {
    const { rows } = await pool.query(
      'INSERT INTO notes (title, content, image_url) VALUES ($1, $2, $3) RETURNING *',
      [title, content, image_url]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, image_url: new_image_url } = req.body;

  try {
    // Get current image url before updating
    let oldImageUrl = null;
    const currentNoteResult = await pool.query(
      'SELECT image_url FROM notes WHERE note_id = $1',
      [id]
    );

    if (currentNoteResult.rows.length > 0) {
      oldImageUrl = currentNoteResult.rows[0].image_url;
    }

    // Update note in database
    const { rows } = await pool.query(
      'UPDATE notes SET title = $1, content = $2, image_url = $3, updated_at = NOW() WHERE note_id = $4 RETURNING *',
      [title, content, new_image_url, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Note not found' });
    }

    // If image is replaced, delete old image from S3
    if (oldImageUrl && oldImageUrl !== new_image_url) {
      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: oldImageUrl,
      };

      try {
        await s3Client.send(new DeleteObjectCommand(deleteParams));
        console.log(`Successfully deleted old image ${oldImageUrl} from S3.`);
      } catch (s3Error) {
        console.error(`Error deleting old image from S3: ${oldImageUrl}`, s3Error);
      }
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM notes WHERE note_id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ msg: 'Note not found' });
    }

    // Delete image in s3 bucket
    const deletedNote = result.rows[0];
    if (deletedNote.image_url) {
      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: deletedNote.image_url,
      };

      try {
        await s3Client.send(new DeleteObjectCommand(deleteParams));
        console.log(`Successfully deleted image ${deletedNote.image_url} from S3.`);
      } catch (s3Error) {
        console.error(`Error deleting image from S3: ${deletedNote.image_url}`, s3Error);
      }
    }

    res.json({ msg: 'Note deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
