-- ============================================================
-- Event Management System (EMS) - Database Schema & Sample Data
-- DBMS Mini Project
-- Relational Schema: 10 Normalized Tables
-- ============================================================

CREATE DATABASE IF NOT EXISTS event_management;
USE event_management;

-- 1. Admin Table
CREATE TABLE IF NOT EXISTS Admin (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Table (Participants)
CREATE TABLE IF NOT EXISTS User (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Category Table
CREATE TABLE IF NOT EXISTS Category (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- 4. Venue Table
CREATE TABLE IF NOT EXISTS Venue (
    venue_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(255),
    capacity INT NOT NULL
);

-- 5. Event Table
CREATE TABLE IF NOT EXISTS Event (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME DEFAULT '09:00:00',
    category_id INT,
    venue_id INT,
    fee DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    capacity INT NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES Category(category_id) ON DELETE SET NULL,
    FOREIGN KEY (venue_id) REFERENCES Venue(venue_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES Admin(admin_id) ON DELETE CASCADE
);

-- 6. Registration Table (Junction Table)
CREATE TABLE IF NOT EXISTS Registration (
    registration_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('confirmed', 'waitlisted', 'cancelled') NOT NULL DEFAULT 'confirmed',
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES Event(event_id) ON DELETE CASCADE,
    UNIQUE (user_id, event_id)
);

-- 7. Payment Table (1:1 with Registration)
CREATE TABLE IF NOT EXISTS Payment (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    registration_id INT NOT NULL UNIQUE,
    amount DECIMAL(8,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Simulated',
    payment_status ENUM('pending', 'success', 'failed') NOT NULL DEFAULT 'pending',
    transaction_ref VARCHAR(100),
    paid_at DATETIME,
    FOREIGN KEY (registration_id) REFERENCES Registration(registration_id) ON DELETE CASCADE
);

-- 8. Attendance Table (1:1 with Registration)
CREATE TABLE IF NOT EXISTS Attendance (
    attendance_id INT PRIMARY KEY AUTO_INCREMENT,
    registration_id INT NOT NULL UNIQUE,
    checked_in_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES Registration(registration_id) ON DELETE CASCADE
);

-- 9. Feedback Table (1:1 with Registration)
CREATE TABLE IF NOT EXISTS Feedback (
    feedback_id INT PRIMARY KEY AUTO_INCREMENT,
    registration_id INT NOT NULL UNIQUE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES Registration(registration_id) ON DELETE CASCADE
);

-- 10. Notification Table
CREATE TABLE IF NOT EXISTS Notification (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    event_id INT,
    message VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES Event(event_id) ON DELETE SET NULL
);

-- ============================================================
-- Seed Data matching presentation slides & real demo state
-- ============================================================

-- Admin
INSERT INTO Admin (admin_id, name, email, password) VALUES
(1, 'Event Committee', 'admin@uvce.edu', '$2b$10$6DBZ.wv1Pw/sjHnOcWt0fO.vS5KZy0z8d9BD.ixmuds5te3pq8Y4G')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Users (from Slide 10 screenshot)
INSERT INTO User (user_id, name, email, password) VALUES
(1, 'Manasa', 'manasamanasa0630@gmail.com', '$2b$10$9wY9vmidD9nItKRt6lg/XOG/2GU8iv7oXeD/aHy9hzvMZoUkCfSvy'),
(2, 'Chandramma', 'Chandra123@gmail.com', '$2b$10$tVu3xCDO4PW98QoLyO.d0.4N.Auntc75c0b9N7G91syu4pd.WMBne'),
(3, 'chandramma', 'Chandramma123@gmail.com', '$2b$10$sjRW8YLBjhS1qCaVktr1zulPDPK6sbo.NsCiJZuEdg/0a2NqWo2Cy'),
(5, 'Manasa', 'manasa0630@gmail.com', '$2b$10$0v/wzrZ5T6tmnDN8S3Ks8OApIjxYQzKSGWkvJ7GX6zC.wW5AL2F/e'),
(6, 'Manasa K', 'manasa@gmail.com', '$2b$10$GerRytc4qparUmEYSGGrE.U4bNU40GRAEWL9.Tc/n63OXvMkqVQJ.'),
(7, 'chandana', 'chandana@gmail.com', '$2b$10$bU2gLY.JVGXZ6Gzs62N7FOG.X1.sYUg6SNrSSbkNgVemw9K77C6mO')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Categories
INSERT INTO Category (category_id, name, description) VALUES
(1, 'Technical', 'Tech talks, workshops, hackathons'),
(2, 'Cultural', 'Fests, music, dance, drama'),
(3, 'Seminar', 'Guest lectures and academic seminars')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Venues
INSERT INTO Venue (venue_id, name, location, capacity) VALUES
(3, 'Seminar hall', 'UVCE', 60),
(4, 'Minchu', 'UVCE', 100)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Events (from Slide 8 screenshot)
INSERT INTO Event (event_id, title, description, event_date, event_time, category_id, venue_id, fee, capacity, created_by) VALUES
(1, 'Hackathon', 'Coding competition, event starts at 4:00pm and ends at 6:00pm', '2026-11-25', '13:00:00', 1, 4, 200.00, 4, 1),
(2, 'Quiz', 'Inter-departmental tech & general quiz championship', '2026-12-30', '11:00:00', 1, 3, 0.00, 60, 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Registrations (from Slide 10 screenshot)
INSERT INTO Registration (registration_id, user_id, event_id, status) VALUES
(1, 1, 1, 'confirmed'),
(7, 3, 1, 'confirmed'),
(8, 6, 1, 'confirmed'),
(9, 5, 1, 'cancelled'),
(11, 7, 1, 'confirmed'),
(20, 2, 1, 'cancelled'),
(5, 1, 2, 'confirmed'),
(21, 7, 2, 'confirmed')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Payments
INSERT INTO Payment (registration_id, amount, payment_method, payment_status, transaction_ref, paid_at) VALUES
(1, 200.00, 'Simulated UPI', 'success', 'TXN918274', '2026-11-04 12:05:00'),
(7, 200.00, 'Simulated Card', 'success', 'TXN918275', '2026-11-04 09:22:00'),
(8, 200.00, 'Simulated NetBanking', 'success', 'TXN918276', '2026-11-04 09:30:00'),
(11, 200.00, 'Simulated UPI', 'success', 'TXN918277', '2026-11-04 11:35:00')
ON DUPLICATE KEY UPDATE payment_status=VALUES(payment_status);

-- Attendance (from Slide 10 screenshot)
INSERT INTO Attendance (attendance_id, registration_id, checked_in_at) VALUES
(1, 5, '2026-11-03 19:14:44')
ON DUPLICATE KEY UPDATE checked_in_at=VALUES(checked_in_at);
