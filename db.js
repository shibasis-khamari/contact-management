const mongoose = require('mongoose');
const Contact = require('./models/Contact');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/contact_management';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`Connected to MongoDB at: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);

    // Seed initial sample contacts if collection is empty
    const count = await Contact.countDocuments();
    if (count === 0) {
      console.log('Seeding initial sample contacts into MongoDB...');
      await Contact.insertMany([
        {
          name: 'Alice Johnson',
          email: 'alice.johnson@example.com',
          phone: '+1 (555) 234-5678',
          category: 'Work',
          is_favorite: true,
          notes: 'Senior Product Designer at Acme Corp'
        },
        {
          name: 'Bob Smith',
          email: 'bob.smith@techdomain.org',
          phone: '+1 (555) 876-5432',
          category: 'Personal',
          is_favorite: false,
          notes: 'College roommate & fitness buddy'
        },
        {
          name: 'Charlie Brown',
          email: 'charlie.b@designs.io',
          phone: '+1 (555) 345-6789',
          category: 'Family',
          is_favorite: true,
          notes: 'Cousin - birthday in November'
        },
        {
          name: 'Diana Prince',
          email: 'diana.p@hero.org',
          phone: '+1 (555) 999-1122',
          category: 'Work',
          is_favorite: false,
          notes: 'Project lead for Cloud Migration'
        },
        {
          name: 'Ethan Hunt',
          email: 'ethan.hunt@imf.gov',
          phone: '+1 (555) 700-0077',
          category: 'Other',
          is_favorite: true,
          notes: 'Emergency security contact'
        }
      ]);
      console.log('Sample contacts seeded successfully into MongoDB.');
    }
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    console.error('Ensure MongoDB is installed and running on your system, or set MONGODB_URI environment variable.');
  }
};

module.exports = connectDB;
