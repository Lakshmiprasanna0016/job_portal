-- Unizoy Job Board Database Schema
-- Run this file to set up the database

CREATE DATABASE IF NOT EXISTS unizoy_jobboard;
USE unizoy_jobboard;

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  department VARCHAR(100) NOT NULL,
  location VARCHAR(150) NOT NULL,
  job_type ENUM('Full-time', 'Part-time', 'Contract', 'Internship', 'Remote') NOT NULL DEFAULT 'Full-time',
  experience_level ENUM('Entry', 'Mid', 'Senior', 'Lead', 'Manager') NOT NULL DEFAULT 'Mid',
  salary_range VARCHAR(100),
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  benefits TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  posted_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  candidate_name VARCHAR(150) NOT NULL,
  candidate_email VARCHAR(150) NOT NULL,
  resume_link VARCHAR(500) NOT NULL,
  cover_letter TEXT,
  status ENUM('Pending', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired') DEFAULT 'Pending',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Insert default admin (password: Admin@123)
-- Default admin (password: Admin@123) - SHA256 hash, no bcrypt needed
INSERT INTO admins (name, email, password) VALUES 
('Unizoy Admin', 'admin@unizoy.com', 'e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7')
ON DUPLICATE KEY UPDATE password = VALUES(password);

-- Insert sample jobs
INSERT INTO jobs (title, department, location, job_type, experience_level, salary_range, description, requirements, benefits, posted_by) VALUES
(
  'Senior Frontend Developer',
  'Engineering',
  'Remote / San Francisco, CA',
  'Full-time',
  'Senior',
  '$120,000 - $160,000',
  'We are looking for a passionate Senior Frontend Developer to join our growing engineering team at Unizoy. You will be responsible for building exceptional user experiences that power our platform used by millions.',
  '5+ years of experience with React.js\nStrong TypeScript skills\nExperience with state management (Redux, Zustand)\nKnowledge of performance optimization\nExperience with testing frameworks (Jest, Cypress)',
  'Competitive salary & equity\nRemote-first culture\nHealth, dental & vision insurance\nUnlimited PTO\nLearning & development budget',
  1
),
(
  'Product Designer',
  'Design',
  'New York, NY',
  'Full-time',
  'Mid',
  '$90,000 - $120,000',
  'Join Unizoy as a Product Designer and shape the future of our product. You will work closely with engineering and product teams to create intuitive and delightful experiences for our users.',
  '3+ years of product design experience\nProficiency in Figma\nExperience with user research and usability testing\nStrong portfolio demonstrating end-to-end design process\nAbility to communicate design decisions clearly',
  'Competitive salary\nFlexible work hours\nMedical & dental coverage\nMonthly wellness stipend\nAnnual design conference budget',
  1
),
(
  'Data Engineer',
  'Data',
  'Austin, TX (Hybrid)',
  'Full-time',
  'Mid',
  '$110,000 - $140,000',
  'Unizoy is seeking a Data Engineer to help build and maintain our data infrastructure. You will design and implement data pipelines that enable our teams to make data-driven decisions at scale.',
  '3+ years of data engineering experience\nProficiency in Python and SQL\nExperience with cloud platforms (AWS, GCP, or Azure)\nKnowledge of data warehousing concepts\nExperience with Apache Spark or similar frameworks',
  'Competitive compensation\nHybrid work model\nFull health benefits\n401k matching\nStock options',
  1
);

