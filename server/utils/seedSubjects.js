const Subject = require('../models/Subject');
const Note = require('../models/Note');

const initialSubjects = [
  // Computer Science
  { name: 'Computer Programming & Problem Solving', code: 'CS101', branch: 'Computer Science', semester: '1' },
  { name: 'Digital Logic & Computer Design', code: 'CS201', branch: 'Computer Science', semester: '2' },
  { name: 'Data Structures & Algorithms', code: 'CS301', branch: 'Computer Science', semester: '3' },
  { name: 'Operating Systems', code: 'CS302', branch: 'Computer Science', semester: '3' },
  { name: 'Computer Organization & Architecture', code: 'CS303', branch: 'Computer Science', semester: '3' },
  { name: 'Object Oriented Programming with Java', code: 'CS304', branch: 'Computer Science', semester: '3' },
  { name: 'Database Management Systems', code: 'CS401', branch: 'Computer Science', semester: '4' },
  { name: 'Theory of Computation & Automata', code: 'CS402', branch: 'Computer Science', semester: '4' },
  { name: 'Computer Networks', code: 'CS403', branch: 'Computer Science', semester: '4' },
  { name: 'Design & Analysis of Algorithms', code: 'CS404', branch: 'Computer Science', semester: '4' },
  { name: 'Software Engineering & Project Mgmt', code: 'CS501', branch: 'Computer Science', semester: '5' },
  { name: 'Web Technologies & Cloud Computing', code: 'CS502', branch: 'Computer Science', semester: '5' },
  { name: 'Artificial Intelligence & Expert Systems', code: 'CS601', branch: 'Computer Science', semester: '6' },
  { name: 'Machine Learning & Deep Learning', code: 'CS602', branch: 'Computer Science', semester: '6' },
  { name: 'Cyber Security & Cryptography', code: 'CS701', branch: 'Computer Science', semester: '7' },
  { name: 'Compiler Design', code: 'CS702', branch: 'Computer Science', semester: '7' },
  { name: 'Distributed Systems & Blockchain', code: 'CS801', branch: 'Computer Science', semester: '8' },

  // Information Technology
  { name: 'Foundations of Information Technology', code: 'IT101', branch: 'Information Technology', semester: '1' },
  { name: 'Data Structures using C++', code: 'IT301', branch: 'Information Technology', semester: '3' },
  { name: 'Relational Database Systems', code: 'IT401', branch: 'Information Technology', semester: '4' },
  { name: 'Network Security & Information Assurance', code: 'IT501', branch: 'Information Technology', semester: '5' },
  { name: 'Cloud Infrastructure & Services', code: 'IT601', branch: 'Information Technology', semester: '6' },

  // Electronics & Communication
  { name: 'Basic Electrical & Electronics', code: 'EC101', branch: 'Electronics & Communication', semester: '1' },
  { name: 'Electronic Devices and Circuits', code: 'EC301', branch: 'Electronics & Communication', semester: '3' },
  { name: 'Signals and Systems', code: 'EC302', branch: 'Electronics & Communication', semester: '3' },
  { name: 'Microprocessors and Microcontrollers', code: 'EC401', branch: 'Electronics & Communication', semester: '4' },
  { name: 'Analog & Digital Communication', code: 'EC402', branch: 'Electronics & Communication', semester: '4' },
  { name: 'VLSI Design & Embedded Systems', code: 'EC501', branch: 'Electronics & Communication', semester: '5' },

  // Electrical Engineering
  { name: 'Circuit Theory & Analysis', code: 'EE301', branch: 'Electrical Engineering', semester: '3' },
  { name: 'Electrical Machines - I', code: 'EE302', branch: 'Electrical Engineering', semester: '3' },
  { name: 'Power Systems - I', code: 'EE401', branch: 'Electrical Engineering', semester: '4' },
  { name: 'Control Systems', code: 'EE402', branch: 'Electrical Engineering', semester: '4' },

  // Mechanical Engineering
  { name: 'Engineering Thermodynamics', code: 'ME301', branch: 'Mechanical Engineering', semester: '3' },
  { name: 'Strength of Materials', code: 'ME302', branch: 'Mechanical Engineering', semester: '3' },
  { name: 'Fluid Mechanics & Hydraulic Machinery', code: 'ME401', branch: 'Mechanical Engineering', semester: '4' },
  { name: 'Kinematics of Machinery', code: 'ME402', branch: 'Mechanical Engineering', semester: '4' },

  // Civil Engineering
  { name: 'Building Materials & Construction', code: 'CE301', branch: 'Civil Engineering', semester: '3' },
  { name: 'Surveying & Geomatics', code: 'CE302', branch: 'Civil Engineering', semester: '3' },
  { name: 'Structural Analysis', code: 'CE401', branch: 'Civil Engineering', semester: '4' },
  { name: 'Fluid Mechanics in Civil Engg', code: 'CE402', branch: 'Civil Engineering', semester: '4' },

  // Chemical Engineering
  { name: 'Chemical Process Calculations', code: 'CH301', branch: 'Chemical Engineering', semester: '3' },
  { name: 'Fluid Flow Operations', code: 'CH401', branch: 'Chemical Engineering', semester: '4' }
];

const seedSubjectsAndMigrateNotes = async () => {
  try {
    // 1. Seed initial subjects if empty
    const count = await Subject.countDocuments();
    if (count === 0) {
      console.log('Seeding initial curriculum subjects...');
      await Subject.insertMany(initialSubjects);
      console.log(`Successfully seeded ${initialSubjects.length} curriculum subjects.`);
    }

    // 2. Migrate existing notes: set status = 'approved' if not set
    const unapprovedCount = await Note.countDocuments({ status: { $exists: false } });
    if (unapprovedCount > 0) {
      console.log(`Migrating ${unapprovedCount} existing notes to approved status...`);
      await Note.updateMany(
        { status: { $exists: false } },
        { 
          $set: { 
            status: 'approved',
            resourceType: 'notes'
          } 
        }
      );
    }
  } catch (error) {
    console.error('Error seeding subjects / migrating notes:', error.message);
  }
};

module.exports = seedSubjectsAndMigrateNotes;
