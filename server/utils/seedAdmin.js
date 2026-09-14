const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminEmail = 'pawan@gmail.com';
    const adminPassword = '854637';

    const adminExists = await User.findOne({ email: adminEmail });
    
    if (!adminExists) {
      console.log('Seeding permanent Admin user (pawan@gmail.com)...');
      await User.create({
        name: 'Pawan Admin',
        email: adminEmail,
        password: adminPassword, // pre-save hook in User.js hashes the password
        rollNumber: 'ADMIN-1',
        branch: 'Administration',
        semester: '1',
        role: 'admin',
        credits: 9999
      });
      console.log('Permanent Admin user seeded successfully.');
    } else {
      // If user exists, guarantee their role is admin
      if (adminExists.role !== 'admin') {
        adminExists.role = 'admin';
        await adminExists.save();
        console.log('Updated existing Pawan user to Admin role.');
      }
    }
  } catch (error) {
    console.error('Admin Seeding Error:', error.message);
  }
};

module.exports = seedAdmin;
