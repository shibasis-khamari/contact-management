require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');
const Contact = require('./models/Contact');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API ROUTES

// 1. Get statistics overview
app.get('/api/contacts/stats', async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const favorites = await Contact.countDocuments({ is_favorite: true });
    
    const catAggregation = await Contact.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const categories = {};
    catAggregation.forEach(item => {
      categories[item._id] = item.count;
    });

    res.json({
      success: true,
      data: {
        total,
        favorites,
        categories
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Get all contacts (with search, category filter, sorting)
app.get('/api/contacts', async (req, res) => {
  try {
    const { search, category, favorite, sort } = req.query;
    const filter = {};

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { notes: searchRegex }
      ];
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (favorite === 'true' || favorite === '1') {
      filter.is_favorite = true;
    }

    // Sorting
    let sortObj = { name: 1 };
    switch (sort) {
      case 'name_desc':
        sortObj = { name: -1 };
        break;
      case 'date_asc':
        sortObj = { created_at: 1 };
        break;
      case 'date_desc':
        sortObj = { created_at: -1 };
        break;
      case 'name_asc':
      default:
        sortObj = { name: 1 };
        break;
    }

    const contacts = await Contact.find(filter).sort(sortObj);
    res.json({ success: true, count: contacts.length, data: contacts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Export contacts as JSON or CSV
app.get('/api/contacts/export', async (req, res) => {
  try {
    const format = req.query.format || 'json';
    const contacts = await Contact.find().sort({ name: 1 });

    if (format === 'csv') {
      const headers = ['ID', 'Name', 'Email', 'Phone', 'Category', 'Favorite', 'Notes', 'Created At'];
      const csvRows = [headers.join(',')];

      contacts.forEach(c => {
        const row = [
          c.id,
          `"${(c.name || '').replace(/"/g, '""')}"`,
          `"${(c.email || '').replace(/"/g, '""')}"`,
          `"${(c.phone || '').replace(/"/g, '""')}"`,
          `"${(c.category || '').replace(/"/g, '""')}"`,
          c.is_favorite ? 'Yes' : 'No',
          `"${(c.notes || '').replace(/"/g, '""')}"`,
          `"${c.created_at}"`
        ];
        csvRows.push(row.join(','));
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
      return res.send(csvRows.join('\n'));
    }

    // Default JSON export
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.json');
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Get contact by ID
app.get('/api/contacts/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }
    res.json({ success: true, data: contact });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Create new contact
app.post('/api/contacts', async (req, res) => {
  try {
    const { name, email, phone, category, is_favorite, notes } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    if (!phone || phone.trim() === '') {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    const contact = new Contact({
      name: name.trim(),
      email: (email || '').trim(),
      phone: phone.trim(),
      category: category || 'Personal',
      is_favorite: Boolean(is_favorite),
      notes: (notes || '').trim()
    });

    const savedContact = await contact.save();
    res.status(201).json({ success: true, message: 'Contact created successfully', data: savedContact });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Update contact by ID
app.put('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, category, is_favorite, notes } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    if (!phone || phone.trim() === '') {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        email: (email || '').trim(),
        phone: phone.trim(),
        category: category || 'Personal',
        is_favorite: Boolean(is_favorite),
        notes: (notes || '').trim()
      },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    res.json({ success: true, message: 'Contact updated successfully', data: updatedContact });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Toggle favorite status
app.patch('/api/contacts/:id/favorite', async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    contact.is_favorite = !contact.is_favorite;
    const updated = await contact.save();

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Delete contact by ID
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Contact.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    res.json({ success: true, message: 'Contact deleted successfully', deletedId: id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fallback to index.html for single-page routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server if called directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Contact Management server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
