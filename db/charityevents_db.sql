-- ============================================================
-- PROG2002 Assessment 3 - Charity Events Database
-- Database: charityevents_db
-- Schema: organisations, categories, events, registrations
-- ============================================================

CREATE DATABASE IF NOT EXISTS charityevents_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE charityevents_db;


-- Table: organisations (charity organisations that host events)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS organisations;

CREATE TABLE organisations (
  org_id           INT AUTO_INCREMENT PRIMARY KEY,
  org_name         VARCHAR(100) NOT NULL,
  org_description  TEXT,
  contact_email    VARCHAR(100),
  contact_phone    VARCHAR(30)
) ENGINE=InnoDB;


-- Table: categories (event categories e.g. gala, fun run)
-- ------------------------------------------------------------
CREATE TABLE categories (
  category_id          INT AUTO_INCREMENT PRIMARY KEY,
  category_name        VARCHAR(50) NOT NULL,
  category_description TEXT
) ENGINE=InnoDB;


-- Table: events (the charity events)
-- ------------------------------------------------------------
CREATE TABLE events (
  event_id          INT AUTO_INCREMENT PRIMARY KEY,
  event_name        VARCHAR(120) NOT NULL,
  event_description TEXT,
  event_date        DATE NOT NULL,
  event_time        TIME,
  location          VARCHAR(150),
  district          VARCHAR(60),
  goal_amount       DECIMAL(10,2),
  progress_percent  INT NOT NULL DEFAULT 0,
  ticket_price      DECIMAL(10,2) DEFAULT 0,
  image_url         VARCHAR(255),
  category_id       INT,
  org_id            INT,
  CONSTRAINT fk_events_category
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
  CONSTRAINT fk_events_org
    FOREIGN KEY (org_id) REFERENCES organisations(org_id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- Table: registrations (users who signed up for an event)
-- One user may register for multiple events, but can only register for the
-- same event once (enforced by the UNIQUE key on event_id + user_email).
-- ------------------------------------------------------------
CREATE TABLE registrations (
  registration_id    INT AUTO_INCREMENT PRIMARY KEY,
  event_id           INT NOT NULL,
  user_name          VARCHAR(100) NOT NULL,
  user_email         VARCHAR(100) NOT NULL,
  user_phone         VARCHAR(30),
  tickets_purchased  INT NOT NULL DEFAULT 1,
  registration_date  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_registrations_event
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
  UNIQUE KEY uk_event_user (event_id, user_email)
) ENGINE=InnoDB;


-- Sample data
-- ------------------------------------------------------------
INSERT INTO organisations (org_name, org_description, contact_email, contact_phone) VALUES
('Liuzhou Community Care', 'A local non-profit supporting families in need and youth development across Liuzhou.', 'hello@liuzhoucare.org.cn', '0772 281 1111'),
('Liuzhou Youth Charity League', 'A volunteer league organising community events to fund animal rescue and youth programs.', 'team@liuzhouyouth.org.cn', '0772 282 2222'),
('Luzhai Rural Education Fund', 'An education charity raising funds for rural schools in Luzhai and surrounding counties.', 'info@luzhai-edu.org.cn', '0772 283 3333');

INSERT INTO categories (category_name, category_description) VALUES
('Gala Dinner', 'Formal fundraising dinner with speeches, entertainment and donations.'),
('Fun Run', 'Community running event with entry fees going to the charity.'),
('Silent Auction', 'Bid on donated items; winners are announced at the end of the evening.'),
('Concert', 'Live music event where ticket sales support the charity.');

INSERT INTO events (event_name, event_description, event_date, event_time, location, district, goal_amount, progress_percent, ticket_price, image_url, category_id, org_id) VALUES
('Riverside Charity Gala Night', 'An elegant evening of dinner, live band and fundraising pledges at the historic riverside town of Yaobu.', '2026-11-14', '18:30:00', 'Yaobu Ancient Town Riverside Hall', 'Yufeng', 50000.00, 0, 150.00, '/images/event-1.jpg', 1, 1),
('Longtan Park Sunrise Fun Run', 'A scenic 5km and 10km fun run around the lake in Yufeng District, followed by a community breakfast.', '2026-10-18', '07:00:00', 'Longtan Park', 'Yufeng', 20000.00, 55, 30.00, '/images/event-2.jpg', 2, 2),
('Liuhou Park Silent Auction', 'Bid on donated art, experiences and goods in the heart of the old city. Free entry, all proceeds to youth programs.', '2026-12-05', '19:00:00', 'Liuhou Park', 'Chengzhong', 30000.00, 70, 0.00, '/images/event-3.jpg', 3, 2),
('Liujiang Riverside Concert', 'An acoustic concert on the banks of the Liujiang River, raising funds for family emergency housing.', '2026-11-28', '19:30:00', 'Liujiang Riverside Stage', 'Chengzhong', 40000.00, 40, 80.00, '/images/event-4.jpg', 4, 1),
('Ma''anshan Park 5K Fun Run', 'Family-friendly 5K run around Ma''anshan Hill. Kids under 12 run free with a paying adult.', '2026-10-04', '08:30:00', 'Ma''anshan Park', 'Yufeng', 15000.00, 0, 15.00, '/images/event-5.jpg', 2, 2),
('Wuxing Street Charity Gala', 'A formal gala with auction items and guest speakers to fund school supplies for rural Luzhai.', '2026-09-12', '18:00:00', 'Wuxing Street Grand Hotel', 'Chengzhong', 35000.00, 100, 120.00, '/images/event-6.jpg', 1, 3),
('Que''er Hill Winter Warmth Concert', 'An intimate winter concert raising funds for heating and blankets for families in Liubei District.', '2026-08-20', '19:00:00', 'Que''er Hill Park', 'Liubei', 25000.00, 100, 40.00, '/images/event-7.jpg', 4, 1),
('Liunan Evening Silent Auction', 'An evening auction with local crafts and food tastings to support community shelters.', '2026-07-25', '17:30:00', 'Liunan Cultural Square', 'Liunan', 18000.00, 100, 0.00, '/images/event-8.jpg', 3, 2),
('Liujiang District Festive Fun Run', 'A festive-themed fun run in December, with prizes for best costume.', '2026-12-20', '07:30:00', 'Liujiang Sports Park', 'Liujiang', 22000.00, 0, 25.00, '/images/event-9.jpg', 2, 1);


-- Sample data: registrations (at least 10, spread across several events)
-- ------------------------------------------------------------
INSERT INTO registrations (event_id, user_name, user_email, user_phone, tickets_purchased, registration_date) VALUES
(2, 'Chen Wei',      'chenwei@example.com',      '138 7721 0001', 2, '2026-09-20 10:15:00'),
(2, 'Li Na',        'lina@example.com',        '139 7721 0002', 1, '2026-09-25 14:40:00'),
(2, 'Zhang Yu',     'zhangyu@example.com',     '137 7721 0003', 4, '2026-10-01 09:05:00'),
(4, 'Wang Fang',    'wangfang@example.com',    '136 7721 0004', 2, '2026-10-05 19:22:00'),
(4, 'Liu Yang',     'liuyang@example.com',     '135 7721 0005', 1, '2026-10-12 20:01:00'),
(9, 'Huang Min',    'huangmin@example.com',    '134 7721 0006', 3, '2026-10-08 11:30:00'),
(9, 'Zhao Lei',     'zhaolei@example.com',     '133 7721 0007', 2, '2026-10-15 16:45:00'),
(1, 'Sun Jie',      'sunjie@example.com',      '132 7721 0008', 2, '2026-10-10 18:00:00'),
(1, 'Zhou Yan',     'zhouyan@example.com',     '131 7721 0009', 1, '2026-10-18 13:20:00'),
(3, 'Wu Hao',       'wuhao@example.com',        '130 7721 0010', 2, '2026-10-20 21:10:00'),
(3, 'Xu Jing',      'xujing@example.com',      '158 7721 0011', 1, '2026-10-25 15:55:00'),
(5, 'Ma Qiang',     'maqiang@example.com',      '159 7721 0012', 2, '2026-09-28 08:30:00');
