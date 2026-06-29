-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jun 29, 2026 at 09:25 AM
-- Server version: 11.8.8-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u407486096_karehspamain`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` int(11) NOT NULL,
  `actor_type` varchar(20) NOT NULL DEFAULT 'staff',
  `actor_id` int(11) DEFAULT NULL,
  `actor_name` varchar(255) DEFAULT NULL,
  `category` varchar(50) NOT NULL,
  `action` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_log`
--

INSERT INTO `activity_log` (`id`, `actor_type`, `actor_id`, `actor_name`, `category`, `action`, `description`, `entity_type`, `entity_id`, `ip_address`, `created_at`) VALUES
(0, 'staff', 12, 'Joseph Ongosh', 'auth', 'login', 'Staff Joseph Ongosh (owner) logged in', NULL, NULL, '102.213.95.47', '2026-06-26 12:03:45');

-- --------------------------------------------------------

--
-- Table structure for table `addons`
--

CREATE TABLE `addons` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `material_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `labour_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `bulk_after` int(11) DEFAULT NULL,
  `bulk_labour_price` decimal(10,2) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `addons`
--

INSERT INTO `addons` (`id`, `name`, `material_price`, `labour_price`, `bulk_after`, `bulk_labour_price`, `status`, `created_at`, `updated_at`) VALUES
(0, 'Dye', 150.00, 500.00, 3, 299.90, 'Active', '2026-06-28 09:06:04', '2026-06-28 09:06:04');

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` int(11) NOT NULL,
  `appointment_code` varchar(20) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `customer_email` varchar(100) DEFAULT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `service_id` int(11) DEFAULT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `status` enum('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `cancel_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `appointment_code`, `customer_name`, `customer_email`, `customer_phone`, `service_id`, `staff_id`, `appointment_date`, `appointment_time`, `status`, `notes`, `cancel_reason`, `created_at`, `updated_at`) VALUES
(9, 'APT-001', 'Dismas', 'momanyid098@gmail.com', '0713553998', 23, 30, '2026-05-02', '09:30:00', 'completed', 'Shaving ', NULL, '2026-05-02 06:31:59', '2026-05-02 06:45:27'),
(10, 'APT-010', 'Dismas', 'momanyi098@gmail.com', '0713553998', 23, 30, '2026-05-03', '03:05:00', 'completed', 'Shave', NULL, '2026-05-03 11:07:09', '2026-05-03 11:18:03'),
(11, 'APT-011', 'Allan', 'allangassner0@gmail.com', '0711392797', 41, 16, '2026-05-03', '14:26:00', 'cancelled', '', NULL, '2026-05-03 11:26:38', '2026-05-03 15:42:10'),
(12, 'APT-012', 'Erick Nyakundi', 'ericknyakundi4@gmail.com', '0717022003', 23, 30, '2026-05-03', '15:55:00', 'completed', '', NULL, '2026-05-03 12:55:05', '2026-05-03 15:46:51'),
(13, 'APT-013', 'Eddmound', 'momanyid098@gmail.com', '0717481181', 23, 16, '2026-05-01', '10:00:00', 'completed', 'Shave', NULL, '2026-05-03 15:52:28', '2026-05-03 15:53:01'),
(14, 'APT-014', 'Eddmound', 'momanyid098@gmail.com', '0717481181', 23, 30, '2026-05-01', '10:00:00', 'completed', 'Shave', NULL, '2026-05-03 15:59:18', '2026-05-03 16:01:34'),
(15, 'APT-015', 'Allan Client', 'momanyid098@gmail.com', '0757818141', 23, 30, '2026-05-01', '12:04:00', 'completed', '', NULL, '2026-05-03 16:04:46', '2026-05-03 16:05:52'),
(16, 'APT-016', 'Sanchez', 'momanyid098@gmail.com', '0748876267', 23, 30, '2026-05-01', '19:13:00', 'completed', 'Shaving', NULL, '2026-05-03 16:14:37', '2026-05-03 16:15:44'),
(17, 'APT-017', 'Rachael Kamau', 'momanyid098@gmail.com', '0720789433', 23, 30, '2026-05-01', '19:19:00', 'completed', 'Shave', NULL, '2026-05-03 16:19:34', '2026-05-03 16:21:07'),
(18, 'APT-018', 'Allan Client', 'momanyid098@gmail.com', '0757818141', 23, 30, '2026-05-01', '19:22:00', 'completed', 'Shave', NULL, '2026-05-03 16:22:59', '2026-05-03 16:23:25'),
(19, 'APT-019', 'Allan Client', 'momanyid098@gmail.com', '0757818141', 23, 30, '2026-05-01', '19:24:00', 'completed', 'Shave', NULL, '2026-05-03 16:24:48', '2026-05-03 16:26:02'),
(20, 'APT-020', 'Feifei Lian', 'momanyid098@gmail.com', '0796112500', 23, 30, '2026-05-01', '19:30:00', 'completed', 'Shaving', NULL, '2026-05-03 16:31:01', '2026-05-03 16:31:55'),
(21, 'APT-021', 'Allan Client', 'momanyid098@gmail.com', '0757818141', 23, 30, '2026-05-01', '19:33:00', 'completed', 'Shaving', NULL, '2026-05-03 16:34:05', '2026-05-03 16:34:58'),
(22, 'APT-022', 'Kipkemoi Kirui', 'momanyid098@gmail.com', '0722123500', 23, 30, '2026-05-01', '17:37:00', 'completed', 'Shaving', NULL, '2026-05-03 16:38:53', '2026-05-03 16:39:55'),
(23, 'APT-023', 'Godfrey Kanaga', 'momanyid098@gmail.com', '0729387118', 23, 30, '2026-05-01', '17:42:00', 'completed', 'Shaving', NULL, '2026-05-03 16:43:09', '2026-05-03 16:44:13'),
(24, 'APT-024', 'Athriano Abaya', 'momanyid098@gmail.com', '0705873338', 23, 30, '2026-05-01', '20:04:00', 'completed', 'Shaving', NULL, '2026-05-03 17:06:06', '2026-05-03 17:07:07'),
(25, 'APT-025', 'Dismas Momanyi', 'momanyid098@gmail.com', '0713553998', 23, 30, '2026-05-01', '20:09:00', 'completed', '', NULL, '2026-05-03 17:09:04', '2026-05-03 17:09:45'),
(26, 'APT-026', 'Dismas', 'momanyid098@gmail.com', '0723131736', 43, 30, '2026-05-03', '22:55:00', 'cancelled', 'Dye', NULL, '2026-05-03 19:55:43', '2026-05-03 19:57:59'),
(27, 'APT-027', 'Noah Luvusi', 'momanyid098@gmail.com', '0725695803', 42, 20, '2026-05-01', '23:25:00', 'completed', 'Kid Shave', NULL, '2026-05-03 20:26:09', '2026-05-03 20:27:20'),
(28, 'APT-028', 'Monica Kiare', 'momanyid098@gmail.com', '0727989897', 42, 20, '2026-05-01', '23:28:00', 'completed', 'Kids shave', NULL, '2026-05-03 20:31:24', '2026-05-03 20:34:09'),
(29, 'APT-029', 'Monica Kiare', 'momanyid098@gmail.com', '0727989897', 42, 20, '2026-05-01', '23:35:00', 'completed', 'Kid shave', NULL, '2026-05-03 20:35:57', '2026-05-03 20:36:47'),
(30, 'APT-030', 'Herbert', 'momanyid098@gmail.com', '0710872126', 23, 20, '2026-05-01', '03:43:00', 'completed', 'Shave', NULL, '2026-05-03 20:44:30', '2026-05-03 20:45:35'),
(31, 'APT-031', 'Julian  Lemayian', 'momanyid098@gmail.com', '0720682285', 23, 20, '2026-05-01', '07:19:00', 'completed', '', NULL, '2026-05-04 03:19:22', '2026-05-04 03:21:34'),
(32, 'APT-032', 'Simon Oyaro', 'momanyid098@gmail.com', ' 0723957685', 23, 20, '2026-05-01', '09:23:00', 'completed', '', NULL, '2026-05-04 03:24:23', '2026-05-04 03:28:10'),
(33, 'APT-033', 'Maureen Omoga', 'momanyid098@gmail.com', '0724454512', 23, 20, '2026-05-01', '10:35:00', 'completed', 'Kids shaving ', NULL, '2026-05-04 03:34:36', '2026-05-04 03:37:26'),
(34, 'APT-034', 'Maureen Omoga', 'momanyid098@gmail.com', '0724454512', 42, 20, '2026-05-01', '08:45:00', 'completed', '', NULL, '2026-05-04 03:46:03', '2026-05-04 03:48:28'),
(35, 'APT-035', 'Andrew Muya ', 'momanyid098@gmail.com', '0713127963', 42, 20, '2026-05-01', '10:53:00', 'completed', 'Replaced with code SMS recorded as normal save', NULL, '2026-05-04 03:54:16', '2026-05-04 03:57:29'),
(36, 'APT-036', 'Joseph Mwangi', 'momanyid098@gmail.com', '0720333484', 23, 20, '2026-05-02', '08:59:00', 'completed', '', NULL, '2026-05-04 03:59:44', '2026-05-04 04:35:30'),
(37, 'APT-037', 'Shadrack Kibet', 'momanyid098@gmail.com', '0720333484', 23, 30, '2026-05-02', '08:01:00', 'completed', '', NULL, '2026-05-04 04:02:15', '2026-05-04 04:07:29'),
(38, 'APT-038', 'JAMES MPAAYO ', 'momanyid098@gmail.com', '0722989039', 23, 30, '2026-05-02', '09:04:00', 'completed', '', NULL, '2026-05-04 04:05:41', '2026-05-04 04:09:40'),
(39, 'APT-039', 'Felix Customer', 'momanyid098@gmail.com', '0727618381', 42, 20, '2026-05-02', '11:11:00', 'completed', '', NULL, '2026-05-04 04:12:22', '2026-05-04 04:27:29'),
(40, 'APT-040', 'Salome Ochieng', 'momanyid098@gmail.com', '0700889503', 42, 20, '2026-05-02', '11:13:00', 'completed', '', NULL, '2026-05-04 04:14:02', '2026-05-04 04:27:35'),
(41, 'APT-041', 'Salome Ochieng', 'momanyid098@gmail.com', '0700889503', 42, 20, '2026-05-02', '12:14:00', 'completed', '', NULL, '2026-05-04 04:14:54', '2026-05-04 04:27:39'),
(42, 'APT-042', 'Allan Client', 'momanyid098@gmail.com', '0757818141', 23, 30, '2026-05-02', '12:17:00', 'completed', '', NULL, '2026-05-04 04:17:50', '2026-05-04 04:27:43'),
(43, 'APT-043', 'Felix Customer', 'momanyid098@gmail.com', '0727618381', 23, 20, '2026-05-02', '13:20:00', 'completed', '', NULL, '2026-05-04 04:20:48', '2026-05-04 04:27:47'),
(44, 'APT-044', 'Noel Cheloti', 'momanyid098@gmail.com', '0700889503', 23, 30, '2026-05-02', '12:22:00', 'completed', '', NULL, '2026-05-04 04:22:48', '2026-05-04 04:27:52'),
(46, 'APT-045', 'Noel Cheloti', 'momanyid098@gmail.com', '0700889503', 42, 30, '2026-05-02', '13:24:00', 'completed', '', NULL, '2026-05-04 04:24:55', '2026-05-04 04:27:56'),
(47, 'APT-047', 'Peris Nyaboke', 'allangassner@gmail.com', '0722430655', 42, 30, '2026-05-02', '00:06:00', 'completed', '', NULL, '2026-05-04 06:07:32', '2026-05-04 06:09:58'),
(48, 'APT-048', 'Perish Nyaboke', 'allangassner@gmail.com', '0722430655', 42, 30, '2026-05-02', '00:30:00', 'completed', '', NULL, '2026-05-04 06:14:08', '2026-05-04 09:31:08'),
(49, 'APT-049', 'David Sakayo ', 'felixfelo041@gmail.com', '0768590790', 23, 20, '2026-05-02', '11:30:00', 'completed', '', NULL, '2026-05-04 06:20:01', '2026-05-04 06:23:29'),
(50, 'APT-050', 'Jhon Wilson', 'st.jhonwilson@gmail.com', '0733833346', 23, 30, '2026-05-04', '09:34:00', 'completed', '', NULL, '2026-05-04 06:34:33', '2026-05-04 09:30:44'),
(51, 'APT-051', 'Joseph Ololodi', 'allangassner@gmail.com', '0723532954', 23, 30, '2026-05-04', '13:43:00', 'completed', '', NULL, '2026-05-04 10:43:48', '2026-05-05 18:50:36'),
(52, 'APT-052', 'Simon Njoroge', 'skariuki1985@gmail.com', '0726116463', 23, 20, '2026-05-04', '14:03:00', 'completed', '', NULL, '2026-05-04 11:03:21', '2026-05-05 18:54:01'),
(53, 'APT-053', 'Vincente', 'vincentmusheba@gmail.com', '0727539092', 23, 30, '2026-05-05', '06:11:00', 'completed', '', NULL, '2026-05-05 14:11:17', '2026-05-05 18:54:10'),
(54, 'APT-054', 'Mary', 'momanyid098@gmail.com', '0723131736', 58, 27, '2026-05-05', '21:24:00', 'completed', '', NULL, '2026-05-05 19:24:54', '2026-05-05 19:28:46'),
(55, 'APT-055', 'Ongosh desktop', 'ongoshdesktop@gmail.com', '0742520245', 83, 20, '2026-06-28', '12:03:00', 'confirmed', '', NULL, '2026-06-28 09:20:15', '2026-06-28 09:26:15');

-- --------------------------------------------------------

--
-- Table structure for table `appointment_manage_tokens`
--

CREATE TABLE `appointment_manage_tokens` (
  `id` int(11) NOT NULL,
  `appointment_id` int(11) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `token_expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointment_manage_tokens`
--

INSERT INTO `appointment_manage_tokens` (`id`, `appointment_id`, `token_hash`, `token_expires_at`, `created_at`, `updated_at`) VALUES
(2, 9, 'd34b5baedd0aaf061e6bac52b5c8badc6fc2328ae6c24125c2b17a466f25d6af', '2026-06-01 09:31:59', '2026-05-02 06:31:59', '2026-05-02 06:31:59'),
(3, 10, 'cfaeb78df3e388935526e5e30c7ca2aa63d28745b71b86584badc952ae788c1c', '2026-06-02 14:07:09', '2026-05-03 11:07:09', '2026-05-03 11:07:09'),
(4, 11, 'aad1d55f89ee664f721db30cf1e85a3c6c2d2ff02cf4aae469e9eeb2fafac460', '2026-06-02 14:26:38', '2026-05-03 11:26:38', '2026-05-03 11:26:38'),
(5, 12, '1ef10357792962bc142a8176fa64fd58156c771efe971acde9abd047efd1e061', '2026-06-02 15:55:05', '2026-05-03 12:55:05', '2026-05-03 12:55:05'),
(6, 13, 'c91d33b02b06c4ea957dc9948ad70ac569e27841e2898d75e28dd7f8f708b149', '2026-06-02 18:52:28', '2026-05-03 15:52:28', '2026-05-03 15:52:28'),
(7, 14, '939035d2534d6de3fcf789836c8550c5b3c08b94eeb4564c4b481f9da61fc894', '2026-06-02 18:59:18', '2026-05-03 15:59:18', '2026-05-03 15:59:18'),
(8, 15, 'd14edc22acc9d4aeae1cee71fa8000de8c1faccc89db7b02968b94f91b9fd784', '2026-06-02 19:04:46', '2026-05-03 16:04:46', '2026-05-03 16:04:46'),
(9, 16, 'd1da4298c372c8788b8afebb94e04f98b1d3d60febd6580f2ea36835915bd652', '2026-06-02 19:14:37', '2026-05-03 16:14:37', '2026-05-03 16:14:37'),
(10, 17, 'd4c66844b1168db3f9e92b2c47e8abc81c5cf1cae8cbdc4e3655907e9188aeba', '2026-06-02 19:19:34', '2026-05-03 16:19:34', '2026-05-03 16:19:34'),
(11, 18, 'bc32f4755ff8cd50acf988ff98a5a66e5029a882f40a96e7421068ec9be5adac', '2026-06-02 19:22:59', '2026-05-03 16:22:59', '2026-05-03 16:22:59'),
(12, 19, 'e47d2725fb03a02c970b8b396899da184e42b1de2e46b48fb811f6a2e669594c', '2026-06-02 19:24:48', '2026-05-03 16:24:48', '2026-05-03 16:24:48'),
(13, 20, '8c3c961c3e6682139710d82feb40f587345216508ee0a6f214d24d3b75fb1369', '2026-06-02 19:31:01', '2026-05-03 16:31:01', '2026-05-03 16:31:01'),
(14, 21, '3a48211458103d4b4e34a477d4356bc5b8d2a9a6952902b9791ca2e995eba90b', '2026-06-02 19:34:05', '2026-05-03 16:34:05', '2026-05-03 16:34:05'),
(15, 22, '9c626e492f6702a70b48f59a0705b90f7f7c45bf67184d46e51258c9ddbcabf3', '2026-06-02 19:38:53', '2026-05-03 16:38:53', '2026-05-03 16:38:53'),
(16, 23, 'bdf07fe4329c486a168c0f84346c0742c8fb7d1b424ce111759b7e93fd253b99', '2026-06-02 19:43:09', '2026-05-03 16:43:09', '2026-05-03 16:43:09'),
(17, 24, '9e42096693985e543023702ed6b968ffa6a0c1f1a8992ffcacf207faf9440ae9', '2026-06-02 20:06:06', '2026-05-03 17:06:06', '2026-05-03 17:06:06'),
(18, 25, '8b93f5a92e7459718c5a17a5dfd5a76ef12955087e399f818309d6c70aec3ce6', '2026-06-02 20:09:04', '2026-05-03 17:09:04', '2026-05-03 17:09:04'),
(19, 26, '1add6c69d685e99e8c142f580c8d54e144500c6cc9f9be6b117ad1bfbe23b294', '2026-06-02 22:55:43', '2026-05-03 19:55:43', '2026-05-03 19:55:43'),
(20, 27, '70b2272aefc6f2c44e21acd0a71c0224bab896f752010007b78137a1de8f79d5', '2026-06-02 23:26:09', '2026-05-03 20:26:09', '2026-05-03 20:26:09'),
(21, 28, 'ffc48df954f0d203e0c291617eb6870d7a1fbc2a573b94e7dff6d9bcf3407cac', '2026-06-02 23:31:24', '2026-05-03 20:31:24', '2026-05-03 20:31:24'),
(22, 29, 'c921bf0d3a93a06d8090d42a9eb286b7e6bc61a08999c044296b963d940793a1', '2026-06-02 23:35:57', '2026-05-03 20:35:57', '2026-05-03 20:35:57'),
(23, 30, '41741ace4cd0b3f693dcb86d6e6f29c056023484fa6c21cb380e3dc965cb38a0', '2026-06-02 23:44:30', '2026-05-03 20:44:30', '2026-05-03 20:44:30'),
(24, 31, '62a3700ace4d4acdcbf2a99eeec2da6d3e49b5fb919610349ae6147313de7416', '2026-06-03 06:19:22', '2026-05-04 03:19:22', '2026-05-04 03:19:22'),
(25, 32, '98cb33e505bf6e6abe4661f8e5fcde51f6d8d67aa09f337ac221f2ccf72ad42a', '2026-06-03 06:24:23', '2026-05-04 03:24:23', '2026-05-04 03:24:23'),
(26, 33, '7485a82693d37ec0696bd3efa0da18c79aaf98fc5248b64e4ee0195b7e4dfd9c', '2026-06-03 06:34:36', '2026-05-04 03:34:36', '2026-05-04 03:34:36'),
(27, 34, '04f60eaa4d0e389477f0df9e74b617d31af3322afa3875e91ce0af4da1926707', '2026-06-03 06:46:03', '2026-05-04 03:46:03', '2026-05-04 03:46:03'),
(28, 35, '9adc1b91fb75731c7fc663a0f216b4ea0cf7268f99d1d9398825f7c6464da33a', '2026-06-03 06:54:16', '2026-05-04 03:54:16', '2026-05-04 03:54:16'),
(29, 36, '77b51a45d4868844b2085980227a707c5fba0ae1c5674aed3ae13b3e1a4a1ca2', '2026-06-03 06:59:44', '2026-05-04 03:59:44', '2026-05-04 03:59:44'),
(30, 37, '8b10d68b9f38aa0718f000166f52c519c5490ffb1ecbc6333d213b31c5c77e15', '2026-06-03 07:02:15', '2026-05-04 04:02:15', '2026-05-04 04:02:15'),
(31, 38, '0ecd908c28b4f420efbd0281c281633a0e1c36dfa4618439f7583fc5a6da6a2c', '2026-06-03 07:05:41', '2026-05-04 04:05:41', '2026-05-04 04:05:41'),
(32, 39, 'abfe6b04bd3dcd441f9ba44ebda1ba71d8075c99bf387fa86c346117ea22fcde', '2026-06-03 07:12:22', '2026-05-04 04:12:22', '2026-05-04 04:12:22'),
(33, 40, '4b0934a015777fbbe3e2096dd4a21d55abd6d308a14189f56806164cfd25425a', '2026-06-03 07:14:02', '2026-05-04 04:14:02', '2026-05-04 04:14:02'),
(34, 41, '877b7b34d2fca013362728b1ba095282270b2be5f634c82b54882faccef427e0', '2026-06-03 07:14:54', '2026-05-04 04:14:54', '2026-05-04 04:14:54'),
(35, 42, 'b570f5be3d30c6c756c4aa14e03c717fbfd09e8c5e1e803477fc44c2472c998a', '2026-06-03 07:17:50', '2026-05-04 04:17:50', '2026-05-04 04:17:50'),
(36, 43, 'b047838e734206ae1ba44d92fe32d5f2f14c47fdf1b15db9d73d70a3a19fa983', '2026-06-03 07:20:48', '2026-05-04 04:20:48', '2026-05-04 04:20:48'),
(37, 44, '11dbc9ac0cec3ecd2e3159f2d9ef01300f05f16a770600ded7c25f768aaf76bd', '2026-06-03 07:22:48', '2026-05-04 04:22:48', '2026-05-04 04:22:48'),
(39, 46, '3028dc21a74c20e0eb5e781e6db312cf0c27ec32125b0b5bd7ea6919f514c70c', '2026-06-03 07:24:55', '2026-05-04 04:24:55', '2026-05-04 04:24:55'),
(40, 47, '3c4f587b6cdfa84f5b061e41fd347caed8eff25fcb9117591aa63d00032f20b9', '2026-06-03 09:07:32', '2026-05-04 06:07:32', '2026-05-04 06:07:32'),
(41, 48, '2ccf051f8f045cb5de4839c97eec48fc6d305898481e6850789389b573cfddd7', '2026-06-03 09:14:08', '2026-05-04 06:14:08', '2026-05-04 06:14:08'),
(42, 49, '867906b5ed4eff0abad2443f7ee921ca81541a334841b0feebc18d4c2693e1d9', '2026-06-03 09:20:01', '2026-05-04 06:20:01', '2026-05-04 06:20:01'),
(43, 50, 'ff0ea30d6c8dbdd5310feba376097dbc9b8faa51c17ef183139f0582d9232f62', '2026-06-03 09:34:33', '2026-05-04 06:34:33', '2026-05-04 06:34:33'),
(44, 51, '9da3bd640b46be88cdd2f6416e99d0f8633c65d1e9a2d8ab26b96d31ecedc4c7', '2026-06-03 13:43:48', '2026-05-04 10:43:48', '2026-05-04 10:43:48'),
(45, 52, '0ffdfca06338ba73136c37a24c62c7bcdf900e5ea2e4b355e094685233a3c5be', '2026-06-03 14:03:21', '2026-05-04 11:03:21', '2026-05-04 11:03:21'),
(46, 53, 'bc22172f12962a569d5bd3f0f0429c4406424b6ffd81b314eef0b17ddaa25095', '2026-06-04 17:11:17', '2026-05-05 14:11:17', '2026-05-05 14:11:17'),
(47, 54, 'eb8cf8959e1a3df9c63769442f8a13b8bf089025f0cd75c2aa5ea339938d7cf5', '2026-06-04 22:24:54', '2026-05-05 19:24:54', '2026-05-05 19:24:54'),
(48, 55, '9828236b28e22fac3d29e8686bf2765defb6ac5bd96f7f1d253bd03462b12687', '2026-07-28 12:20:15', '2026-06-28 09:20:15', '2026-06-28 09:20:15');

-- --------------------------------------------------------

--
-- Table structure for table `appointment_services`
--

CREATE TABLE `appointment_services` (
  `id` int(11) NOT NULL,
  `appointment_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `sequence_no` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointment_services`
--

INSERT INTO `appointment_services` (`id`, `appointment_id`, `service_id`, `sequence_no`, `created_at`) VALUES
(0, 55, 83, 1, '2026-06-28 09:20:15');

-- --------------------------------------------------------

--
-- Table structure for table `commissions`
--

CREATE TABLE `commissions` (
  `id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `session_id` int(11) DEFAULT NULL,
  `session_service_id` int(11) DEFAULT NULL,
  `service_id` int(11) DEFAULT NULL,
  `source_type` enum('primary','addon') DEFAULT 'primary',
  `amount` decimal(10,2) NOT NULL,
  `gross_amount` decimal(10,2) DEFAULT 0.00,
  `commission_pool_amount` decimal(10,2) DEFAULT 0.00,
  `tax_amount` decimal(10,2) DEFAULT 0.00,
  `staff_amount` decimal(10,2) DEFAULT 0.00,
  `service_profit_amount` decimal(10,2) DEFAULT 0.00,
  `commission_rate` decimal(5,2) NOT NULL COMMENT 'Percentage rate at the time of session',
  `payment_status` enum('Pending','Paid') DEFAULT 'Pending',
  `payment_method` enum('Bank','Mobile Money','Cash') DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `settled_at` datetime DEFAULT NULL,
  `settlement_notes` text DEFAULT NULL,
  `handed_over_by` varchar(120) DEFAULT NULL,
  `settlement_batch_id` int(11) DEFAULT NULL,
  `payout_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `commissions`
--

INSERT INTO `commissions` (`id`, `staff_id`, `session_id`, `session_service_id`, `service_id`, `source_type`, `amount`, `gross_amount`, `commission_pool_amount`, `tax_amount`, `staff_amount`, `service_profit_amount`, `commission_rate`, `payment_status`, `payment_method`, `transaction_id`, `settled_at`, `settlement_notes`, `handed_over_by`, `settlement_batch_id`, `payout_date`, `created_at`, `updated_at`) VALUES
(24, 19, NULL, NULL, NULL, '', 1232.00, 3500.00, 1652.00, 420.00, 1232.00, 1848.00, 35.20, 'Paid', 'Mobile Money', 'YUESEIOWS', '2026-04-20 13:06:00', 'HAL', NULL, 3, '2026-04-20 10:06:00', '2026-04-20 13:04:19', '2026-04-20 13:07:12'),
(25, 14, NULL, NULL, NULL, '', 1232.00, 3500.00, 1652.00, 420.00, 1232.00, 1848.00, 35.20, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-20 13:04:23', '2026-04-20 13:04:23'),
(26, 19, NULL, NULL, NULL, '', 528.00, 1500.00, 708.00, 180.00, 528.00, 792.00, 35.20, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-20 13:08:37', '2026-04-20 13:08:37'),
(27, 30, NULL, NULL, 23, '', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Paid', 'Mobile Money', 'Kdl', '2026-05-03 11:21:00', 'Shave', NULL, 4, '2026-05-03 08:21:00', '2026-05-02 06:42:03', '2026-05-03 11:22:17'),
(28, 30, NULL, NULL, 23, '', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Paid', 'Mobile Money', 'Kdl', '2026-05-03 11:21:00', 'Shave', NULL, 4, '2026-05-03 08:21:00', '2026-05-03 11:20:48', '2026-05-03 11:22:17'),
(29, 30, NULL, NULL, 23, '', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-03 15:55:48', '2026-05-03 15:55:48'),
(30, 30, 32, 42, 23, 'primary', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-03 16:27:11', '2026-06-28 07:31:31'),
(31, 30, 33, 43, 23, 'primary', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-03 16:27:11', '2026-06-28 07:31:31'),
(32, 30, 34, 44, 23, 'primary', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-03 16:27:11', '2026-06-28 07:31:31'),
(33, 30, 35, 45, 23, 'primary', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-03 16:27:11', '2026-06-28 07:31:31'),
(34, 30, 36, 46, 23, 'primary', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-03 16:27:11', '2026-06-28 07:31:31'),
(35, 30, 37, 47, 23, 'primary', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-03 16:45:40', '2026-06-28 07:31:31'),
(36, 30, 38, 48, 23, 'primary', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-03 16:45:40', '2026-06-28 07:31:31'),
(37, 30, 39, 49, 23, 'primary', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-03 16:45:40', '2026-06-28 07:31:31'),
(38, 30, 40, 50, 23, 'primary', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-03 16:45:40', '2026-06-28 07:31:31'),
(39, 30, 41, 51, 23, 'primary', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-03 17:12:15', '2026-06-28 07:31:31'),
(40, 30, 42, 52, 23, 'primary', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-03 17:12:15', '2026-06-28 07:31:31'),
(41, 20, 44, 54, 42, 'primary', 90.00, 250.00, 115.00, 25.00, 90.00, 135.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-03 20:50:09', '2026-06-28 07:31:31'),
(42, 20, 45, 55, 42, 'primary', 90.00, 250.00, 115.00, 25.00, 90.00, 135.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-03 20:50:09', '2026-06-28 07:31:31'),
(43, 20, 46, 56, 42, 'primary', 90.00, 250.00, 115.00, 25.00, 90.00, 135.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-03 20:50:09', '2026-06-28 07:31:31'),
(44, 20, 47, 57, 23, 'primary', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-03 20:50:09', '2026-06-28 07:31:31'),
(45, 20, 48, 58, 23, 'primary', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-04 06:24:49', '2026-06-28 07:31:31'),
(46, 20, 49, 59, 23, 'primary', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-04 06:24:49', '2026-06-28 07:31:31'),
(47, 20, 50, 60, 23, 'primary', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-04 06:24:49', '2026-06-28 07:31:31'),
(48, 20, 51, 61, 42, 'primary', 90.00, 250.00, 115.00, 25.00, 90.00, 135.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-04 06:24:49', '2026-06-28 07:31:31'),
(49, 20, NULL, NULL, 42, '', 90.00, 250.00, 115.00, 25.00, 90.00, 135.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-04 06:24:49', '2026-05-04 06:24:49'),
(50, 20, 53, 63, 23, 'primary', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-04 06:24:49', '2026-06-28 07:31:31'),
(51, 20, 54, 64, 23, 'primary', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-04 06:24:49', '2026-06-28 07:31:31'),
(52, 30, 55, 65, 23, 'primary', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-04 06:24:49', '2026-06-28 07:31:31'),
(53, 20, 56, 66, 42, 'primary', 90.00, 250.00, 115.00, 25.00, 90.00, 135.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-04 06:24:49', '2026-06-28 07:31:31'),
(54, 20, 57, 67, 42, 'primary', 90.00, 250.00, 115.00, 25.00, 90.00, 135.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-04 06:24:49', '2026-06-28 07:31:31'),
(55, 20, 58, 68, 42, 'primary', 90.00, 250.00, 115.00, 25.00, 90.00, 135.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-04 06:24:49', '2026-06-28 07:31:31'),
(56, 30, 59, 69, 23, 'primary', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-04 06:24:49', '2026-06-28 07:31:31'),
(57, 20, 60, 70, 23, 'primary', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-04 06:24:49', '2026-06-28 07:31:31'),
(58, 30, 61, 71, 23, 'primary', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-04 06:24:49', '2026-06-28 07:31:31'),
(59, 30, 62, 72, 42, 'primary', 90.00, 250.00, 115.00, 25.00, 90.00, 135.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-04 06:24:49', '2026-06-28 07:31:31'),
(60, 30, 63, 73, 42, 'primary', 90.00, 250.00, 115.00, 25.00, 90.00, 135.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-04 06:24:49', '2026-06-28 07:31:31'),
(61, 30, 64, 74, 42, '', 90.00, 250.00, 115.00, 25.00, 90.00, 135.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-04 06:24:49', '2026-05-04 06:24:49'),
(62, 20, 65, 75, 23, 'primary', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-04 06:24:49', '2026-06-28 07:31:31'),
(63, 30, 66, 76, 23, '', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-04 09:59:42', '2026-05-04 09:59:42'),
(64, 30, 67, 77, 23, '', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-27 16:39:54', '2026-06-27 16:39:54'),
(65, 20, 68, 78, 23, '', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-27 16:39:54', '2026-06-27 16:39:54'),
(66, 18, 69, 79, 117, '', 308.00, 700.00, 392.00, 84.00, 308.00, 308.00, 44.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-27 16:39:54', '2026-06-27 16:39:54'),
(67, 30, 70, 80, 23, '', 144.00, 400.00, 184.00, 40.00, 144.00, 216.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-27 16:39:54', '2026-06-27 16:39:54'),
(68, 27, 71, 81, 58, '', 105.60, 300.00, 141.60, 36.00, 105.60, 158.40, 35.20, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-27 16:39:54', '2026-06-27 16:39:54'),
(69, 13, 85, 94, 118, 'primary', 1.80, 5.00, 2.30, 0.50, 1.80, 2.70, 36.00, 'Paid', 'Mobile Money', 'QWDT12YT', '2026-06-28 09:16:00', 'Advance', NULL, 5, '2026-06-28 06:16:00', '2026-06-28 07:31:31', '2026-06-28 09:17:31'),
(70, 14, 86, 95, 118, 'primary', 1.80, 5.00, 2.30, 0.50, 1.80, 2.70, 36.00, 'Paid', 'Cash', NULL, '2026-06-28 09:17:00', 'END MONTH', 'DISMUS', 6, '2026-06-28 06:17:00', '2026-06-28 07:31:31', '2026-06-28 09:18:17'),
(71, 13, 87, 96, 118, 'primary', 1.80, 5.00, 2.30, 0.50, 1.80, 2.70, 36.00, 'Paid', 'Mobile Money', 'QWDT12YT', '2026-06-28 09:16:00', 'Advance', NULL, 5, '2026-06-28 06:16:00', '2026-06-28 07:31:31', '2026-06-28 09:17:31'),
(72, 13, 88, 97, 28, 'primary', 140.80, 400.00, 188.80, 48.00, 140.80, 211.20, 35.20, 'Paid', 'Mobile Money', 'QWDT12YT', '2026-06-28 09:16:00', 'Advance', NULL, 5, '2026-06-28 06:16:00', '2026-06-28 07:31:31', '2026-06-28 09:17:31'),
(73, 14, 90, 99, 116, 'primary', 216.00, 600.00, 276.00, 60.00, 216.00, 324.00, 36.00, 'Paid', 'Cash', NULL, '2026-06-28 09:17:00', 'END MONTH', 'DISMUS', 6, '2026-06-28 06:17:00', '2026-06-28 09:14:50', '2026-06-28 09:18:17'),
(74, 20, 91, 100, 83, 'primary', 900.00, 2500.00, 1150.00, 250.00, 900.00, 1350.00, 36.00, 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-28 09:29:34', '2026-06-28 09:29:34');

-- --------------------------------------------------------

--
-- Table structure for table `commission_rules`
--

CREATE TABLE `commission_rules` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `commission_pool_rate` decimal(5,2) NOT NULL COMMENT 'Percent of gross allocated to commission pool',
  `tax_rate` decimal(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Percent of gross withheld as tax (deducted from pool for net staff pay)',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `commission_rules`
--

INSERT INTO `commission_rules` (`id`, `name`, `commission_pool_rate`, `tax_rate`, `sort_order`, `is_default`, `created_at`, `updated_at`) VALUES
(6, 'hair dresser (cap1)', 47.20, 12.00, 0, 0, '2026-04-20 11:45:06', '2026-06-27 16:44:19'),
(7, 'hair dresser (cap2)', 56.00, 12.00, 0, 0, '2026-04-20 11:46:29', '2026-04-20 11:46:29'),
(8, 'barber', 46.00, 10.00, 0, 1, '2026-04-20 11:47:22', '2026-06-27 16:44:19'),
(9, 'Beautician', 47.20, 12.00, 0, 0, '2026-04-20 11:48:46', '2026-04-20 11:48:46'),
(10, 'Shampoo girl', 47.20, 12.00, 0, 0, '2026-04-20 11:50:11', '2026-04-20 11:50:11');

-- --------------------------------------------------------

--
-- Table structure for table `commission_settlement_batches`
--

CREATE TABLE `commission_settlement_batches` (
  `id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `period_month` varchar(7) DEFAULT NULL COMMENT 'Service month (YYYY-MM) used when bulk-settling',
  `payment_method` varchar(32) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `settled_at` datetime DEFAULT NULL,
  `settlement_notes` text DEFAULT NULL,
  `handed_over_by` varchar(120) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `commission_settlement_batches`
--

INSERT INTO `commission_settlement_batches` (`id`, `staff_id`, `period_month`, `payment_method`, `transaction_id`, `settled_at`, `settlement_notes`, `handed_over_by`, `created_at`) VALUES
(3, 19, '2026-04', 'Mobile Money', 'YUESEIOWS', '2026-04-20 13:06:00', 'HAL', NULL, '2026-04-20 13:07:12'),
(4, 30, '2026-05', 'Mobile Money', 'Kdl', '2026-05-03 11:21:00', 'Shave', NULL, '2026-05-03 11:22:17'),
(5, 13, '2026-06', 'Mobile Money', 'QWDT12YT', '2026-06-28 09:16:00', 'Advance', NULL, '2026-06-28 09:17:31'),
(6, 14, '2026-06', 'Cash', NULL, '2026-06-28 09:17:00', 'END MONTH', 'DISMUS', '2026-06-28 09:18:17');

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `expense_date` date NOT NULL,
  `purpose` text NOT NULL,
  `transaction_code` varchar(120) NOT NULL DEFAULT '',
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','confirmed') NOT NULL DEFAULT 'pending',
  `created_by_staff_id` int(11) DEFAULT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `confirmed_by_staff_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `name`, `expense_date`, `purpose`, `transaction_code`, `amount`, `status`, `created_by_staff_id`, `confirmed_at`, `confirmed_by_staff_id`, `created_at`, `updated_at`) VALUES
(0, 'Rent', '2026-06-28', 'June Rent Payment', 'QW12HGT', 10000.00, 'pending', 12, NULL, NULL, '2026-06-28 09:38:39', '2026-06-28 09:38:39');

-- --------------------------------------------------------

--
-- Table structure for table `inhouse_service_requests`
--

CREATE TABLE `inhouse_service_requests` (
  `id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `preferred_date` date DEFAULT NULL,
  `preferred_time` time DEFAULT NULL,
  `location` varchar(255) NOT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','approved','completed','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(128) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_audit_log`
--

CREATE TABLE `payment_audit_log` (
  `id` bigint(20) NOT NULL,
  `session_id` int(11) NOT NULL,
  `event_type` varchar(40) NOT NULL COMMENT 'initiated, ipn_received, callback_received, status_checked, confirmed, failed, cancelled, amount_mismatch',
  `event_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'JSON',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `pesapal_order_tracking_id` varchar(64) DEFAULT NULL,
  `pesapal_merchant_reference` varchar(80) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_audit_log`
--

INSERT INTO `payment_audit_log` (`id`, `session_id`, `event_type`, `event_data`, `ip_address`, `user_agent`, `pesapal_order_tracking_id`, `pesapal_merchant_reference`, `created_at`) VALUES
(0, 72, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":800,\"merchant_reference\":\"SES072-14960f99c227dd9c\",\"order_tracking_id\":\"3f3d4103-2978-47d2-a046-da37152bb761\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '3f3d4103-2978-47d2-a046-da37152bb761', 'SES072-14960f99c227dd9c', '2026-06-26 12:23:06'),
(0, 72, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":800,\"merchant_reference\":\"SES072-f4ddde60e4755331\",\"order_tracking_id\":\"4086ba1d-af24-4b2a-ad80-da37beef7785\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '4086ba1d-af24-4b2a-ad80-da37beef7785', 'SES072-f4ddde60e4755331', '2026-06-26 12:25:58'),
(0, 72, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":800,\"merchant_reference\":\"SES072-28a92dd0276e48ea\",\"order_tracking_id\":\"54ef58ac-f40f-4425-bb8c-da378bbebc7c\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '54ef58ac-f40f-4425-bb8c-da378bbebc7c', 'SES072-28a92dd0276e48ea', '2026-06-26 12:26:08'),
(0, 72, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":800,\"merchant_reference\":\"SES072-de19068e7d8aa5ec\",\"order_tracking_id\":\"8355be07-2504-4dbd-bc1c-da37b899f63f\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8355be07-2504-4dbd-bc1c-da37b899f63f', 'SES072-de19068e7d8aa5ec', '2026-06-26 12:27:07'),
(0, 72, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":800,\"merchant_reference\":\"SES072-5a663af8c429a42c\",\"order_tracking_id\":\"98f8048e-c265-458f-a68f-da37d8a44f94\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '98f8048e-c265-458f-a68f-da37d8a44f94', 'SES072-5a663af8c429a42c', '2026-06-26 12:27:49'),
(0, 72, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":800,\"merchant_reference\":\"SES072-fa263468b247df92\",\"order_tracking_id\":\"c0b75dd3-52ad-49b5-a06a-da370574a9ff\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c0b75dd3-52ad-49b5-a06a-da370574a9ff', 'SES072-fa263468b247df92', '2026-06-26 12:28:03'),
(0, 72, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":800,\"merchant_reference\":\"SES072-2517894f6fc102a3\",\"order_tracking_id\":\"0d006c78-0e3b-4763-b3b3-da37281009a6\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0d006c78-0e3b-4763-b3b3-da37281009a6', 'SES072-2517894f6fc102a3', '2026-06-26 12:46:37'),
(0, 72, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0d006c78-0e3b-4763-b3b3-da37281009a6', 'SES072-2517894f6fc102a3', '2026-06-26 12:46:46'),
(0, 72, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0d006c78-0e3b-4763-b3b3-da37281009a6', 'SES072-2517894f6fc102a3', '2026-06-26 12:46:49'),
(0, 72, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0d006c78-0e3b-4763-b3b3-da37281009a6', 'SES072-2517894f6fc102a3', '2026-06-26 12:46:52'),
(0, 72, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0d006c78-0e3b-4763-b3b3-da37281009a6', 'SES072-2517894f6fc102a3', '2026-06-26 12:46:56'),
(0, 72, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0d006c78-0e3b-4763-b3b3-da37281009a6', 'SES072-2517894f6fc102a3', '2026-06-26 12:46:59'),
(0, 72, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0d006c78-0e3b-4763-b3b3-da37281009a6', 'SES072-2517894f6fc102a3', '2026-06-26 12:47:01'),
(0, 72, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0d006c78-0e3b-4763-b3b3-da37281009a6', 'SES072-2517894f6fc102a3', '2026-06-26 12:47:04'),
(0, 72, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0d006c78-0e3b-4763-b3b3-da37281009a6', 'SES072-2517894f6fc102a3', '2026-06-26 12:47:07'),
(0, 72, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0d006c78-0e3b-4763-b3b3-da37281009a6', 'SES072-2517894f6fc102a3', '2026-06-26 12:47:10'),
(0, 72, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0d006c78-0e3b-4763-b3b3-da37281009a6', 'SES072-2517894f6fc102a3', '2026-06-26 12:47:13'),
(0, 72, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0d006c78-0e3b-4763-b3b3-da37281009a6', 'SES072-2517894f6fc102a3', '2026-06-26 12:47:17'),
(0, 72, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0d006c78-0e3b-4763-b3b3-da37281009a6', 'SES072-2517894f6fc102a3', '2026-06-26 12:47:20'),
(0, 72, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0d006c78-0e3b-4763-b3b3-da37281009a6', 'SES072-2517894f6fc102a3', '2026-06-26 12:47:23'),
(0, 72, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0d006c78-0e3b-4763-b3b3-da37281009a6', 'SES072-2517894f6fc102a3', '2026-06-26 12:47:26'),
(0, 72, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0d006c78-0e3b-4763-b3b3-da37281009a6', 'SES072-2517894f6fc102a3', '2026-06-26 12:47:29'),
(0, 72, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0d006c78-0e3b-4763-b3b3-da37281009a6', 'SES072-2517894f6fc102a3', '2026-06-26 12:47:32'),
(0, 72, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0d006c78-0e3b-4763-b3b3-da37281009a6', 'SES072-2517894f6fc102a3', '2026-06-26 12:47:35'),
(0, 72, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0d006c78-0e3b-4763-b3b3-da37281009a6', 'SES072-2517894f6fc102a3', '2026-06-26 12:47:38'),
(0, 72, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0d006c78-0e3b-4763-b3b3-da37281009a6', 'SES072-2517894f6fc102a3', '2026-06-26 12:47:41'),
(0, 76, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES076-7f568ae7652bbc9b\",\"order_tracking_id\":\"bd94ea96-c0e6-4015-90c6-da37a6986379\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:51:14'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:51:24'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:51:27'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:51:30'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:51:33'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:51:36'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:51:39'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:51:42'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:51:45'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:51:48'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:51:51'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:51:54'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:51:58'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:52:01'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:52:04'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:52:07'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:52:10'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:52:13'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:52:16'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:52:19'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:52:22'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:52:25'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:52:28'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:52:31'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:52:34'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:52:37'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:52:40'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:52:43'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:52:46'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:52:52'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:52:55'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:52:58'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:53:01'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:53:04'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:53:07'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:53:10'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:53:13'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bd94ea96-c0e6-4015-90c6-da37a6986379', 'SES076-7f568ae7652bbc9b', '2026-06-26 12:53:16'),
(0, 76, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES076-49f7dfa604e5dba9\",\"order_tracking_id\":\"1e28ba52-8649-42e3-930d-da371042d228\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1e28ba52-8649-42e3-930d-da371042d228', 'SES076-49f7dfa604e5dba9', '2026-06-26 12:53:31'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1e28ba52-8649-42e3-930d-da371042d228', 'SES076-49f7dfa604e5dba9', '2026-06-26 12:53:38'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1e28ba52-8649-42e3-930d-da371042d228', 'SES076-49f7dfa604e5dba9', '2026-06-26 12:53:41'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1e28ba52-8649-42e3-930d-da371042d228', 'SES076-49f7dfa604e5dba9', '2026-06-26 12:53:44'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1e28ba52-8649-42e3-930d-da371042d228', 'SES076-49f7dfa604e5dba9', '2026-06-26 12:53:47'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1e28ba52-8649-42e3-930d-da371042d228', 'SES076-49f7dfa604e5dba9', '2026-06-26 12:53:51'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1e28ba52-8649-42e3-930d-da371042d228', 'SES076-49f7dfa604e5dba9', '2026-06-26 12:53:54'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1e28ba52-8649-42e3-930d-da371042d228', 'SES076-49f7dfa604e5dba9', '2026-06-26 12:53:57'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1e28ba52-8649-42e3-930d-da371042d228', 'SES076-49f7dfa604e5dba9', '2026-06-26 12:54:00'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1e28ba52-8649-42e3-930d-da371042d228', 'SES076-49f7dfa604e5dba9', '2026-06-26 12:54:03'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1e28ba52-8649-42e3-930d-da371042d228', 'SES076-49f7dfa604e5dba9', '2026-06-26 12:54:07'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1e28ba52-8649-42e3-930d-da371042d228', 'SES076-49f7dfa604e5dba9', '2026-06-26 12:54:10'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1e28ba52-8649-42e3-930d-da371042d228', 'SES076-49f7dfa604e5dba9', '2026-06-26 12:54:13'),
(0, 75, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":400,\"merchant_reference\":\"SES075-8e89d895f412db38\",\"order_tracking_id\":\"8cb3bb94-1571-42fe-8758-da372287156c\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8cb3bb94-1571-42fe-8758-da372287156c', 'SES075-8e89d895f412db38', '2026-06-26 20:41:06'),
(0, 76, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES076-a07081cfa5787475\",\"order_tracking_id\":\"fcd6fdee-32f9-47c3-8855-da3697558d21\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:36:50'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:36:59'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:37:02'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:37:05'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:37:09'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:37:12'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:37:15'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:37:18'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:37:21'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:37:24'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:37:29'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:37:32'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:37:35'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:37:38'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:37:41'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:37:44'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:37:47'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:37:50'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:37:53'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:37:56'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:37:59'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:38:02'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:38:05'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:38:08'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:38:11'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:38:14'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:38:17'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:38:20'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:38:26'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:38:29'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:38:32'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:38:35'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:38:39'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:38:42'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:38:45'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:38:48'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:38:51'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:38:54'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:38:57'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:39:00'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:39:03'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:39:06'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:39:09'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:39:12'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:39:15'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:39:18'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:39:21'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:39:24'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:39:27'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:39:30'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:39:33'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:39:36'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:39:39'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:39:42'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:39:45'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:39:48'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:40:41'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:41:41'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:42:41'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:43:41'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:44:41'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:45:41'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:46:24'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:46:24'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:46:27'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'fcd6fdee-32f9-47c3-8855-da3697558d21', 'SES076-a07081cfa5787475', '2026-06-26 23:46:30'),
(0, 76, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES076-7711278e8c1388a2\",\"order_tracking_id\":\"22151c68-a64f-48e9-952a-da364ccad5fc\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:46:38'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:46:49'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:46:52'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:46:55'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:46:58'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:47:01'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:47:04'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:47:07'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:47:10'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:47:13'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:47:16'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:47:19'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:47:22'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:47:25'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:47:28'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:47:31'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:47:34'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:47:38'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:47:40'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:47:43'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:47:46');
INSERT INTO `payment_audit_log` (`id`, `session_id`, `event_type`, `event_data`, `ip_address`, `user_agent`, `pesapal_order_tracking_id`, `pesapal_merchant_reference`, `created_at`) VALUES
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:47:49'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:47:52'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:47:55'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:47:58'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:48:01'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:48:04'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:48:08'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:48:10'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:48:13'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:48:16'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:48:19'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:48:22'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:48:25'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:48:28'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:48:31'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:48:34'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:48:37'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:48:40'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:49:41'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:50:41'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:51:41'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:52:41'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:53:41'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:54:41'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:55:36'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '22151c68-a64f-48e9-952a-da364ccad5fc', 'SES076-7711278e8c1388a2', '2026-06-26 23:55:37'),
(0, 76, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES076-99b2e5b2bc1a8146\",\"order_tracking_id\":\"29989591-7848-4223-bf67-da36c21b24b7\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:55:49'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:55:57'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:56:00'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:56:03'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:56:06'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:56:09'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:56:12'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:56:15'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:56:18'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:56:21'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:56:24'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:56:27'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:56:30'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:56:33'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:56:36'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:56:39'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:56:42'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:56:45'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:56:48'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:56:51'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:56:54'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:56:57'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:57:01'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:57:04'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:57:07'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:57:10'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:57:13'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:57:16'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:57:19'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:57:22'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:57:25'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:57:28'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:57:31'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:57:34'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:57:40'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:57:43'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:57:46'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:57:49'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:57:54'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:57:57'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:58:00'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:58:03'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:58:06'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:58:09'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:58:12'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:58:15'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:58:18'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:58:21'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:58:24'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:58:27'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:58:30'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:58:33'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:58:36'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:58:39'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:58:42'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:58:45'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:58:48'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:58:51'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:58:54'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:58:57'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:59:00'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:59:03'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:59:06'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:59:09'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:59:12'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:59:15'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:59:18'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:59:21'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:59:24'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:59:27'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:59:30'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:59:33'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:59:36'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:59:39'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:59:42'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:59:45'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:59:48'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:59:51'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:59:54'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-26 23:59:57'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:00:00'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:00:03'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:00:06'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:00:09'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:00:12'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:00:15'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:00:18'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:00:21'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:00:24'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:00:27'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:00:30'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:00:33'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:00:36'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:00:39'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:00:42'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:00:45'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:00:48'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:00:51'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:00:54'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:00:57'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:01:00'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:01:03'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:01:06'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:01:09'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:01:12'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:01:15'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:01:18'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:01:21'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:01:24'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:01:27'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:01:30'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:01:33'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:01:36'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:01:39'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:01:42'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:01:45'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:01:48'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:01:51'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:01:54'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:01:57'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:02:00'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:02:03'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:02:06'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:02:09'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:02:12'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:02:15'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:02:18'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:02:22'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:02:24'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:02:27'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:02:30'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:02:33'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:02:36'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:02:39'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:02:42'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:02:45'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:02:48'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:02:51'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:02:54'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:02:57'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:03:00'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:03:03'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:03:06');
INSERT INTO `payment_audit_log` (`id`, `session_id`, `event_type`, `event_data`, `ip_address`, `user_agent`, `pesapal_order_tracking_id`, `pesapal_merchant_reference`, `created_at`) VALUES
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:03:09'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:03:12'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:03:15'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:03:18'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:03:21'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:03:24'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:03:27'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:03:30'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:03:33'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:03:36'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:03:39'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:03:42'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:03:45'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:03:48'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:03:51'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:03:54'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:03:57'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:04:00'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:04:03'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:04:06'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:04:09'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:04:12'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:04:15'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:04:18'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:04:21'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:04:24'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:04:27'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:04:30'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:04:33'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:04:36'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:04:39'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:04:42'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:04:45'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:04:48'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:04:51'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:04:54'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:04:57'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:05:00'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:05:03'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:05:06'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:05:09'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:05:12'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:05:15'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:05:18'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:05:21'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:05:24'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:05:27'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:05:30'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:05:33'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:05:36'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:05:40'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:05:42'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:05:45'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:05:48'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:05:51'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:05:54'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:05:57'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:06:00'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:06:03'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:06:06'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:06:09'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:06:12'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:06:15'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:06:18'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:06:21'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:06:24'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:06:27'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:06:30'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:06:33'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:06:36'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:06:39'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:06:42'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:06:45'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:06:48'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:06:51'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:06:54'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:06:57'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:07:00'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:07:04'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:07:06'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:07:09'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:07:12'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:07:15'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:07:18'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:07:21'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:07:24'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:07:27'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:07:30'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:07:33'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:07:36'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:07:39'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:07:43'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:07:45'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:07:48'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:07:51'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:07:54'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:07:57'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:08:00'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:08:03'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:08:06'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:08:09'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:08:12'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:08:15'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:08:18'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '29989591-7848-4223-bf67-da36c21b24b7', 'SES076-99b2e5b2bc1a8146', '2026-06-27 00:08:22'),
(0, 76, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES076-7ce38a921d3d2c98\",\"order_tracking_id\":\"c8cd2ba6-54fc-4a3c-a946-da365ea23c9e\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:08:31'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:08:44'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:08:47'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:08:50'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:08:53'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:08:56'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:09:01'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:09:04'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:09:07'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:09:10'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:09:13'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:09:16'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:09:19'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:09:22'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:09:25'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:09:28'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:09:31'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:09:34'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:09:37'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:09:40'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:09:43'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:09:46'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:09:49'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c8cd2ba6-54fc-4a3c-a946-da365ea23c9e', 'SES076-7ce38a921d3d2c98', '2026-06-27 00:09:52'),
(0, 76, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES076-2b8820c913db8dc4\",\"order_tracking_id\":\"3a38b3e4-e94c-40b8-8adf-da362bc5f810\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '3a38b3e4-e94c-40b8-8adf-da362bc5f810', 'SES076-2b8820c913db8dc4', '2026-06-27 00:09:59'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '3a38b3e4-e94c-40b8-8adf-da362bc5f810', 'SES076-2b8820c913db8dc4', '2026-06-27 00:10:10'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '3a38b3e4-e94c-40b8-8adf-da362bc5f810', 'SES076-2b8820c913db8dc4', '2026-06-27 00:10:13'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '3a38b3e4-e94c-40b8-8adf-da362bc5f810', 'SES076-2b8820c913db8dc4', '2026-06-27 00:10:16'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '3a38b3e4-e94c-40b8-8adf-da362bc5f810', 'SES076-2b8820c913db8dc4', '2026-06-27 00:10:19'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '3a38b3e4-e94c-40b8-8adf-da362bc5f810', 'SES076-2b8820c913db8dc4', '2026-06-27 00:10:22'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '3a38b3e4-e94c-40b8-8adf-da362bc5f810', 'SES076-2b8820c913db8dc4', '2026-06-27 00:10:27'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '3a38b3e4-e94c-40b8-8adf-da362bc5f810', 'SES076-2b8820c913db8dc4', '2026-06-27 00:10:30'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '3a38b3e4-e94c-40b8-8adf-da362bc5f810', 'SES076-2b8820c913db8dc4', '2026-06-27 00:10:33'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '3a38b3e4-e94c-40b8-8adf-da362bc5f810', 'SES076-2b8820c913db8dc4', '2026-06-27 00:10:36'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '3a38b3e4-e94c-40b8-8adf-da362bc5f810', 'SES076-2b8820c913db8dc4', '2026-06-27 00:10:39'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '3a38b3e4-e94c-40b8-8adf-da362bc5f810', 'SES076-2b8820c913db8dc4', '2026-06-27 00:10:42'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '3a38b3e4-e94c-40b8-8adf-da362bc5f810', 'SES076-2b8820c913db8dc4', '2026-06-27 00:10:45'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '3a38b3e4-e94c-40b8-8adf-da362bc5f810', 'SES076-2b8820c913db8dc4', '2026-06-27 00:10:48'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '3a38b3e4-e94c-40b8-8adf-da362bc5f810', 'SES076-2b8820c913db8dc4', '2026-06-27 00:10:51'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '3a38b3e4-e94c-40b8-8adf-da362bc5f810', 'SES076-2b8820c913db8dc4', '2026-06-27 00:10:54'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '3a38b3e4-e94c-40b8-8adf-da362bc5f810', 'SES076-2b8820c913db8dc4', '2026-06-27 00:11:00'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '3a38b3e4-e94c-40b8-8adf-da362bc5f810', 'SES076-2b8820c913db8dc4', '2026-06-27 00:11:03'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '3a38b3e4-e94c-40b8-8adf-da362bc5f810', 'SES076-2b8820c913db8dc4', '2026-06-27 00:11:06'),
(0, 76, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES076-0390128869347d79\",\"order_tracking_id\":\"8318a92c-3539-4402-b43f-da361f483ce4\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8318a92c-3539-4402-b43f-da361f483ce4', 'SES076-0390128869347d79', '2026-06-27 00:11:20'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8318a92c-3539-4402-b43f-da361f483ce4', 'SES076-0390128869347d79', '2026-06-27 00:11:32'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8318a92c-3539-4402-b43f-da361f483ce4', 'SES076-0390128869347d79', '2026-06-27 00:11:35'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8318a92c-3539-4402-b43f-da361f483ce4', 'SES076-0390128869347d79', '2026-06-27 00:11:38'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8318a92c-3539-4402-b43f-da361f483ce4', 'SES076-0390128869347d79', '2026-06-27 00:11:41'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8318a92c-3539-4402-b43f-da361f483ce4', 'SES076-0390128869347d79', '2026-06-27 00:11:44'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8318a92c-3539-4402-b43f-da361f483ce4', 'SES076-0390128869347d79', '2026-06-27 00:11:49'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8318a92c-3539-4402-b43f-da361f483ce4', 'SES076-0390128869347d79', '2026-06-27 00:11:52'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8318a92c-3539-4402-b43f-da361f483ce4', 'SES076-0390128869347d79', '2026-06-27 00:11:55'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8318a92c-3539-4402-b43f-da361f483ce4', 'SES076-0390128869347d79', '2026-06-27 00:11:58'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8318a92c-3539-4402-b43f-da361f483ce4', 'SES076-0390128869347d79', '2026-06-27 00:12:01'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8318a92c-3539-4402-b43f-da361f483ce4', 'SES076-0390128869347d79', '2026-06-27 00:12:04'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8318a92c-3539-4402-b43f-da361f483ce4', 'SES076-0390128869347d79', '2026-06-27 00:12:07'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8318a92c-3539-4402-b43f-da361f483ce4', 'SES076-0390128869347d79', '2026-06-27 00:12:10'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8318a92c-3539-4402-b43f-da361f483ce4', 'SES076-0390128869347d79', '2026-06-27 00:12:13'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8318a92c-3539-4402-b43f-da361f483ce4', 'SES076-0390128869347d79', '2026-06-27 00:12:16'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8318a92c-3539-4402-b43f-da361f483ce4', 'SES076-0390128869347d79', '2026-06-27 00:12:19'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8318a92c-3539-4402-b43f-da361f483ce4', 'SES076-0390128869347d79', '2026-06-27 00:12:22'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8318a92c-3539-4402-b43f-da361f483ce4', 'SES076-0390128869347d79', '2026-06-27 00:12:25'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8318a92c-3539-4402-b43f-da361f483ce4', 'SES076-0390128869347d79', '2026-06-27 00:12:28');
INSERT INTO `payment_audit_log` (`id`, `session_id`, `event_type`, `event_data`, `ip_address`, `user_agent`, `pesapal_order_tracking_id`, `pesapal_merchant_reference`, `created_at`) VALUES
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8318a92c-3539-4402-b43f-da361f483ce4', 'SES076-0390128869347d79', '2026-06-27 00:12:31'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8318a92c-3539-4402-b43f-da361f483ce4', 'SES076-0390128869347d79', '2026-06-27 00:12:37'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8318a92c-3539-4402-b43f-da361f483ce4', 'SES076-0390128869347d79', '2026-06-27 00:12:40'),
(0, 75, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":400,\"merchant_reference\":\"SES075-3cc291c8d029cfa6\",\"order_tracking_id\":\"a7d23b27-64dd-488a-aed2-da36ac703dca\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'a7d23b27-64dd-488a-aed2-da36ac703dca', 'SES075-3cc291c8d029cfa6', '2026-06-27 00:12:53'),
(0, 75, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'a7d23b27-64dd-488a-aed2-da36ac703dca', 'SES075-3cc291c8d029cfa6', '2026-06-27 00:13:06'),
(0, 75, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'a7d23b27-64dd-488a-aed2-da36ac703dca', 'SES075-3cc291c8d029cfa6', '2026-06-27 00:13:08'),
(0, 75, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'a7d23b27-64dd-488a-aed2-da36ac703dca', 'SES075-3cc291c8d029cfa6', '2026-06-27 00:13:12'),
(0, 75, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'a7d23b27-64dd-488a-aed2-da36ac703dca', 'SES075-3cc291c8d029cfa6', '2026-06-27 00:13:14'),
(0, 75, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'a7d23b27-64dd-488a-aed2-da36ac703dca', 'SES075-3cc291c8d029cfa6', '2026-06-27 00:13:17'),
(0, 76, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES076-f7f0a82ff3a6ca1e\",\"order_tracking_id\":\"db1fd173-a2b3-4480-becc-da361fc70ccf\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'db1fd173-a2b3-4480-becc-da361fc70ccf', 'SES076-f7f0a82ff3a6ca1e', '2026-06-27 00:13:29'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'db1fd173-a2b3-4480-becc-da361fc70ccf', 'SES076-f7f0a82ff3a6ca1e', '2026-06-27 00:13:40'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'db1fd173-a2b3-4480-becc-da361fc70ccf', 'SES076-f7f0a82ff3a6ca1e', '2026-06-27 00:13:43'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'db1fd173-a2b3-4480-becc-da361fc70ccf', 'SES076-f7f0a82ff3a6ca1e', '2026-06-27 00:13:46'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'db1fd173-a2b3-4480-becc-da361fc70ccf', 'SES076-f7f0a82ff3a6ca1e', '2026-06-27 00:13:49'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'db1fd173-a2b3-4480-becc-da361fc70ccf', 'SES076-f7f0a82ff3a6ca1e', '2026-06-27 00:13:55'),
(0, 76, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'db1fd173-a2b3-4480-becc-da361fc70ccf', 'SES076-f7f0a82ff3a6ca1e', '2026-06-27 00:13:58'),
(0, 77, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES077-7e3471ccaa7925a4\",\"order_tracking_id\":\"86741bbe-bc1a-4fbc-b881-da36867e63be\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '86741bbe-bc1a-4fbc-b881-da36867e63be', 'SES077-7e3471ccaa7925a4', '2026-06-27 00:14:51'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '86741bbe-bc1a-4fbc-b881-da36867e63be', 'SES077-7e3471ccaa7925a4', '2026-06-27 00:15:04'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '86741bbe-bc1a-4fbc-b881-da36867e63be', 'SES077-7e3471ccaa7925a4', '2026-06-27 00:15:06'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '86741bbe-bc1a-4fbc-b881-da36867e63be', 'SES077-7e3471ccaa7925a4', '2026-06-27 00:15:10'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '86741bbe-bc1a-4fbc-b881-da36867e63be', 'SES077-7e3471ccaa7925a4', '2026-06-27 00:15:13'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '86741bbe-bc1a-4fbc-b881-da36867e63be', 'SES077-7e3471ccaa7925a4', '2026-06-27 00:15:16'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '86741bbe-bc1a-4fbc-b881-da36867e63be', 'SES077-7e3471ccaa7925a4', '2026-06-27 00:15:19'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '86741bbe-bc1a-4fbc-b881-da36867e63be', 'SES077-7e3471ccaa7925a4', '2026-06-27 00:15:22'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '86741bbe-bc1a-4fbc-b881-da36867e63be', 'SES077-7e3471ccaa7925a4', '2026-06-27 00:15:25'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '86741bbe-bc1a-4fbc-b881-da36867e63be', 'SES077-7e3471ccaa7925a4', '2026-06-27 00:15:28'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '86741bbe-bc1a-4fbc-b881-da36867e63be', 'SES077-7e3471ccaa7925a4', '2026-06-27 00:15:31'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '86741bbe-bc1a-4fbc-b881-da36867e63be', 'SES077-7e3471ccaa7925a4', '2026-06-27 00:15:34'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '86741bbe-bc1a-4fbc-b881-da36867e63be', 'SES077-7e3471ccaa7925a4', '2026-06-27 00:15:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '86741bbe-bc1a-4fbc-b881-da36867e63be', 'SES077-7e3471ccaa7925a4', '2026-06-27 00:15:40'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '86741bbe-bc1a-4fbc-b881-da36867e63be', 'SES077-7e3471ccaa7925a4', '2026-06-27 00:15:43'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '86741bbe-bc1a-4fbc-b881-da36867e63be', 'SES077-7e3471ccaa7925a4', '2026-06-27 00:15:46'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '86741bbe-bc1a-4fbc-b881-da36867e63be', 'SES077-7e3471ccaa7925a4', '2026-06-27 00:15:49'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '86741bbe-bc1a-4fbc-b881-da36867e63be', 'SES077-7e3471ccaa7925a4', '2026-06-27 00:15:52'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '86741bbe-bc1a-4fbc-b881-da36867e63be', 'SES077-7e3471ccaa7925a4', '2026-06-27 00:15:55'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '86741bbe-bc1a-4fbc-b881-da36867e63be', 'SES077-7e3471ccaa7925a4', '2026-06-27 00:15:58'),
(0, 77, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES077-db476313a5e10207\",\"order_tracking_id\":\"d9f25375-50c8-4a15-b9e1-da3645127e25\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:43:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:43:51'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:43:54'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:43:57'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:44:00'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:44:03'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:44:08'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:44:11'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:44:14'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:44:17'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:44:20'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:44:23'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:44:26'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:44:29'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:44:32'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:44:35'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:44:38'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:44:41'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:44:44'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:44:47'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:44:50'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:44:53'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:44:56'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:44:59'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:45:02'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:45:05'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:45:08'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:45:11'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:45:14'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:45:17'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:45:20'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:45:23'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:45:26'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:45:29'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:45:32'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:45:35'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:45:38'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:45:41'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:45:44'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:45:47'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:45:50'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:45:53'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:45:56'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:45:59'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:46:02'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:46:05'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:46:08'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:46:11'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:46:14'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:46:17'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:46:20'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:46:23'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:46:26'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd9f25375-50c8-4a15-b9e1-da3645127e25', 'SES077-db476313a5e10207', '2026-06-27 07:46:29'),
(0, 77, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES077-f6f5e904d2ad68df\",\"order_tracking_id\":\"ca75459b-7447-4c8a-a48c-da365ba5829f\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ca75459b-7447-4c8a-a48c-da365ba5829f', 'SES077-f6f5e904d2ad68df', '2026-06-27 07:46:39'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ca75459b-7447-4c8a-a48c-da365ba5829f', 'SES077-f6f5e904d2ad68df', '2026-06-27 07:46:47'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ca75459b-7447-4c8a-a48c-da365ba5829f', 'SES077-f6f5e904d2ad68df', '2026-06-27 07:46:50'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ca75459b-7447-4c8a-a48c-da365ba5829f', 'SES077-f6f5e904d2ad68df', '2026-06-27 07:46:53'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ca75459b-7447-4c8a-a48c-da365ba5829f', 'SES077-f6f5e904d2ad68df', '2026-06-27 07:46:59'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ca75459b-7447-4c8a-a48c-da365ba5829f', 'SES077-f6f5e904d2ad68df', '2026-06-27 07:47:02'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ca75459b-7447-4c8a-a48c-da365ba5829f', 'SES077-f6f5e904d2ad68df', '2026-06-27 07:47:05'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ca75459b-7447-4c8a-a48c-da365ba5829f', 'SES077-f6f5e904d2ad68df', '2026-06-27 07:47:08'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ca75459b-7447-4c8a-a48c-da365ba5829f', 'SES077-f6f5e904d2ad68df', '2026-06-27 07:47:11'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ca75459b-7447-4c8a-a48c-da365ba5829f', 'SES077-f6f5e904d2ad68df', '2026-06-27 07:47:14'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ca75459b-7447-4c8a-a48c-da365ba5829f', 'SES077-f6f5e904d2ad68df', '2026-06-27 07:47:17'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ca75459b-7447-4c8a-a48c-da365ba5829f', 'SES077-f6f5e904d2ad68df', '2026-06-27 07:47:20'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ca75459b-7447-4c8a-a48c-da365ba5829f', 'SES077-f6f5e904d2ad68df', '2026-06-27 07:47:25'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ca75459b-7447-4c8a-a48c-da365ba5829f', 'SES077-f6f5e904d2ad68df', '2026-06-27 07:47:28'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ca75459b-7447-4c8a-a48c-da365ba5829f', 'SES077-f6f5e904d2ad68df', '2026-06-27 07:47:31'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ca75459b-7447-4c8a-a48c-da365ba5829f', 'SES077-f6f5e904d2ad68df', '2026-06-27 07:47:34'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ca75459b-7447-4c8a-a48c-da365ba5829f', 'SES077-f6f5e904d2ad68df', '2026-06-27 07:47:37'),
(0, 77, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES077-ad0370e487fca67e\",\"order_tracking_id\":\"ef4b2e7f-3cf5-4974-a6cf-da36060c7c19\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:00:34'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:00:46'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:00:49'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:00:52'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:00:55'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:00:58'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:01:01'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:01:04'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:01:07'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:01:10'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:01:13'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:01:16'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:01:19'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:01:22'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:01:25'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:01:28'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:01:31'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:01:34'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:01:38'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:01:40'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:02:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:03:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:04:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:05:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:06:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:07:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:08:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:09:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:10:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:11:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:12:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:13:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:14:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:15:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:16:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:17:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:18:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:19:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:20:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:21:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:22:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:23:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:24:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:25:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:26:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:27:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:28:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:29:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:30:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:31:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:32:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:33:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:34:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:35:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:36:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:37:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:38:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:39:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:40:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:41:37');
INSERT INTO `payment_audit_log` (`id`, `session_id`, `event_type`, `event_data`, `ip_address`, `user_agent`, `pesapal_order_tracking_id`, `pesapal_merchant_reference`, `created_at`) VALUES
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:42:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:43:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:44:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:45:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:46:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:47:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:48:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:49:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:50:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:51:36'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:52:36'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:53:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:54:36'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:55:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:56:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:57:36'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:58:39'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 08:59:40'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 09:00:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 09:01:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 09:02:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 09:03:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 09:04:36'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 09:04:56'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'ef4b2e7f-3cf5-4974-a6cf-da36060c7c19', 'SES077-ad0370e487fca67e', '2026-06-27 09:04:58'),
(0, 77, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES077-08fe211b2aef0c12\",\"order_tracking_id\":\"758079fc-cd18-42ae-ac89-da367720252a\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '758079fc-cd18-42ae-ac89-da367720252a', 'SES077-08fe211b2aef0c12', '2026-06-27 09:14:49'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '758079fc-cd18-42ae-ac89-da367720252a', 'SES077-08fe211b2aef0c12', '2026-06-27 09:15:00'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '758079fc-cd18-42ae-ac89-da367720252a', 'SES077-08fe211b2aef0c12', '2026-06-27 09:15:03'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '758079fc-cd18-42ae-ac89-da367720252a', 'SES077-08fe211b2aef0c12', '2026-06-27 09:15:06'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '758079fc-cd18-42ae-ac89-da367720252a', 'SES077-08fe211b2aef0c12', '2026-06-27 09:15:09'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '758079fc-cd18-42ae-ac89-da367720252a', 'SES077-08fe211b2aef0c12', '2026-06-27 09:15:12'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '758079fc-cd18-42ae-ac89-da367720252a', 'SES077-08fe211b2aef0c12', '2026-06-27 09:15:15'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '758079fc-cd18-42ae-ac89-da367720252a', 'SES077-08fe211b2aef0c12', '2026-06-27 09:15:18'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '758079fc-cd18-42ae-ac89-da367720252a', 'SES077-08fe211b2aef0c12', '2026-06-27 09:15:21'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '758079fc-cd18-42ae-ac89-da367720252a', 'SES077-08fe211b2aef0c12', '2026-06-27 09:15:24'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '758079fc-cd18-42ae-ac89-da367720252a', 'SES077-08fe211b2aef0c12', '2026-06-27 09:15:28'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '758079fc-cd18-42ae-ac89-da367720252a', 'SES077-08fe211b2aef0c12', '2026-06-27 09:15:31'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '758079fc-cd18-42ae-ac89-da367720252a', 'SES077-08fe211b2aef0c12', '2026-06-27 09:15:34'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '758079fc-cd18-42ae-ac89-da367720252a', 'SES077-08fe211b2aef0c12', '2026-06-27 09:15:37'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '758079fc-cd18-42ae-ac89-da367720252a', 'SES077-08fe211b2aef0c12', '2026-06-27 09:15:40'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '758079fc-cd18-42ae-ac89-da367720252a', 'SES077-08fe211b2aef0c12', '2026-06-27 09:15:43'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '758079fc-cd18-42ae-ac89-da367720252a', 'SES077-08fe211b2aef0c12', '2026-06-27 09:15:46'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '758079fc-cd18-42ae-ac89-da367720252a', 'SES077-08fe211b2aef0c12', '2026-06-27 09:15:51'),
(0, 77, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES077-50b8fa293c52b400\",\"order_tracking_id\":\"802d579f-1961-4060-9746-da364416daa9\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '802d579f-1961-4060-9746-da364416daa9', 'SES077-50b8fa293c52b400', '2026-06-27 09:17:40'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '802d579f-1961-4060-9746-da364416daa9', 'SES077-50b8fa293c52b400', '2026-06-27 09:17:55'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '802d579f-1961-4060-9746-da364416daa9', 'SES077-50b8fa293c52b400', '2026-06-27 09:17:58'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '802d579f-1961-4060-9746-da364416daa9', 'SES077-50b8fa293c52b400', '2026-06-27 09:18:01'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '802d579f-1961-4060-9746-da364416daa9', 'SES077-50b8fa293c52b400', '2026-06-27 09:18:04'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '802d579f-1961-4060-9746-da364416daa9', 'SES077-50b8fa293c52b400', '2026-06-27 09:18:07'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '802d579f-1961-4060-9746-da364416daa9', 'SES077-50b8fa293c52b400', '2026-06-27 09:18:10'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '802d579f-1961-4060-9746-da364416daa9', 'SES077-50b8fa293c52b400', '2026-06-27 09:18:13'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '802d579f-1961-4060-9746-da364416daa9', 'SES077-50b8fa293c52b400', '2026-06-27 09:18:17'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '802d579f-1961-4060-9746-da364416daa9', 'SES077-50b8fa293c52b400', '2026-06-27 09:18:20'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '802d579f-1961-4060-9746-da364416daa9', 'SES077-50b8fa293c52b400', '2026-06-27 09:18:23'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '802d579f-1961-4060-9746-da364416daa9', 'SES077-50b8fa293c52b400', '2026-06-27 09:18:26'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '802d579f-1961-4060-9746-da364416daa9', 'SES077-50b8fa293c52b400', '2026-06-27 09:18:29'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '802d579f-1961-4060-9746-da364416daa9', 'SES077-50b8fa293c52b400', '2026-06-27 09:18:32'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '802d579f-1961-4060-9746-da364416daa9', 'SES077-50b8fa293c52b400', '2026-06-27 09:18:35'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '802d579f-1961-4060-9746-da364416daa9', 'SES077-50b8fa293c52b400', '2026-06-27 09:18:38'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '802d579f-1961-4060-9746-da364416daa9', 'SES077-50b8fa293c52b400', '2026-06-27 09:18:41'),
(0, 77, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '802d579f-1961-4060-9746-da364416daa9', 'SES077-50b8fa293c52b400', '2026-06-27 09:18:44'),
(0, 78, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES078-3dca63fe91318fee\",\"order_tracking_id\":\"bfe492e4-5cbd-4e84-baf4-da3691088526\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bfe492e4-5cbd-4e84-baf4-da3691088526', 'SES078-3dca63fe91318fee', '2026-06-27 09:20:10'),
(0, 78, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bfe492e4-5cbd-4e84-baf4-da3691088526', 'SES078-3dca63fe91318fee', '2026-06-27 09:20:24'),
(0, 78, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bfe492e4-5cbd-4e84-baf4-da3691088526', 'SES078-3dca63fe91318fee', '2026-06-27 09:20:27'),
(0, 78, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bfe492e4-5cbd-4e84-baf4-da3691088526', 'SES078-3dca63fe91318fee', '2026-06-27 09:20:30'),
(0, 78, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bfe492e4-5cbd-4e84-baf4-da3691088526', 'SES078-3dca63fe91318fee', '2026-06-27 09:20:33'),
(0, 78, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bfe492e4-5cbd-4e84-baf4-da3691088526', 'SES078-3dca63fe91318fee', '2026-06-27 09:20:36'),
(0, 78, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bfe492e4-5cbd-4e84-baf4-da3691088526', 'SES078-3dca63fe91318fee', '2026-06-27 09:20:40'),
(0, 78, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bfe492e4-5cbd-4e84-baf4-da3691088526', 'SES078-3dca63fe91318fee', '2026-06-27 09:20:43'),
(0, 78, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bfe492e4-5cbd-4e84-baf4-da3691088526', 'SES078-3dca63fe91318fee', '2026-06-27 09:20:46'),
(0, 78, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bfe492e4-5cbd-4e84-baf4-da3691088526', 'SES078-3dca63fe91318fee', '2026-06-27 09:20:49'),
(0, 78, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bfe492e4-5cbd-4e84-baf4-da3691088526', 'SES078-3dca63fe91318fee', '2026-06-27 09:20:52'),
(0, 78, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bfe492e4-5cbd-4e84-baf4-da3691088526', 'SES078-3dca63fe91318fee', '2026-06-27 09:20:57'),
(0, 78, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bfe492e4-5cbd-4e84-baf4-da3691088526', 'SES078-3dca63fe91318fee', '2026-06-27 09:21:00'),
(0, 78, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'bfe492e4-5cbd-4e84-baf4-da3691088526', 'SES078-3dca63fe91318fee', '2026-06-27 09:21:03'),
(0, 79, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES079-935d6c040dd25da0\",\"order_tracking_id\":\"a47e895a-eda4-43bb-bc7a-da3633f77b4d\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'a47e895a-eda4-43bb-bc7a-da3633f77b4d', 'SES079-935d6c040dd25da0', '2026-06-27 11:06:39'),
(0, 79, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'a47e895a-eda4-43bb-bc7a-da3633f77b4d', 'SES079-935d6c040dd25da0', '2026-06-27 11:06:48'),
(0, 79, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'a47e895a-eda4-43bb-bc7a-da3633f77b4d', 'SES079-935d6c040dd25da0', '2026-06-27 11:06:51'),
(0, 79, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'a47e895a-eda4-43bb-bc7a-da3633f77b4d', 'SES079-935d6c040dd25da0', '2026-06-27 11:06:54'),
(0, 79, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'a47e895a-eda4-43bb-bc7a-da3633f77b4d', 'SES079-935d6c040dd25da0', '2026-06-27 11:06:58'),
(0, 79, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'a47e895a-eda4-43bb-bc7a-da3633f77b4d', 'SES079-935d6c040dd25da0', '2026-06-27 11:07:00'),
(0, 79, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'a47e895a-eda4-43bb-bc7a-da3633f77b4d', 'SES079-935d6c040dd25da0', '2026-06-27 11:07:04'),
(0, 79, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'a47e895a-eda4-43bb-bc7a-da3633f77b4d', 'SES079-935d6c040dd25da0', '2026-06-27 11:07:07'),
(0, 79, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'a47e895a-eda4-43bb-bc7a-da3633f77b4d', 'SES079-935d6c040dd25da0', '2026-06-27 11:07:10'),
(0, 79, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'a47e895a-eda4-43bb-bc7a-da3633f77b4d', 'SES079-935d6c040dd25da0', '2026-06-27 11:07:16'),
(0, 79, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'a47e895a-eda4-43bb-bc7a-da3633f77b4d', 'SES079-935d6c040dd25da0', '2026-06-27 11:07:19'),
(0, 79, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'a47e895a-eda4-43bb-bc7a-da3633f77b4d', 'SES079-935d6c040dd25da0', '2026-06-27 11:07:22'),
(0, 80, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES080-ee986918282375c4\",\"order_tracking_id\":\"d407ed73-a7d2-4586-8425-da362e9020c2\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd407ed73-a7d2-4586-8425-da362e9020c2', 'SES080-ee986918282375c4', '2026-06-27 11:23:57'),
(0, 80, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd407ed73-a7d2-4586-8425-da362e9020c2', 'SES080-ee986918282375c4', '2026-06-27 11:24:07'),
(0, 80, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd407ed73-a7d2-4586-8425-da362e9020c2', 'SES080-ee986918282375c4', '2026-06-27 11:24:10'),
(0, 80, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd407ed73-a7d2-4586-8425-da362e9020c2', 'SES080-ee986918282375c4', '2026-06-27 11:24:13'),
(0, 80, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd407ed73-a7d2-4586-8425-da362e9020c2', 'SES080-ee986918282375c4', '2026-06-27 11:24:16'),
(0, 80, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd407ed73-a7d2-4586-8425-da362e9020c2', 'SES080-ee986918282375c4', '2026-06-27 11:24:19'),
(0, 80, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd407ed73-a7d2-4586-8425-da362e9020c2', 'SES080-ee986918282375c4', '2026-06-27 11:24:22'),
(0, 80, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd407ed73-a7d2-4586-8425-da362e9020c2', 'SES080-ee986918282375c4', '2026-06-27 11:24:27'),
(0, 80, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd407ed73-a7d2-4586-8425-da362e9020c2', 'SES080-ee986918282375c4', '2026-06-27 11:24:30'),
(0, 80, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd407ed73-a7d2-4586-8425-da362e9020c2', 'SES080-ee986918282375c4', '2026-06-27 11:24:35'),
(0, 80, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd407ed73-a7d2-4586-8425-da362e9020c2', 'SES080-ee986918282375c4', '2026-06-27 11:24:38'),
(0, 80, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd407ed73-a7d2-4586-8425-da362e9020c2', 'SES080-ee986918282375c4', '2026-06-27 11:24:41'),
(0, 80, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'd407ed73-a7d2-4586-8425-da362e9020c2', 'SES080-ee986918282375c4', '2026-06-27 11:24:44'),
(0, 81, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES081-c000354ed13bb6c6\",\"order_tracking_id\":\"353489ae-ae41-48e8-ac60-da362f37b775\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:35:19'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:35:28'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:35:31'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:35:34'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:35:37'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:35:42'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:35:45'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:35:48'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:35:51'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:35:54'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:35:57'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:36:00'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:36:03'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:36:06'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:36:09'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:36:12'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:36:16'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:36:18'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:36:21'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:36:24'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:36:28'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:36:31'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:36:34'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:36:37'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:36:40'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:36:43'),
(0, 81, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '353489ae-ae41-48e8-ac60-da362f37b775', 'SES081-c000354ed13bb6c6', '2026-06-27 11:36:46'),
(0, 82, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES082-7565168f09d3bf92\",\"order_tracking_id\":\"c1a10685-746c-4623-b778-da36ece32762\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c1a10685-746c-4623-b778-da36ece32762', 'SES082-7565168f09d3bf92', '2026-06-27 11:50:24'),
(0, 82, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c1a10685-746c-4623-b778-da36ece32762', 'SES082-7565168f09d3bf92', '2026-06-27 11:50:35'),
(0, 82, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c1a10685-746c-4623-b778-da36ece32762', 'SES082-7565168f09d3bf92', '2026-06-27 11:50:38'),
(0, 82, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c1a10685-746c-4623-b778-da36ece32762', 'SES082-7565168f09d3bf92', '2026-06-27 11:50:41'),
(0, 82, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c1a10685-746c-4623-b778-da36ece32762', 'SES082-7565168f09d3bf92', '2026-06-27 11:50:44'),
(0, 82, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c1a10685-746c-4623-b778-da36ece32762', 'SES082-7565168f09d3bf92', '2026-06-27 11:50:47'),
(0, 82, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c1a10685-746c-4623-b778-da36ece32762', 'SES082-7565168f09d3bf92', '2026-06-27 11:50:52'),
(0, 82, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c1a10685-746c-4623-b778-da36ece32762', 'SES082-7565168f09d3bf92', '2026-06-27 11:50:55'),
(0, 82, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c1a10685-746c-4623-b778-da36ece32762', 'SES082-7565168f09d3bf92', '2026-06-27 11:50:58'),
(0, 82, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c1a10685-746c-4623-b778-da36ece32762', 'SES082-7565168f09d3bf92', '2026-06-27 11:51:04'),
(0, 82, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c1a10685-746c-4623-b778-da36ece32762', 'SES082-7565168f09d3bf92', '2026-06-27 11:51:07'),
(0, 82, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c1a10685-746c-4623-b778-da36ece32762', 'SES082-7565168f09d3bf92', '2026-06-27 11:51:11'),
(0, 82, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'c1a10685-746c-4623-b778-da36ece32762', 'SES082-7565168f09d3bf92', '2026-06-27 11:51:13'),
(0, 83, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES083-37e0fb2591dec168\",\"order_tracking_id\":\"1826ff78-f74f-485c-a17e-da36a7966d01\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1826ff78-f74f-485c-a17e-da36a7966d01', 'SES083-37e0fb2591dec168', '2026-06-27 12:09:31'),
(0, 83, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1826ff78-f74f-485c-a17e-da36a7966d01', 'SES083-37e0fb2591dec168', '2026-06-27 12:09:41'),
(0, 83, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1826ff78-f74f-485c-a17e-da36a7966d01', 'SES083-37e0fb2591dec168', '2026-06-27 12:09:44'),
(0, 83, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1826ff78-f74f-485c-a17e-da36a7966d01', 'SES083-37e0fb2591dec168', '2026-06-27 12:09:47'),
(0, 83, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1826ff78-f74f-485c-a17e-da36a7966d01', 'SES083-37e0fb2591dec168', '2026-06-27 12:09:50'),
(0, 83, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1826ff78-f74f-485c-a17e-da36a7966d01', 'SES083-37e0fb2591dec168', '2026-06-27 12:09:55'),
(0, 83, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1826ff78-f74f-485c-a17e-da36a7966d01', 'SES083-37e0fb2591dec168', '2026-06-27 12:09:58'),
(0, 83, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1826ff78-f74f-485c-a17e-da36a7966d01', 'SES083-37e0fb2591dec168', '2026-06-27 12:10:01'),
(0, 83, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1826ff78-f74f-485c-a17e-da36a7966d01', 'SES083-37e0fb2591dec168', '2026-06-27 12:10:07'),
(0, 83, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1826ff78-f74f-485c-a17e-da36a7966d01', 'SES083-37e0fb2591dec168', '2026-06-27 12:10:10'),
(0, 83, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1826ff78-f74f-485c-a17e-da36a7966d01', 'SES083-37e0fb2591dec168', '2026-06-27 12:10:13'),
(0, 83, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '1826ff78-f74f-485c-a17e-da36a7966d01', 'SES083-37e0fb2591dec168', '2026-06-27 12:10:16'),
(0, 84, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES084-415fc7ba8b3c9c1f\",\"order_tracking_id\":\"8bf0813c-bfeb-4db6-910e-da364484f96b\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:11:48'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:11:56'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:11:59'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:12:02'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:12:05'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:12:08'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:12:11'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:12:14'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:12:17'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:12:20'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:12:23'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:12:26'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:12:29'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:12:32');
INSERT INTO `payment_audit_log` (`id`, `session_id`, `event_type`, `event_data`, `ip_address`, `user_agent`, `pesapal_order_tracking_id`, `pesapal_merchant_reference`, `created_at`) VALUES
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:12:35'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:12:38'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:12:41'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:12:44'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:12:47'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:12:50'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:12:53'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:12:56'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:12:59'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:13:02'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:13:05'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:13:08'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:13:11'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:13:14'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:13:17'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:13:20'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:13:23'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:13:26'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '8bf0813c-bfeb-4db6-910e-da364484f96b', 'SES084-415fc7ba8b3c9c1f', '2026-06-27 12:13:29'),
(0, 84, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES084-5a585c730c843850\",\"order_tracking_id\":\"87e6e99b-6da6-4c89-8576-da36449f934b\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '87e6e99b-6da6-4c89-8576-da36449f934b', 'SES084-5a585c730c843850', '2026-06-27 12:13:36'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '87e6e99b-6da6-4c89-8576-da36449f934b', 'SES084-5a585c730c843850', '2026-06-27 12:13:44'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '87e6e99b-6da6-4c89-8576-da36449f934b', 'SES084-5a585c730c843850', '2026-06-27 12:13:47'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '87e6e99b-6da6-4c89-8576-da36449f934b', 'SES084-5a585c730c843850', '2026-06-27 12:13:50'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '87e6e99b-6da6-4c89-8576-da36449f934b', 'SES084-5a585c730c843850', '2026-06-27 12:13:56'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '87e6e99b-6da6-4c89-8576-da36449f934b', 'SES084-5a585c730c843850', '2026-06-27 12:13:59'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '87e6e99b-6da6-4c89-8576-da36449f934b', 'SES084-5a585c730c843850', '2026-06-27 12:14:02'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '87e6e99b-6da6-4c89-8576-da36449f934b', 'SES084-5a585c730c843850', '2026-06-27 12:14:05'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '87e6e99b-6da6-4c89-8576-da36449f934b', 'SES084-5a585c730c843850', '2026-06-27 12:14:09'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '87e6e99b-6da6-4c89-8576-da36449f934b', 'SES084-5a585c730c843850', '2026-06-27 12:14:11'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '87e6e99b-6da6-4c89-8576-da36449f934b', 'SES084-5a585c730c843850', '2026-06-27 12:14:14'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '87e6e99b-6da6-4c89-8576-da36449f934b', 'SES084-5a585c730c843850', '2026-06-27 12:14:18'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '87e6e99b-6da6-4c89-8576-da36449f934b', 'SES084-5a585c730c843850', '2026-06-27 12:14:20'),
(0, 84, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '87e6e99b-6da6-4c89-8576-da36449f934b', 'SES084-5a585c730c843850', '2026-06-27 12:14:23'),
(0, 85, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES085-26d0f7355ca4cf6c\",\"order_tracking_id\":\"03fbfac8-053b-4b18-b46b-da360873bff9\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '03fbfac8-053b-4b18-b46b-da360873bff9', 'SES085-26d0f7355ca4cf6c', '2026-06-27 12:24:31'),
(0, 85, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '03fbfac8-053b-4b18-b46b-da360873bff9', 'SES085-26d0f7355ca4cf6c', '2026-06-27 12:24:41'),
(0, 85, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '03fbfac8-053b-4b18-b46b-da360873bff9', 'SES085-26d0f7355ca4cf6c', '2026-06-27 12:24:44'),
(0, 85, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '03fbfac8-053b-4b18-b46b-da360873bff9', 'SES085-26d0f7355ca4cf6c', '2026-06-27 12:24:47'),
(0, 85, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '03fbfac8-053b-4b18-b46b-da360873bff9', 'SES085-26d0f7355ca4cf6c', '2026-06-27 12:24:53'),
(0, 85, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '03fbfac8-053b-4b18-b46b-da360873bff9', 'SES085-26d0f7355ca4cf6c', '2026-06-27 12:24:56'),
(0, 85, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '03fbfac8-053b-4b18-b46b-da360873bff9', 'SES085-26d0f7355ca4cf6c', '2026-06-27 12:24:59'),
(0, 85, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '03fbfac8-053b-4b18-b46b-da360873bff9', 'SES085-26d0f7355ca4cf6c', '2026-06-27 12:25:05'),
(0, 85, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '03fbfac8-053b-4b18-b46b-da360873bff9', 'SES085-26d0f7355ca4cf6c', '2026-06-27 12:25:08'),
(0, 85, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '03fbfac8-053b-4b18-b46b-da360873bff9', 'SES085-26d0f7355ca4cf6c', '2026-06-27 12:25:11'),
(0, 85, 'confirmed_by_callback', '{\"order_tracking_id\":\"03fbfac8-053b-4b18-b46b-da360873bff9\",\"note\":\"Confirmed by callback redirect (API verification unavailable)\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '03fbfac8-053b-4b18-b46b-da360873bff9', 'SES085-26d0f7355ca4cf6c', '2026-06-27 12:25:12'),
(0, 86, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES086-35b024208d47a58d\",\"order_tracking_id\":\"76d15ee1-6930-48e3-984d-da366ccdcad9\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '76d15ee1-6930-48e3-984d-da366ccdcad9', 'SES086-35b024208d47a58d', '2026-06-27 13:40:08'),
(0, 86, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '76d15ee1-6930-48e3-984d-da366ccdcad9', 'SES086-35b024208d47a58d', '2026-06-27 13:40:19'),
(0, 86, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '76d15ee1-6930-48e3-984d-da366ccdcad9', 'SES086-35b024208d47a58d', '2026-06-27 13:40:22'),
(0, 86, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '76d15ee1-6930-48e3-984d-da366ccdcad9', 'SES086-35b024208d47a58d', '2026-06-27 13:40:25'),
(0, 86, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '76d15ee1-6930-48e3-984d-da366ccdcad9', 'SES086-35b024208d47a58d', '2026-06-27 13:40:28'),
(0, 86, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '76d15ee1-6930-48e3-984d-da366ccdcad9', 'SES086-35b024208d47a58d', '2026-06-27 13:40:31'),
(0, 86, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '76d15ee1-6930-48e3-984d-da366ccdcad9', 'SES086-35b024208d47a58d', '2026-06-27 13:40:36'),
(0, 86, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '76d15ee1-6930-48e3-984d-da366ccdcad9', 'SES086-35b024208d47a58d', '2026-06-27 13:40:39'),
(0, 86, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '76d15ee1-6930-48e3-984d-da366ccdcad9', 'SES086-35b024208d47a58d', '2026-06-27 13:40:42'),
(0, 86, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '76d15ee1-6930-48e3-984d-da366ccdcad9', 'SES086-35b024208d47a58d', '2026-06-27 13:40:48'),
(0, 86, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '76d15ee1-6930-48e3-984d-da366ccdcad9', 'SES086-35b024208d47a58d', '2026-06-27 13:40:51'),
(0, 86, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '76d15ee1-6930-48e3-984d-da366ccdcad9', 'SES086-35b024208d47a58d', '2026-06-27 13:40:54'),
(0, 86, 'confirmed_by_callback', '{\"order_tracking_id\":\"76d15ee1-6930-48e3-984d-da366ccdcad9\",\"note\":\"Confirmed by callback redirect (API verification unavailable)\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '76d15ee1-6930-48e3-984d-da366ccdcad9', 'SES086-35b024208d47a58d', '2026-06-27 13:40:56'),
(0, 87, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":5,\"merchant_reference\":\"SES087-aceb6f1544b3cb5e\",\"order_tracking_id\":\"0f3c37cd-0a78-4bf5-b48e-da36f81c6c3a\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0f3c37cd-0a78-4bf5-b48e-da36f81c6c3a', 'SES087-aceb6f1544b3cb5e', '2026-06-27 13:43:51'),
(0, 87, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0f3c37cd-0a78-4bf5-b48e-da36f81c6c3a', 'SES087-aceb6f1544b3cb5e', '2026-06-27 13:44:00'),
(0, 87, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0f3c37cd-0a78-4bf5-b48e-da36f81c6c3a', 'SES087-aceb6f1544b3cb5e', '2026-06-27 13:44:03'),
(0, 87, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0f3c37cd-0a78-4bf5-b48e-da36f81c6c3a', 'SES087-aceb6f1544b3cb5e', '2026-06-27 13:44:06'),
(0, 87, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0f3c37cd-0a78-4bf5-b48e-da36f81c6c3a', 'SES087-aceb6f1544b3cb5e', '2026-06-27 13:44:09'),
(0, 87, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0f3c37cd-0a78-4bf5-b48e-da36f81c6c3a', 'SES087-aceb6f1544b3cb5e', '2026-06-27 13:44:14'),
(0, 87, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0f3c37cd-0a78-4bf5-b48e-da36f81c6c3a', 'SES087-aceb6f1544b3cb5e', '2026-06-27 13:44:17'),
(0, 87, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0f3c37cd-0a78-4bf5-b48e-da36f81c6c3a', 'SES087-aceb6f1544b3cb5e', '2026-06-27 13:44:20'),
(0, 87, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0f3c37cd-0a78-4bf5-b48e-da36f81c6c3a', 'SES087-aceb6f1544b3cb5e', '2026-06-27 13:44:26'),
(0, 87, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0f3c37cd-0a78-4bf5-b48e-da36f81c6c3a', 'SES087-aceb6f1544b3cb5e', '2026-06-27 13:44:29'),
(0, 87, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0f3c37cd-0a78-4bf5-b48e-da36f81c6c3a', 'SES087-aceb6f1544b3cb5e', '2026-06-27 13:44:32'),
(0, 87, 'confirmed_by_callback', '{\"order_tracking_id\":\"0f3c37cd-0a78-4bf5-b48e-da36f81c6c3a\",\"note\":\"Confirmed by callback redirect (API verification unavailable)\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '0f3c37cd-0a78-4bf5-b48e-da36f81c6c3a', 'SES087-aceb6f1544b3cb5e', '2026-06-27 13:44:33'),
(0, 88, 'manual_payment', '{\"transaction_code\":\"test\",\"amount\":\"400.00\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', NULL, NULL, '2026-06-27 14:19:56'),
(0, 89, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":600,\"merchant_reference\":\"SES089-c8d8c6705df3d8f6\",\"order_tracking_id\":\"5210b730-9651-4497-8894-da35009383d7\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '5210b730-9651-4497-8894-da35009383d7', 'SES089-c8d8c6705df3d8f6', '2026-06-28 06:25:34'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '5210b730-9651-4497-8894-da35009383d7', 'SES089-c8d8c6705df3d8f6', '2026-06-28 06:25:41'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '5210b730-9651-4497-8894-da35009383d7', 'SES089-c8d8c6705df3d8f6', '2026-06-28 06:25:44'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '5210b730-9651-4497-8894-da35009383d7', 'SES089-c8d8c6705df3d8f6', '2026-06-28 06:25:47'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '5210b730-9651-4497-8894-da35009383d7', 'SES089-c8d8c6705df3d8f6', '2026-06-28 06:25:52'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '5210b730-9651-4497-8894-da35009383d7', 'SES089-c8d8c6705df3d8f6', '2026-06-28 06:25:55'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '5210b730-9651-4497-8894-da35009383d7', 'SES089-c8d8c6705df3d8f6', '2026-06-28 06:25:58'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '5210b730-9651-4497-8894-da35009383d7', 'SES089-c8d8c6705df3d8f6', '2026-06-28 06:26:01'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '5210b730-9651-4497-8894-da35009383d7', 'SES089-c8d8c6705df3d8f6', '2026-06-28 06:26:04'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '5210b730-9651-4497-8894-da35009383d7', 'SES089-c8d8c6705df3d8f6', '2026-06-28 06:26:07'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '5210b730-9651-4497-8894-da35009383d7', 'SES089-c8d8c6705df3d8f6', '2026-06-28 06:26:11'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '5210b730-9651-4497-8894-da35009383d7', 'SES089-c8d8c6705df3d8f6', '2026-06-28 06:26:14'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '5210b730-9651-4497-8894-da35009383d7', 'SES089-c8d8c6705df3d8f6', '2026-06-28 06:26:17'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '5210b730-9651-4497-8894-da35009383d7', 'SES089-c8d8c6705df3d8f6', '2026-06-28 06:26:20'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '5210b730-9651-4497-8894-da35009383d7', 'SES089-c8d8c6705df3d8f6', '2026-06-28 06:26:23'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '5210b730-9651-4497-8894-da35009383d7', 'SES089-c8d8c6705df3d8f6', '2026-06-28 06:26:26'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '5210b730-9651-4497-8894-da35009383d7', 'SES089-c8d8c6705df3d8f6', '2026-06-28 06:26:29'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '5210b730-9651-4497-8894-da35009383d7', 'SES089-c8d8c6705df3d8f6', '2026-06-28 06:26:32'),
(0, 89, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":600,\"merchant_reference\":\"SES089-6cc94e769a464a0c\",\"order_tracking_id\":\"2d1d1cbd-ccc2-43a8-885a-da35bd727fe0\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '2d1d1cbd-ccc2-43a8-885a-da35bd727fe0', 'SES089-6cc94e769a464a0c', '2026-06-28 06:26:48'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '2d1d1cbd-ccc2-43a8-885a-da35bd727fe0', 'SES089-6cc94e769a464a0c', '2026-06-28 06:26:54'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '2d1d1cbd-ccc2-43a8-885a-da35bd727fe0', 'SES089-6cc94e769a464a0c', '2026-06-28 06:26:57'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '2d1d1cbd-ccc2-43a8-885a-da35bd727fe0', 'SES089-6cc94e769a464a0c', '2026-06-28 06:27:00'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '2d1d1cbd-ccc2-43a8-885a-da35bd727fe0', 'SES089-6cc94e769a464a0c', '2026-06-28 06:27:06'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '2d1d1cbd-ccc2-43a8-885a-da35bd727fe0', 'SES089-6cc94e769a464a0c', '2026-06-28 06:27:09'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '2d1d1cbd-ccc2-43a8-885a-da35bd727fe0', 'SES089-6cc94e769a464a0c', '2026-06-28 06:27:12'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '2d1d1cbd-ccc2-43a8-885a-da35bd727fe0', 'SES089-6cc94e769a464a0c', '2026-06-28 06:27:17'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '2d1d1cbd-ccc2-43a8-885a-da35bd727fe0', 'SES089-6cc94e769a464a0c', '2026-06-28 06:27:20'),
(0, 89, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '2d1d1cbd-ccc2-43a8-885a-da35bd727fe0', 'SES089-6cc94e769a464a0c', '2026-06-28 06:27:23'),
(0, 89, 'confirmed_by_callback', '{\"order_tracking_id\":\"2d1d1cbd-ccc2-43a8-885a-da35bd727fe0\",\"note\":\"Confirmed by callback redirect (API verification unavailable)\"}', '41.90.172.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', '2d1d1cbd-ccc2-43a8-885a-da35bd727fe0', 'SES089-6cc94e769a464a0c', '2026-06-28 06:27:25'),
(0, 90, 'initiated', '{\"payment_method\":\"MPESA\",\"amount\":600,\"merchant_reference\":\"SES090-b745ffab528ea15d\",\"order_tracking_id\":\"846bf715-7445-4158-aa47-da352d77fb2f\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '846bf715-7445-4158-aa47-da352d77fb2f', 'SES090-b745ffab528ea15d', '2026-06-28 09:13:50'),
(0, 90, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '846bf715-7445-4158-aa47-da352d77fb2f', 'SES090-b745ffab528ea15d', '2026-06-28 09:14:04'),
(0, 90, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '846bf715-7445-4158-aa47-da352d77fb2f', 'SES090-b745ffab528ea15d', '2026-06-28 09:14:07'),
(0, 90, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '846bf715-7445-4158-aa47-da352d77fb2f', 'SES090-b745ffab528ea15d', '2026-06-28 09:14:10'),
(0, 90, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '846bf715-7445-4158-aa47-da352d77fb2f', 'SES090-b745ffab528ea15d', '2026-06-28 09:14:13'),
(0, 90, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '846bf715-7445-4158-aa47-da352d77fb2f', 'SES090-b745ffab528ea15d', '2026-06-28 09:14:16'),
(0, 90, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '846bf715-7445-4158-aa47-da352d77fb2f', 'SES090-b745ffab528ea15d', '2026-06-28 09:14:20'),
(0, 90, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '846bf715-7445-4158-aa47-da352d77fb2f', 'SES090-b745ffab528ea15d', '2026-06-28 09:14:23'),
(0, 90, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '846bf715-7445-4158-aa47-da352d77fb2f', 'SES090-b745ffab528ea15d', '2026-06-28 09:14:26'),
(0, 90, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '846bf715-7445-4158-aa47-da352d77fb2f', 'SES090-b745ffab528ea15d', '2026-06-28 09:14:29'),
(0, 90, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '846bf715-7445-4158-aa47-da352d77fb2f', 'SES090-b745ffab528ea15d', '2026-06-28 09:14:32'),
(0, 90, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '846bf715-7445-4158-aa47-da352d77fb2f', 'SES090-b745ffab528ea15d', '2026-06-28 09:14:35'),
(0, 90, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '846bf715-7445-4158-aa47-da352d77fb2f', 'SES090-b745ffab528ea15d', '2026-06-28 09:14:38'),
(0, 90, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '846bf715-7445-4158-aa47-da352d77fb2f', 'SES090-b745ffab528ea15d', '2026-06-28 09:14:42'),
(0, 90, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '846bf715-7445-4158-aa47-da352d77fb2f', 'SES090-b745ffab528ea15d', '2026-06-28 09:14:45'),
(0, 90, 'status_checked', '{\"billing_status\":\"payment_requested\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '846bf715-7445-4158-aa47-da352d77fb2f', 'SES090-b745ffab528ea15d', '2026-06-28 09:14:48'),
(0, 90, 'confirmed_by_callback', '{\"order_tracking_id\":\"846bf715-7445-4158-aa47-da352d77fb2f\",\"note\":\"Confirmed by callback redirect (API verification unavailable)\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '846bf715-7445-4158-aa47-da352d77fb2f', 'SES090-b745ffab528ea15d', '2026-06-28 09:14:50'),
(0, 91, 'manual_payment', '{\"transaction_code\":\"Mary\",\"amount\":\"2500.00\"}', '102.213.95.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', NULL, NULL, '2026-06-28 09:29:34');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `cost_price` decimal(10,2) DEFAULT 0.00,
  `initial_cost` decimal(12,2) DEFAULT 0.00,
  `remaining_value` decimal(12,2) DEFAULT 0.00,
  `stock_quantity` int(11) DEFAULT 0,
  `quantity_remaining` decimal(10,2) DEFAULT NULL,
  `initial_quantity` decimal(10,2) DEFAULT 0.00,
  `quantity_unit` varchar(20) DEFAULT 'units',
  `reorder_level` decimal(10,2) DEFAULT 0.00,
  `status` enum('In Stock','Low Stock','Out of Stock') DEFAULT 'In Stock',
  `category` varchar(50) DEFAULT NULL,
  `product_type` enum('Saleable','Internal Use') DEFAULT 'Saleable',
  `tracking_mode` enum('Units','Level') DEFAULT 'Units',
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `sku`, `description`, `price`, `cost_price`, `initial_cost`, `remaining_value`, `stock_quantity`, `quantity_remaining`, `initial_quantity`, `quantity_unit`, `reorder_level`, `status`, `category`, `product_type`, `tracking_mode`, `image_url`, `created_at`) VALUES
(5, 'Subaru dye', 'Dye', 'Dye', 100.00, 50.00, 250.00, 2500.00, 50, NULL, 5.00, 'units', 5.00, 'In Stock', 'Hair Care', 'Saleable', 'Units', '', '2026-05-03 19:51:58');

-- --------------------------------------------------------

--
-- Table structure for table `product_stock_movements`
--

CREATE TABLE `product_stock_movements` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `movement_type` enum('restock','consumption','adjustment') NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit_cost` decimal(12,4) DEFAULT 0.0000,
  `total_cost` decimal(12,2) DEFAULT 0.00,
  `previous_quantity` decimal(10,2) DEFAULT 0.00,
  `new_quantity` decimal(10,2) DEFAULT 0.00,
  `price_vs_initial_amount` decimal(12,4) DEFAULT 0.0000,
  `price_vs_initial_pct` decimal(8,4) DEFAULT 0.0000,
  `notes` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `redemptions`
--

CREATE TABLE `redemptions` (
  `id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `reward_id` int(11) NOT NULL,
  `points_spent` int(11) NOT NULL DEFAULT 0,
  `status` enum('Pending','Approved','Rejected','Cancelled') DEFAULT 'Pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rewards`
--

CREATE TABLE `rewards` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `points_required` int(11) NOT NULL DEFAULT 0,
  `stock` int(11) NOT NULL DEFAULT 0 COMMENT '0 = unlimited',
  `image_path` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `schema_migrations`
--

CREATE TABLE `schema_migrations` (
  `id` int(11) NOT NULL,
  `migration` varchar(255) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schema_migrations`
--

INSERT INTO `schema_migrations` (`id`, `migration`, `checksum`, `applied_at`) VALUES
(1, '001_initial_schema.sql', '4aba58587602559fbe44603683b276a2eeb653d70f2eb38a77b9fda4e6911464', '2026-04-14 08:04:56'),
(2, '002_update_staff_table.sql', 'f8ca80b15ed304719b6ef86b47617f99e3877e522be552ec8acbf3d4148bb93d', '2026-04-14 08:04:56'),
(3, '003_create_staffs_table.sql', 'c33a3450dd82379aa484be55628f4a439cdb7a983c8dace487a846ecc51c7d6c', '2026-04-14 08:04:56'),
(4, '004_add_activation_password.sql', '7575c437f89e0518f5cc79acb9cfe69d028b519a0494395ac6e551f73b6daf15', '2026-04-14 08:04:56'),
(5, '005_add_password_to_staffs.sql', '54fb9fb3692986357dfd17e8785a4236bfe02d008fe468102ffeac7833cc5414', '2026-04-14 08:04:56'),
(6, '006_add_username_and_uniqueness.sql', '5c1c88aa237cd67ec326f6339a144b1671165984e71b1a6c6d8e59995d88c539', '2026-04-14 08:04:56'),
(7, '007_add_created_by_to_staffs.sql', '320bf5ea1d4aaf2b202dd6d819a8ea66ea88cfb62dbe8a101d2ee6322f4fdf10', '2026-04-14 08:04:56'),
(8, '007_update_services.sql', '74f63658043e599789e855134f8760b1181b1c3f0c3d436ce2e92660e44ccd7c', '2026-04-14 08:04:56'),
(9, '008_create_sessions_table.sql', '0c38e1e0df73aac321e51d033da7d8b9b4e3aa7788c7610c1e8180aeb1e0595c', '2026-04-14 08:04:56'),
(10, '009_update_appointments_table.sql', '41001cf6405349a10fd6e1c01f1fa5587efb3713b6d1e8b36615fac97be250aa', '2026-04-14 08:04:56'),
(11, '010_update_users_for_loyalty.sql', '4c0dffdf79bb99f5867420af1cb1d83e9b7b529072b694216663ea48a3855af2', '2026-04-14 08:04:56'),
(12, '011_update_products_table.sql', 'aad7adaf6cd780e738a0250536fcabd3e7cc8196ae875f22ed9c272672f12d96', '2026-04-14 08:04:56'),
(13, '012_create_commissions_table.sql', '465af17357131c94c777426eef92041e08cbcc41d716139f7003b5e614655576', '2026-04-14 08:04:56'),
(14, '013_support_multiple_services_per_session.sql', '5cc3127ac5fb92c528992d228a78ba260bb131fb9f58e9045d7495d7beaa2e65', '2026-04-14 08:04:56'),
(15, '014_link_sessions_to_appointments.sql', '575166c86d27fab519ce755372d8da00ab86e7abc22f2ba4a643e0af38b2c792', '2026-04-14 08:04:56'),
(16, '015_service_categories_and_seed_services.sql', '1b2aff8d231babad31303fedbaeb7f28bb2e6548bd1b7ae8ed5061a970e3ac28', '2026-04-14 11:28:39'),
(17, '016_create_inhouse_service_requests_table.sql', 'ed50c71334a993499a1e08f7833ca085eb34f023a9098e0b50cfea412aae8ff7', '2026-04-14 11:56:18'),
(18, '017_expand_products_inventory_model.sql', 'f5285b863f4abb16283125740bef25ba87225add739815158139bb1294b2ac47', '2026-04-15 08:57:19'),
(19, '018_add_initial_quantity_to_products.sql', '2f36be8b0e01890c27d7b0f95233a7283a13fcab6e19036b0fe5037aa0facc16', '2026-04-15 09:21:04'),
(20, '019_add_cost_valuation_fields_to_products.sql', '4cbd4053c549fcc32a3403869a24f253772de2b727cffea9dc4233e447fcb5cb', '2026-04-15 09:25:41'),
(21, '020_create_product_stock_movements.sql', 'eee41d6737bca38789263e6d0e8d05e89098eb6ce25e3b09df43c3fef20a92bd', '2026-04-15 09:59:33'),
(22, '021_expand_commissions_for_service_split.sql', '1fecdddda8def36acaed57f31713482ffb624e6593f40b7af3d38897008c76ce', '2026-04-15 11:21:09'),
(23, '022_add_commission_settlement_metadata.sql', '74b6440cdf5151b8d6176b9a5ff49b0f87fe3227e04ccc3ecce599fb46d901db', '2026-04-15 11:44:13'),
(24, '023_create_system_settings_table.sql', '3355379aca20028a9524e4f5625c511e920bacb430d213ab8d062200d228c33f', '2026-04-16 10:24:31'),
(25, '024_add_finance_settings_defaults.sql', 'd1c0e5b27093be9e3b61897daf331e35ab974a512edbe9cccd7d800bc926b3d9', '2026-04-16 10:45:34'),
(26, '025_add_session_contact_and_feedback.sql', 'f02248561dee3e22bc0dbceb0ff8cf963f123c98e64117586bc8dd8d49941d36', '2026-04-17 10:30:03'),
(27, '026_add_feedback_view_tracking.sql', '22026bf91ad3e4a1599339ce74d34ddc6335fbaa1749a13be7e4e9e3cfe439a2', '2026-04-17 10:30:03'),
(28, '027_add_appointment_management_tokens.sql', '7623fcbe563135beaf222072cdabf9c4c348ce65ea6086fc26216e56ccc2ed1e', '2026-04-17 10:43:53'),
(29, '028_service_line_staffing_and_commission_link.sql', '613c3bad57d6f7b9ab37ad7ccce30cff46dcf19f0f8f0314f180a75f9c79e30e', '2026-04-17 11:14:24'),
(30, '029_add_session_billing_workflow_fields.sql', '65746370aa559d2797fa06acf7a125d0fbe7887d43d5b7887eb53a8bc36b4eae', '2026-04-17 12:44:21'),
(31, '029_commission_rules_and_service_link.sql', '9731b7cbcb0616053281087c81abe430bdb6040b8e127469de87a30f43b8001c', '2026-04-18 07:46:06'),
(32, '030_ensure_commission_rules_table.sql', 'dd819bed4703ba1c57eac3a96406c3974220d565254d83cb90fd81fa30eacfa3', '2026-04-18 07:46:06'),
(33, '031_commission_rules_standalone.sql', '3f1fb57ad51c9cfa084e4e5bcb163f24685d665798ba600c2959e7b05b543fc4', '2026-04-18 08:01:16'),
(34, '032_ensure_services_commission_rule_id.sql', 'e9ba15c1dd1cf8af21eb7d10be3a53967454fbc06dbed1e0d05a0a4208083d34', '2026-04-19 11:30:02'),
(35, '033_commission_settlement_batches.sql', 'bdc5016df648e476b790dfa896da3f4c3fc7268d899d73bdfd6cd8efc50d3a56', '2026-04-19 22:08:13'),
(36, '034_ensure_services_image_url.sql', '', '2026-06-26 13:40:00'),
(37, '035_create_service_offers.sql', '', '2026-06-26 13:40:00'),
(38, '036_create_expenses_table.sql', '', '2026-06-26 13:40:00'),
(39, '037_create_appointment_services_table.sql', '', '2026-06-26 13:40:00'),
(40, '038_create_token_blacklist.sql', '', '2026-06-26 13:40:00'),
(41, '039_create_password_resets_table.sql', '', '2026-06-26 13:40:00'),
(42, '040_simplify_sessions.sql', '', '2026-06-26 13:40:00'),
(43, '042_add_created_by_to_sessions.sql', '', '2026-06-26 13:40:00'),
(44, '043_add_pesapal_payment_fields.sql', '', '2026-06-26 13:40:00'),
(45, '044_expand_billing_status_and_pesapal.sql', '', '2026-06-26 13:40:00'),
(46, '045_create_addons_and_session_addons.sql', '', '2026-06-26 13:40:00'),
(47, '046_create_payment_audit_log.sql', '', '2026-06-26 13:40:00'),
(48, '047_add_session_services_default_flag.sql', '', '2026-06-26 13:40:00'),
(49, '048_create_activity_log.sql', '', '2026-06-26 13:40:00');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `duration` varchar(50) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Active',
  `commission_rule_id` int(11) DEFAULT NULL,
  `image_url` varchar(512) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `name`, `description`, `price`, `duration`, `category`, `category_id`, `status`, `commission_rule_id`, `image_url`, `created_at`) VALUES
(23, 'Shave', 'Professional shave for different styles', 400.00, '40 min', 'Kareh\'s Barbershop', 1, 'Active', 8, 'uploads/services/fbc64cd2e138ccadd1a72010bbacb304.jpeg', '2026-04-21 04:28:25'),
(27, 'Coffee scrub', '', 600.00, '10min', 'Kareh\'s Barbershop', 1, 'Active', 10, '', '2026-05-01 16:54:49'),
(28, 'Apricot Scrub', '', 400.00, '10min', 'Kareh\'s Barbershop', 1, 'Active', 10, '', '2026-05-01 16:55:54'),
(31, 'Basic Facial Therapy', '', 2000.00, '1hr', 'The Spa Sanctuary', 3, 'Active', 10, '', '2026-05-01 16:58:17'),
(32, 'Deep Tissue Massage', '', 3500.00, '1hr 10min', 'The Spa Sanctuary', 3, 'Active', 10, '', '2026-05-01 16:58:54'),
(33, 'Sweedish Massage', '', 3000.00, '1hr', 'The Spa Sanctuary', 3, 'Active', 10, '', '2026-05-01 16:59:24'),
(34, 'Back Massage', '', 2000.00, '45min', 'The Spa Sanctuary', 3, 'Active', 10, '', '2026-05-01 16:59:52'),
(35, 'Body scrub', '', 4000.00, '2hrs', 'The Spa Sanctuary', 3, 'Active', NULL, '', '2026-05-01 17:00:26'),
(36, 'Scrub Steaming', '', 1500.00, '30min', 'The Spa Sanctuary', 3, 'Active', NULL, '', '2026-05-01 17:01:41'),
(37, 'Armpits Waxing', '', 800.00, '20min', 'The Spa Sanctuary', 3, 'Active', NULL, '', '2026-05-01 17:02:23'),
(38, 'Waxing with steam', '', 1000.00, '30min', 'The Spa Sanctuary', 3, 'Active', 10, '', '2026-05-01 17:02:53'),
(39, 'Brazillian Waxing', '', 2000.00, '45min', 'The Spa Sanctuary', 3, 'Active', 10, '', '2026-05-01 17:03:28'),
(40, 'Leg waxing', '', 1500.00, '30min', 'The Spa Sanctuary', 3, 'Active', NULL, '', '2026-05-01 17:03:56'),
(41, 'Arm waxing', '', 1000.00, '20min', 'The Spa Sanctuary', 3, 'Active', NULL, '', '2026-05-01 17:04:26'),
(42, 'Kid Shave', '', 250.00, '20min', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-01 17:05:07'),
(43, 'Dye(Black shampoo)', 'dye', 800.00, '30 min', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-03 19:27:56'),
(44, 'Straightening', 'streighten', 300.00, '15', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-03 19:48:22'),
(45, 'Wash & blow', 'wash', 400.00, '15', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-03 19:50:25'),
(46, 'Full blowdry', 'blowdry', 500.00, '15', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-03 19:51:38'),
(47, 'Leave in Treatment', 'treatment', 1000.00, '30 min', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-03 19:52:40'),
(48, 'Deep Treatment', 'deep treatment', 1500.00, '45 min', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-03 19:54:31'),
(49, 'Drop lines', 'lines', 600.00, '60 min', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-03 19:56:25'),
(50, 'Up-do lines', '', 800.00, '60 min', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-03 20:01:20'),
(51, 'Lines extenxion', 'extend', 1000.00, '60 min', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-03 20:02:19'),
(52, 'Knotless Braids kids', 'braiding', 2000.00, '60 min', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-03 20:03:22'),
(53, 'Braids kids', 'braiding', 2000.00, '60 min', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-03 20:04:01'),
(54, 'DREADLOC INST', 'dreads', 3500.00, '60 min', 'Nails & Hair Art', 4, 'Active', NULL, '', '2026-05-03 20:05:52'),
(55, 'dreadlocs retouch', 'retouch', 1800.00, '90', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-03 20:06:46'),
(56, 'Sisterlocs retie', 'retie', 3000.00, '90', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-03 20:07:37'),
(57, 'Interlocking', 'interloc', 2000.00, '100', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-03 20:11:08'),
(58, 'styling', 'style', 300.00, '15', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-03 20:11:50'),
(59, 'styling', 'style', 800.00, '15 min', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-03 20:12:25'),
(60, 'Own deep treatment', '', 1000.00, '30 min', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-04 09:31:07'),
(61, 'braiding adults', 'braid', 2500.00, '100', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-04 09:32:29'),
(62, 'Weaving', 'weave', 1800.00, '60 min', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-04 09:32:57'),
(63, 'Ghanians', '', 2000.00, '120', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-04 09:33:31'),
(64, 'Twist outs', 'twist', 2000.00, '120', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-04 09:35:13'),
(65, 'Crocheting', '', 1500.00, '120', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-04 09:35:38'),
(66, 'Chem retouch(own)', 'chem', 1800.00, '60 min', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-04 09:36:26'),
(68, 'Virgin Application', 'application', 3000.00, '90', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-04 09:38:07'),
(69, 'Undo', 'reopen', 300.00, '30 min', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-04 09:41:14'),
(70, 'Wig laundry', 'wig wash', 1000.00, '30 min', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-04 09:42:20'),
(71, 'Matuta/twist', 'twist', 1000.00, '60 min', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-04 09:42:55'),
(72, 'WASH&SET', 'setting', 500.00, '30 min', 'Nails & Hair Art', 4, 'Active', NULL, '', '2026-05-04 09:43:24'),
(73, 'Finger curls', 'curls', 1800.00, '60 min', 'Nails & Hair Art', 4, 'Active', NULL, '', '2026-05-04 09:44:28'),
(75, 'Chemical Retouch(ours)', 'retouch', 2500.00, '30 min', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-04 10:23:03'),
(76, 'FLAT IRON', 'ironing', 800.00, '60 min', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-04 10:24:02'),
(77, 'cream of nature', 'dye', 2500.00, '90', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-04 10:28:35'),
(78, 'Heena dye', '', 1500.00, '60 min', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-04 10:30:04'),
(79, 'Black Shampoo', '', 1000.00, '45 min', 'Nails & Hair Art', 4, 'Active', 6, '', '2026-05-04 10:30:29'),
(80, 'Dye subaru', '', 1100.00, '45 min', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-04 10:32:45'),
(81, 'heena barber', '', 1100.00, '45 min', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-04 10:34:04'),
(82, 'Tancho dye', 'dye', 1150.00, '45 min', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-04 10:35:02'),
(83, 'Dye cream nature barber', 'dye', 2500.00, '60 min', 'Kareh\'s Barbershop', 1, 'Active', NULL, '', '2026-05-04 10:36:20'),
(84, 'Ladies Shave', '', 500.00, '30 min', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-04 10:38:15'),
(85, 'Texturizing', 'texturizing', 1500.00, '90', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-04 10:39:45'),
(86, 'Gel polish', '', 800.00, '15 min', 'Nail art', 5, 'Active', 9, '', '2026-05-04 10:46:02'),
(87, 'Manicure', 'hand wash', 1000.00, '30 min', 'Nail art', 5, 'Active', 9, '', '2026-05-04 10:46:46'),
(88, 'Manicure gel', 'gel', 1500.00, '45 min', 'Nail art', 5, 'Active', 9, '', '2026-05-04 10:47:28'),
(89, 'Pedicure', '', 1500.00, '40', 'Nail art', 5, 'Active', 9, '', '2026-05-04 10:48:03'),
(90, 'Pedicure gel', 'leg wash', 2000.00, '45', 'Nail art', 5, 'Active', 9, '', '2026-05-04 10:48:33'),
(91, 'Tips gel', 'tips', 2500.00, '60', 'Nail art', 5, 'Active', 9, '', '2026-05-04 10:49:03'),
(92, 'Builder gel', 'hardener', 2500.00, '60', 'Nail art', 5, 'Active', 9, '', '2026-05-04 10:50:01'),
(93, 'Acrylics', 'extenxions', 3500.00, '120', 'Nail art', 5, 'Active', 9, '', '2026-05-04 10:50:35'),
(94, 'razor shapping', 'shapping', 200.00, '15 min', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 10:51:09'),
(95, 'Tweezing', 'tweezer', 300.00, '30 min', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 10:51:40'),
(96, 'Threading', 'thread', 300.00, '30 min', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 10:52:09'),
(97, 'Facial Therapy', '', 2500.00, '60 min', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 10:52:34'),
(98, 'Strip lashes', 'lashes', 1000.00, '15 min', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 10:53:38'),
(99, 'cluster lashes', 'lashes', 1850.00, '45 min', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 10:54:23'),
(100, 'hybrid lashes', '', 3000.00, '45 min', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 10:54:57'),
(101, 'Gel removal,', 'removal', 500.00, '15', 'Nail art', 5, 'Active', NULL, '', '2026-05-04 10:56:28'),
(102, 'Lashes removal', 'removing lashes', 500.00, '15 min', 'The Spa Sanctuary', 3, 'Active', NULL, '', '2026-05-04 10:59:26'),
(103, 'Gum gel', 'gel', 2500.00, '45 min', 'Nail art', 5, 'Active', 9, '', '2026-05-04 11:04:41'),
(104, 'Teenage shave', 'shave', 300.00, '15 min', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-04 11:08:45'),
(105, 'Kids dye', '', 1500.00, '15 min', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-04 11:09:34'),
(106, 'Nail cutting', 'cut', 300.00, '15', 'Kareh\'s Barbershop', 1, 'Active', 9, '', '2026-05-04 11:10:15'),
(107, 'Beard Shave', '', 200.00, '15 min', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-04 11:10:48'),
(108, 'Hair cut', '', 150.00, '15', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-04 11:11:14'),
(109, 'BODY SCRUB', 'scrubbing', 4000.00, '90', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 11:22:45'),
(110, 'VIP Grooming', '', 2000.00, '90', 'Kareh\'s Barbershop', 1, 'Active', 9, '', '2026-05-04 11:26:42'),
(111, 'VIP SHAVE', '', 1000.00, '40 min', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-04 11:27:27'),
(112, 'PACKAGE(1)', 'FACIAL,PEDICURE,BACK MASSAGE', 6000.00, '120', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 11:29:03'),
(113, 'PACKAGE(2)', 'Massage,facial,pedicure', 7000.00, '125', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 11:29:40'),
(114, 'PACKAGE(3)', 'MANICURE,PEDICURE,MASSAGE,FACIAL', 8000.00, '140', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 11:31:44'),
(115, 'PACKAGE (4)', 'Massage,facial,bodysrub,pedicure', 1100.00, '160', 'The Spa Sanctuary', 3, 'Active', 9, '', '2026-05-04 11:34:25'),
(116, 'Beard dye', '', 600.00, '45 min', 'Kareh\'s Barbershop', 1, 'Active', 8, '', '2026-05-04 11:38:11'),
(117, 'STYLING', '', 700.00, '40 min', 'Nails & Hair Art', 4, 'Active', 7, '', '2026-05-05 10:11:02'),
(118, 'Test', 'Test service', 5.00, '1', 'TEST', 6, 'Active', NULL, '', '2026-06-26 12:50:01');

-- --------------------------------------------------------

--
-- Table structure for table `service_categories`
--

CREATE TABLE `service_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service_categories`
--

INSERT INTO `service_categories` (`id`, `name`, `description`, `status`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 'Kareh\'s Barbershop', 'Glow up starts here', 'Active', 1, '2026-04-14 11:28:38', '2026-04-14 11:28:38'),
(2, 'Professional Coloring', 'Vibrant and lasting color treatments', 'Active', 2, '2026-04-14 11:28:38', '2026-04-14 11:28:38'),
(3, 'The Spa Sanctuary', 'Unknot your hair and stress', 'Active', 3, '2026-04-14 11:28:38', '2026-04-14 11:28:38'),
(4, 'Nails & Hair Art', 'Tips, toes and total glow', 'Active', 4, '2026-04-14 11:28:38', '2026-04-14 11:28:38'),
(5, 'Nail art', NULL, 'Active', NULL, '2026-05-04 11:14:21', '2026-05-04 11:14:21'),
(6, 'TEST', NULL, 'Active', NULL, '2026-06-26 12:49:36', '2026-06-26 12:49:36');

-- --------------------------------------------------------

--
-- Table structure for table `service_offers`
--

CREATE TABLE `service_offers` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `discount_type` enum('percent','amount') NOT NULL DEFAULT 'percent',
  `discount_value` decimal(10,2) NOT NULL DEFAULT 0.00,
  `starts_at` datetime DEFAULT NULL,
  `ends_at` datetime DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_offer_services`
--

CREATE TABLE `service_offer_services` (
  `id` int(11) NOT NULL,
  `offer_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_products`
--

CREATE TABLE `service_products` (
  `id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` decimal(10,2) NOT NULL DEFAULT 1.00,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL,
  `session_code` varchar(20) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `client_phone` varchar(20) DEFAULT NULL,
  `client_email` varchar(100) DEFAULT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `service_id` int(11) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `billing_subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount_type` enum('amount','percent') NOT NULL DEFAULT 'amount',
  `discount_value` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_requested_at` datetime DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `payment_transaction_code` varchar(120) DEFAULT NULL,
  `pesapal_merchant_reference` varchar(80) DEFAULT NULL,
  `pesapal_order_tracking_id` varchar(64) DEFAULT NULL,
  `pesapal_redirect_url` text DEFAULT NULL,
  `pesapal_payment_method` varchar(20) DEFAULT NULL,
  `pesapal_initiated_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('In Progress','Finalizing','Completed','Voided') DEFAULT 'In Progress',
  `billing_status` enum('unbilled','payment_requested','paid','failed','cancelled') NOT NULL DEFAULT 'unbilled',
  `start_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `end_time` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `appointment_id` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `session_code`, `customer_name`, `client_phone`, `client_email`, `staff_id`, `service_id`, `total_amount`, `billing_subtotal`, `discount_type`, `discount_value`, `discount_amount`, `payment_requested_at`, `paid_at`, `payment_transaction_code`, `pesapal_merchant_reference`, `pesapal_order_tracking_id`, `pesapal_redirect_url`, `pesapal_payment_method`, `pesapal_initiated_amount`, `status`, `billing_status`, `start_time`, `end_time`, `notes`, `created_at`, `updated_at`, `appointment_id`, `created_by`) VALUES
(32, 'SES032', 'Eddmound', '0717481181', 'momanyid098@gmail.com', 30, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, '2026-05-03 19:02:11', 'SZ7', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-03 16:00:24', '2026-05-03 16:01:34', 'Shave', '2026-05-03 16:00:24', '2026-05-03 16:02:11', 14, NULL),
(33, 'SES033', 'Allan Client', '0757818141', 'momanyid098@gmail.com', 30, 23, 400.00, 400.00, 'amount', 0.00, 0.00, '2026-05-03 19:09:45', '2026-05-03 19:09:57', 'Cash', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-03 16:05:15', '2026-05-03 16:05:52', '', '2026-05-03 16:05:15', '2026-05-03 16:09:57', 15, NULL),
(34, 'SES034', 'Sanchez', '0748876267', 'momanyid098@gmail.com', 30, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, '2026-05-03 19:16:50', 'L1S', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-03 16:14:54', '2026-05-03 16:15:44', 'Shaving', '2026-05-03 16:14:54', '2026-05-03 16:16:50', 16, NULL),
(35, 'SES035', 'Rachael Kamau', '0720789433', 'momanyid098@gmail.com', 30, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, '2026-05-03 19:21:29', '948', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-03 16:20:00', '2026-05-03 16:21:07', 'Shave', '2026-05-03 16:20:00', '2026-05-03 16:21:29', 17, NULL),
(36, 'SES036', 'Allan Client', '0757818141', 'momanyid098@gmail.com', 30, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, '2026-05-03 19:26:37', 'Cash', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-03 16:25:06', '2026-05-03 16:26:02', 'Shave', '2026-05-03 16:25:06', '2026-05-03 16:26:37', 19, NULL),
(37, 'SES037', 'Feifei Lian', '0796112500', 'momanyid098@gmail.com', 30, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, '2026-05-03 19:32:42', 'ZSF', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-03 16:31:19', '2026-05-03 16:31:55', 'Shaving', '2026-05-03 16:31:19', '2026-05-03 16:32:42', 20, NULL),
(38, 'SES038', 'Allan Client', '0757818141', 'momanyid098@gmail.com', 30, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, '2026-05-03 19:35:17', 'Cash', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-03 16:34:23', '2026-05-03 16:34:58', 'Shaving', '2026-05-03 16:34:23', '2026-05-03 16:35:17', 21, NULL),
(39, 'SES039', 'Kipkemoi Kirui', '0722123500', 'momanyid098@gmail.com', 30, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, '2026-05-03 19:40:19', '8Z3', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-03 16:39:18', '2026-05-03 16:39:55', 'Shaving', '2026-05-03 16:39:18', '2026-05-03 16:40:19', 22, NULL),
(40, 'SES040', 'Godfrey Kanaga', '0729387118', 'momanyid098@gmail.com', 30, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, '2026-05-03 19:44:38', 'XFP', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-03 16:43:28', '2026-05-03 16:44:13', 'Shaving', '2026-05-03 16:43:28', '2026-05-03 16:44:38', 23, NULL),
(41, 'SES041', 'Athriano Abaya', '0705873338', 'momanyid098@gmail.com', 30, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, '2026-05-03 20:07:38', 'ETH', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-03 17:06:39', '2026-05-03 17:07:07', 'Shaving', '2026-05-03 17:06:39', '2026-05-03 17:07:38', 24, NULL),
(42, 'SES042', 'Dismas Momanyi', '0713553998', 'momanyid098@gmail.com', 30, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, '2026-05-03 20:10:18', 'WWK', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-03 17:09:21', '2026-05-03 17:09:45', '', '2026-05-03 17:09:21', '2026-05-03 17:10:18', 25, NULL),
(44, 'SES043', 'Noah Luvusi', '0725695803', 'momanyid098@gmail.com', 20, 42, 250.00, 250.00, 'amount', 0.00, 0.00, NULL, '2026-05-03 23:27:43', 'WOV', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-03 20:26:33', '2026-05-03 20:27:20', 'Kid Shave', '2026-05-03 20:26:33', '2026-05-03 20:27:43', 27, NULL),
(45, 'SES045', 'Monica Kiare', '0727989897', 'momanyid098@gmail.com', 20, 42, 250.00, 250.00, 'amount', 0.00, 0.00, NULL, '2026-05-03 23:34:42', '4B1', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-03 20:32:11', '2026-05-03 20:34:09', 'Kids shave', '2026-05-03 20:32:11', '2026-05-03 20:34:42', 28, NULL),
(46, 'SES046', 'Monica Kiare', '0727989897', 'momanyid098@gmail.com', 20, 42, 250.00, 250.00, 'amount', 0.00, 0.00, NULL, '2026-05-03 23:37:05', '4B1', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-03 20:36:20', '2026-05-03 20:36:47', 'Kid shave', '2026-05-03 20:36:20', '2026-05-03 20:37:05', 29, NULL),
(47, 'SES047', 'Herbert', '0710872126', 'momanyid098@gmail.com', 20, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, '2026-05-03 23:46:14', '9MS', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-03 20:44:48', '2026-05-03 20:45:35', 'Shave', '2026-05-03 20:44:48', '2026-05-03 20:46:14', 30, NULL),
(48, 'SES048', 'Julian  Lemayian', '0720682285', 'momanyid098@gmail.com', 20, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, '2026-05-04 06:22:14', 'TGR', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-04 03:19:48', '2026-05-04 03:21:34', '', '2026-05-04 03:19:48', '2026-05-04 03:22:14', 31, NULL),
(49, 'SES049', 'Simon Oyaro', '0723957685', 'momanyid098@gmail.com', 20, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, '2026-05-04 06:29:35', 'A1V', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-04 03:24:43', '2026-05-04 03:28:10', '', '2026-05-04 03:24:43', '2026-05-04 03:29:35', 32, NULL),
(50, 'SES050', 'Maureen Omoga', '0724454512', 'momanyid098@gmail.com', 20, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, '2026-05-04 06:37:51', 'SMS', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-04 03:34:56', '2026-05-04 03:37:26', 'Kids shaving ', '2026-05-04 03:34:56', '2026-05-04 03:37:51', 33, NULL),
(51, 'SES051', 'Maureen Omoga', '0724454512', 'momanyid098@gmail.com', 20, 42, 250.00, 250.00, 'amount', 0.00, 0.00, NULL, '2026-05-04 06:48:57', 'SMS', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-04 03:46:36', '2026-05-04 03:48:28', '', '2026-05-04 03:46:36', '2026-05-04 03:48:57', 34, NULL),
(53, 'SES053', 'Joseph Mwangi', '0720333484', 'momanyid098@gmail.com', 20, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, '2026-05-04 07:36:20', 'Cash', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-04 04:00:36', '2026-05-04 04:35:30', '', '2026-05-04 04:00:36', '2026-05-04 04:36:20', 36, NULL),
(54, 'SES054', 'Shadrack Kibet', '0720333484', 'momanyid098@gmail.com', 30, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, '2026-05-04 07:09:22', 'JDB', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-04 04:02:38', '2026-05-04 04:07:29', '', '2026-05-04 04:02:38', '2026-05-04 04:09:22', 37, NULL),
(55, 'SES055', 'JAMES MPAAYO ', '0722989039', 'momanyid098@gmail.com', 30, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, '2026-05-04 07:10:12', '7AT', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-04 04:05:57', '2026-05-04 04:09:40', '', '2026-05-04 04:05:57', '2026-05-04 04:10:12', 38, NULL),
(56, 'SES056', 'Felix Customer', '0727618381', 'momanyid098@gmail.com', 20, 42, 250.00, 250.00, 'amount', 0.00, 0.00, NULL, '2026-05-04 07:35:07', 'YYW', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-04 04:12:37', '2026-05-04 04:27:29', '', '2026-05-04 04:12:37', '2026-05-04 04:35:07', 39, NULL),
(57, 'SES057', 'Salome Ochieng', '0700889503', 'momanyid098@gmail.com', 20, 42, 250.00, 250.00, 'amount', 0.00, 0.00, NULL, '2026-05-04 07:34:51', 'YYW', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-04 04:18:16', '2026-05-04 04:27:35', '', '2026-05-04 04:18:16', '2026-05-04 04:34:51', 40, NULL),
(58, 'SES058', 'Salome Ochieng', '0700889503', 'momanyid098@gmail.com', 20, 42, 250.00, 250.00, 'amount', 0.00, 0.00, NULL, '2026-05-04 07:31:34', 'YYW', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-04 04:18:22', '2026-05-04 04:27:39', '', '2026-05-04 04:18:22', '2026-05-04 04:31:34', 41, NULL),
(59, 'SES059', 'Allan Client', '0757818141', 'momanyid098@gmail.com', 30, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, '2026-05-04 07:30:29', 'Cash', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-04 04:18:28', '2026-05-04 04:27:43', '', '2026-05-04 04:18:28', '2026-05-04 04:30:29', 42, NULL),
(60, 'SES060', 'Felix Customer', '0727618381', 'momanyid098@gmail.com', 20, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, '2026-05-04 07:30:04', 'Cash', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-04 04:21:13', '2026-05-04 04:27:47', '', '2026-05-04 04:21:13', '2026-05-04 04:30:04', 43, NULL),
(61, 'SES061', 'Noel Cheloti', '0700889503', 'momanyid098@gmail.com', 30, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, '2026-05-04 07:29:06', 'QU8', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-04 04:23:03', '2026-05-04 04:27:52', '', '2026-05-04 04:23:03', '2026-05-04 04:29:06', 44, NULL),
(62, 'SES062', 'Noel Cheloti', '0700889503', 'momanyid098@gmail.com', 30, 42, 250.00, 250.00, 'amount', 0.00, 0.00, NULL, '2026-05-04 07:28:38', 'QU8', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-04 04:25:08', '2026-05-04 04:27:56', '', '2026-05-04 04:25:08', '2026-05-04 04:28:38', 46, NULL),
(63, 'SES063', 'Peris Nyaboke', '0722430655', 'allangassner@gmail.com', 30, 42, 250.00, 250.00, 'amount', 0.00, 0.00, NULL, '2026-05-04 09:12:15', 'M2U', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-04 06:07:59', '2026-05-04 06:09:58', '', '2026-05-04 06:07:59', '2026-05-04 06:12:15', 47, NULL),
(64, 'SES064', 'Perish Nyaboke', '0722430655', 'allangassner@gmail.com', 30, 42, 250.00, 250.00, 'amount', 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Completed', 'unbilled', '2026-05-04 06:15:50', '2026-05-04 09:31:08', '', '2026-05-04 06:15:50', '2026-05-04 09:31:08', 48, NULL),
(65, 'SES065', 'David Sakayo ', '0768590790', 'felixfelo041@gmail.com', 20, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, '2026-05-04 09:24:28', 'T7Y', NULL, NULL, NULL, NULL, NULL, 'Completed', 'paid', '2026-05-04 06:20:38', '2026-05-04 06:23:29', '', '2026-05-04 06:20:38', '2026-05-04 06:24:28', 49, NULL),
(66, 'SES066', 'Jhon Wilson', '0733833346', 'st.jhonwilson@gmail.com', 30, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Completed', 'unbilled', '2026-05-04 09:28:12', '2026-05-04 09:30:44', '', '2026-05-04 09:28:12', '2026-05-04 09:30:44', 50, NULL),
(67, 'SES067', 'Joseph Ololodi', '0723532954', 'allangassner@gmail.com', 30, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Completed', 'unbilled', '2026-05-04 10:58:21', '2026-05-05 18:50:36', '', '2026-05-04 10:58:21', '2026-05-05 18:50:36', 51, NULL),
(68, 'SES068', 'Simon Njoroge', '0726116463', 'skariuki1985@gmail.com', 20, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Completed', 'unbilled', '2026-05-04 16:57:18', '2026-05-05 18:54:01', '', '2026-05-04 16:57:18', '2026-05-05 18:54:01', 52, NULL),
(69, 'SES069', 'Caroline Cheptanui', '0111721609', 'momanyid098@gmail.com', 18, 117, 700.00, 700.00, 'amount', 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Completed', 'unbilled', '2026-05-05 11:12:45', '2026-05-05 19:29:45', '', '2026-05-05 11:12:45', '2026-05-05 19:29:45', NULL, NULL),
(70, 'SES070', 'Vincente', '0727539092', 'vincentmusheba@gmail.com', 30, 23, 400.00, 400.00, 'amount', 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Completed', 'unbilled', '2026-05-05 18:49:54', '2026-05-05 18:54:10', '', '2026-05-05 18:49:54', '2026-05-05 18:54:10', 53, NULL),
(71, 'SES071', 'Mary', '0723131736', 'momanyid098@gmail.com', 27, 58, 300.00, 300.00, 'amount', 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Completed', 'unbilled', '2026-05-05 19:25:35', '2026-05-05 19:28:46', '', '2026-05-05 19:25:35', '2026-05-05 19:28:46', 54, NULL),
(85, 'SES085', 'Test last', '0741140998', 'ongoshdesktop@gmail.com', NULL, NULL, 5.00, 0.00, 'amount', 0.00, 0.00, NULL, '2026-06-27 15:25:12', NULL, 'SES085-26d0f7355ca4cf6c', '03fbfac8-053b-4b18-b46b-da360873bff9', 'https://pay.pesapal.com/iframe/PesapalIframe3/Index?OrderTrackingId=03fbfac8-053b-4b18-b46b-da360873bff9', 'MPESA', 5.00, 'In Progress', 'paid', '2026-06-27 12:23:45', NULL, '', '2026-06-27 12:23:45', '2026-06-27 12:25:12', NULL, 12),
(86, 'SES086', 'Kuka ', '0741140998', 'ongoshdesktop@gmail.com', NULL, NULL, 5.00, 0.00, 'amount', 0.00, 0.00, NULL, '2026-06-27 16:40:56', NULL, 'SES086-35b024208d47a58d', '76d15ee1-6930-48e3-984d-da366ccdcad9', 'https://pay.pesapal.com/iframe/PesapalIframe3/Index?OrderTrackingId=76d15ee1-6930-48e3-984d-da366ccdcad9', 'MPESA', 5.00, 'In Progress', 'paid', '2026-06-27 13:39:15', NULL, '', '2026-06-27 13:39:15', '2026-06-27 13:40:56', NULL, 12),
(87, 'SES087', 'SMS test', '0742520245', 'ongoshdesktop@gmail.com', NULL, NULL, 5.00, 0.00, 'amount', 0.00, 0.00, NULL, '2026-06-27 16:44:33', NULL, 'SES087-aceb6f1544b3cb5e', '0f3c37cd-0a78-4bf5-b48e-da36f81c6c3a', 'https://pay.pesapal.com/iframe/PesapalIframe3/Index?OrderTrackingId=0f3c37cd-0a78-4bf5-b48e-da36f81c6c3a', 'MPESA', 5.00, 'In Progress', 'paid', '2026-06-27 13:43:08', NULL, '', '2026-06-27 13:43:08', '2026-06-27 13:44:33', NULL, 12),
(88, 'SES088', 'sms', '0742520245', 'ongoshdesktop@gmail.com', NULL, NULL, 400.00, 0.00, 'amount', 0.00, 0.00, NULL, '2026-06-27 17:19:56', 'test', NULL, NULL, NULL, 'CASH', NULL, 'In Progress', 'paid', '2026-06-27 14:19:30', NULL, '', '2026-06-27 14:19:30', '2026-06-27 14:19:56', NULL, 12),
(89, 'SES089', 'Dismas', '0713553998', '', NULL, NULL, 600.00, 0.00, 'amount', 0.00, 0.00, NULL, '2026-06-28 09:27:25', NULL, 'SES089-6cc94e769a464a0c', '2d1d1cbd-ccc2-43a8-885a-da35bd727fe0', 'https://pay.pesapal.com/iframe/PesapalIframe3/Index?OrderTrackingId=2d1d1cbd-ccc2-43a8-885a-da35bd727fe0', 'MPESA', 600.00, 'In Progress', 'paid', '2026-06-28 06:23:28', NULL, '', '2026-06-28 06:23:28', '2026-06-28 06:27:25', NULL, 30),
(90, 'SES090', 'Test', '0713553998', 'joshongosh@gmail.com', NULL, NULL, 600.00, 0.00, 'amount', 0.00, 0.00, NULL, '2026-06-28 12:14:50', NULL, 'SES090-b745ffab528ea15d', '846bf715-7445-4158-aa47-da352d77fb2f', 'https://pay.pesapal.com/iframe/PesapalIframe3/Index?OrderTrackingId=846bf715-7445-4158-aa47-da352d77fb2f', 'MPESA', 600.00, 'In Progress', 'paid', '2026-06-28 09:07:39', NULL, '', '2026-06-28 09:07:39', '2026-06-28 09:14:50', NULL, 12),
(91, 'SES091', 'Ongosh desktop', '0742520245', 'ongoshdesktop@gmail.com', NULL, NULL, 2500.00, 0.00, 'amount', 0.00, 0.00, NULL, '2026-06-28 12:29:34', 'Mary', NULL, NULL, NULL, 'CASH', NULL, 'In Progress', 'paid', '2026-06-28 09:26:15', NULL, '', '2026-06-28 09:26:15', '2026-06-28 09:29:34', 55, 12);

-- --------------------------------------------------------

--
-- Table structure for table `session_addons`
--

CREATE TABLE `session_addons` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `addon_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `material_price` decimal(10,2) NOT NULL,
  `labour_price` decimal(10,2) NOT NULL,
  `bulk_labour_price` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `session_feedback`
--

CREATE TABLE `session_feedback` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `token_expires_at` datetime NOT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `viewed_at` datetime DEFAULT NULL,
  `service_rating` tinyint(3) UNSIGNED DEFAULT NULL,
  `billing_rating` tinyint(3) UNSIGNED DEFAULT NULL,
  `feedback_text` text DEFAULT NULL,
  `client_name_snapshot` varchar(100) DEFAULT NULL,
  `client_email_snapshot` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `session_feedback`
--

INSERT INTO `session_feedback` (`id`, `session_id`, `token_hash`, `token_expires_at`, `submitted_at`, `viewed_at`, `service_rating`, `billing_rating`, `feedback_text`, `client_name_snapshot`, `client_email_snapshot`, `created_at`, `updated_at`) VALUES
(8, 32, 'c6c224d5d0ff2dbc92b75642c350f5da23402bd882b2afb719d47ad39a9e6cba', '2026-05-10 19:01:34', NULL, NULL, NULL, NULL, NULL, 'Eddmound', 'momanyid098@gmail.com', '2026-05-03 16:01:34', '2026-05-03 16:01:34'),
(9, 33, '762bd35d0e2a083518b8893078e1a73c65be6ec92f2a1f56dc94277a8251244f', '2026-05-10 19:05:52', NULL, NULL, NULL, NULL, NULL, 'Allan Client', 'momanyid098@gmail.com', '2026-05-03 16:05:52', '2026-05-03 16:05:52'),
(10, 34, '04cac0169f5e6befe8240fc16cb9505cb319720974a4cd812546ae85d1f797dd', '2026-05-10 19:15:44', NULL, NULL, NULL, NULL, NULL, 'Sanchez', 'momanyid098@gmail.com', '2026-05-03 16:15:44', '2026-05-03 16:15:44'),
(11, 35, 'e76f9b95fcb9403d0c66a4213ccb1440fd6118f6154b732d1723e25ddcff054b', '2026-05-10 19:21:07', NULL, NULL, NULL, NULL, NULL, 'Rachael Kamau', 'momanyid098@gmail.com', '2026-05-03 16:21:07', '2026-05-03 16:21:07'),
(12, 36, 'f014056a7b5433b07a127da7e27ce12b0d9d9869074175debe595949bbbd3c76', '2026-05-10 19:26:02', NULL, NULL, NULL, NULL, NULL, 'Allan Client', 'momanyid098@gmail.com', '2026-05-03 16:26:02', '2026-05-03 16:26:02'),
(13, 37, '31fc5d2680667bafdf377a9463d89fbd663ca7b824e5e85b7282b408603641f2', '2026-05-10 19:31:55', NULL, NULL, NULL, NULL, NULL, 'Feifei Lian', 'momanyid098@gmail.com', '2026-05-03 16:31:55', '2026-05-03 16:31:55'),
(14, 38, 'ec74dd232eecc8668b9e318ec21f3866de012a4bb6983d507be09588873cf0eb', '2026-05-10 19:34:58', NULL, NULL, NULL, NULL, NULL, 'Allan Client', 'momanyid098@gmail.com', '2026-05-03 16:34:58', '2026-05-03 16:34:58'),
(15, 39, '05dd20d9fd2ddc31b7832023e035cc3248e3ea2faa3388ab797897896f192f9f', '2026-05-10 19:39:55', NULL, NULL, NULL, NULL, NULL, 'Kipkemoi Kirui', 'momanyid098@gmail.com', '2026-05-03 16:39:55', '2026-05-03 16:39:55'),
(16, 40, 'fedd0d604021f0031e64015e8300388afb92a417173839225e01dd6c939015d0', '2026-05-10 19:44:13', NULL, NULL, NULL, NULL, NULL, 'Godfrey Kanaga', 'momanyid098@gmail.com', '2026-05-03 16:44:13', '2026-05-03 16:44:13'),
(17, 41, 'ba9aee9563c80db86413d7083096fa35f82544fbd8dcc86be536588846123f39', '2026-05-10 20:07:07', NULL, NULL, NULL, NULL, NULL, 'Athriano Abaya', 'momanyid098@gmail.com', '2026-05-03 17:07:07', '2026-05-03 17:07:07'),
(18, 42, '47f443cf7664f4757a7aa16a744747db9ac4c61109e2de119ad39d00ecf87fdc', '2026-05-10 20:09:45', NULL, NULL, NULL, NULL, NULL, 'Dismas Momanyi', 'momanyid098@gmail.com', '2026-05-03 17:09:45', '2026-05-03 17:09:45'),
(19, 44, 'ef3aa23070b00d0bd22c7ee36d402060603a6b2e704a1e51c86699b5c79c1416', '2026-05-10 23:27:20', NULL, NULL, NULL, NULL, NULL, 'Noah Luvusi', 'momanyid098@gmail.com', '2026-05-03 20:27:20', '2026-05-03 20:27:20'),
(20, 45, 'ad3fcfb66e971eef0560852e746ab302366b7b29539270d6151eda6560008388', '2026-05-10 23:34:09', NULL, NULL, NULL, NULL, NULL, 'Monica Kiare', 'momanyid098@gmail.com', '2026-05-03 20:34:09', '2026-05-03 20:34:09'),
(21, 46, 'a81082eb3f684b8e95a2301dad62fa4fcfed9b0976c49535ae0c3fe4c9eb8317', '2026-05-10 23:36:47', NULL, NULL, NULL, NULL, NULL, 'Monica Kiare', 'momanyid098@gmail.com', '2026-05-03 20:36:47', '2026-05-03 20:36:47'),
(22, 47, '49934b1d2ecbf8594382f8d8c0b2dbf0e6a48da3cf2cd65b0d4bf729e0ba205b', '2026-05-10 23:45:35', NULL, NULL, NULL, NULL, NULL, 'Herbert', 'momanyid098@gmail.com', '2026-05-03 20:45:35', '2026-05-03 20:45:35'),
(23, 48, 'b2b3dee601354b06e58fba8702456734cf486e9bd33a4fc3b0b3a9e3d6dab670', '2026-05-11 06:21:34', NULL, NULL, NULL, NULL, NULL, 'Julian  Lemayian', 'momanyid098@gmail.com', '2026-05-04 03:21:34', '2026-05-04 03:21:34'),
(24, 49, 'e1ef8b47857c66423fc646673065f56ed6506aa0f35d644a2efe80feb4172189', '2026-05-11 06:28:10', NULL, NULL, NULL, NULL, NULL, 'Simon Oyaro', 'momanyid098@gmail.com', '2026-05-04 03:28:10', '2026-05-04 03:28:10'),
(25, 50, '147e69935396209d34ef6a63b78502469071f971a360a6e5c49e126e74b75c4d', '2026-05-11 06:37:26', NULL, NULL, NULL, NULL, NULL, 'Maureen Omoga', 'momanyid098@gmail.com', '2026-05-04 03:37:26', '2026-05-04 03:37:26'),
(26, 51, '9d954c1f08269d4af6c689ce9740e69a310df616d3905859bb57534eae950bc1', '2026-05-11 06:48:28', NULL, NULL, NULL, NULL, NULL, 'Maureen Omoga', 'momanyid098@gmail.com', '2026-05-04 03:48:28', '2026-05-04 03:48:28'),
(28, 54, '6f8f07031f0f1ec1908be86eecf409224cb3792c942c3e624d43a60b72707dbb', '2026-05-11 07:07:29', NULL, NULL, NULL, NULL, NULL, 'Shadrack Kibet', 'momanyid098@gmail.com', '2026-05-04 04:07:29', '2026-05-04 04:07:29'),
(29, 55, '4a51159d9183b46d04825a1e19909480cccebd7d297b4364f9176438c871dd1e', '2026-05-11 07:09:40', NULL, NULL, NULL, NULL, NULL, 'JAMES MPAAYO ', 'momanyid098@gmail.com', '2026-05-04 04:09:40', '2026-05-04 04:09:40'),
(30, 56, '11b1ec02c343312da60d401f3b6f565e396a474a0f9693124e4a6c9dd420ef20', '2026-05-11 07:27:29', NULL, NULL, NULL, NULL, NULL, 'Felix Customer', 'momanyid098@gmail.com', '2026-05-04 04:27:29', '2026-05-04 04:27:29'),
(31, 57, '708433c9b66332e4a2f7f83328245a5ac07784b022621c02464cfa503c978f37', '2026-05-11 07:27:35', NULL, NULL, NULL, NULL, NULL, 'Salome Ochieng', 'momanyid098@gmail.com', '2026-05-04 04:27:35', '2026-05-04 04:27:35'),
(32, 58, '1d9a43cb74ce17c9c38bb39ee62d09b18ff83922ad8988d0a3512c3e7e507f03', '2026-05-11 07:27:39', NULL, NULL, NULL, NULL, NULL, 'Salome Ochieng', 'momanyid098@gmail.com', '2026-05-04 04:27:39', '2026-05-04 04:27:39'),
(33, 59, 'a751c1c273e94362c22ec5c5ad37ae1ece354568a441b8928c454dd9a416ea81', '2026-05-11 07:27:43', NULL, NULL, NULL, NULL, NULL, 'Allan Client', 'momanyid098@gmail.com', '2026-05-04 04:27:43', '2026-05-04 04:27:43'),
(34, 60, 'd199b33918c3ab792f1335e6a236a67f3b716da5756bb76a3e2103ae28d1288d', '2026-05-11 07:27:47', NULL, NULL, NULL, NULL, NULL, 'Felix Customer', 'momanyid098@gmail.com', '2026-05-04 04:27:47', '2026-05-04 04:27:47'),
(35, 61, 'f67fadbefcacb113a5a1645dedfc7d78cd1b577bd7567c3a3cecdc691d333e9c', '2026-05-11 07:27:52', NULL, NULL, NULL, NULL, NULL, 'Noel Cheloti', 'momanyid098@gmail.com', '2026-05-04 04:27:52', '2026-05-04 04:27:52'),
(36, 62, 'a2d75e0c9b508ebbe012f1244d6f416e85f66e8d7e7e467ef7f4708a6a4f7ff2', '2026-05-11 07:27:56', NULL, NULL, NULL, NULL, NULL, 'Noel Cheloti', 'momanyid098@gmail.com', '2026-05-04 04:27:56', '2026-05-04 04:27:56'),
(37, 53, '41e8e14efc85160de21bb07594c19f013d0aabf7398cc2b4cad6f12a6c545665', '2026-05-11 07:35:30', NULL, NULL, NULL, NULL, NULL, 'Joseph Mwangi', 'momanyid098@gmail.com', '2026-05-04 04:35:30', '2026-05-04 04:35:30'),
(38, 63, '3146d12163e8a3dda33013a5340ee729a7fd5c45f3a01530009b6629162e201d', '2026-05-11 09:09:58', NULL, NULL, NULL, NULL, NULL, 'Peris Nyaboke', 'allangassner@gmail.com', '2026-05-04 06:09:58', '2026-05-04 06:09:58'),
(39, 65, '4c50b673c3faa97081d735c4167cc94676994e41701790255b0c127af16ab23b', '2026-05-11 09:23:29', NULL, NULL, NULL, NULL, NULL, 'David Sakayo ', 'felixfelo041@gmail.com', '2026-05-04 06:23:29', '2026-05-04 06:23:29'),
(40, 66, '0ebd4c745e951a1c2f65ecd266daec19782798b8303c8bceb6d0a05cd1074918', '2026-05-11 12:30:44', NULL, NULL, NULL, NULL, NULL, 'Jhon Wilson', 'st.jhonwilson@gmail.com', '2026-05-04 09:30:44', '2026-05-04 09:30:44'),
(41, 64, '90b1f9bf6633f8de895ddafd268442c77c65a280fb205aff1a1f21d3de754c77', '2026-05-11 12:31:08', NULL, NULL, NULL, NULL, NULL, 'Perish Nyaboke', 'allangassner@gmail.com', '2026-05-04 09:31:08', '2026-05-04 09:31:08'),
(42, 67, '1a37e72295be24053fd19a623085909b06a5a1697f011d3e43edc8c35ee8635a', '2026-05-12 21:50:36', NULL, NULL, NULL, NULL, NULL, 'Joseph Ololodi', 'allangassner@gmail.com', '2026-05-05 18:50:36', '2026-05-05 18:50:36'),
(43, 68, 'dedf6e44733b0fbe655ad62cece7cc063d30a7bbffde7e804738f2e15f095719', '2026-05-12 21:54:01', NULL, NULL, NULL, NULL, NULL, 'Simon Njoroge', 'skariuki1985@gmail.com', '2026-05-05 18:54:01', '2026-05-05 18:54:01'),
(44, 69, '534529d9b71cb97bab8a16f6711d80ef936f62dca2fc10febff85d432ac5845e', '2026-05-12 22:29:45', NULL, NULL, NULL, NULL, NULL, 'Caroline Cheptanui', 'momanyid098@gmail.com', '2026-05-05 18:54:06', '2026-05-05 19:29:45'),
(45, 70, '761f506f0c104e848e24e32f27093327cb14f64465485aaa6047b7576c764e35', '2026-05-12 21:54:10', NULL, NULL, NULL, NULL, NULL, 'Vincente', 'vincentmusheba@gmail.com', '2026-05-05 18:54:10', '2026-05-05 18:54:10'),
(46, 71, '6f3fd0f0a85543322cd5849e0fcf69eee497ec6abf572270e69b478fbcb95d01', '2026-05-12 22:28:46', NULL, NULL, NULL, NULL, NULL, 'Mary', 'momanyid098@gmail.com', '2026-05-05 19:28:46', '2026-05-05 19:28:46');

-- --------------------------------------------------------

--
-- Table structure for table `session_services`
--

CREATE TABLE `session_services` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `assigned_staff_id` int(11) DEFAULT NULL,
  `is_from_appointment` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Marks services carried over from the original appointment',
  `price` decimal(10,2) NOT NULL,
  `status` enum('pending','in_progress','completed','voided') NOT NULL DEFAULT 'pending',
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `session_services`
--

INSERT INTO `session_services` (`id`, `session_id`, `service_id`, `assigned_staff_id`, `is_from_appointment`, `price`, `status`, `start_time`, `end_time`, `notes`, `created_at`) VALUES
(42, 32, 23, 30, 0, 400.00, 'completed', '2026-05-03 19:00:24', '2026-05-03 19:01:00', NULL, '2026-05-03 16:00:24'),
(43, 33, 23, 30, 0, 400.00, 'completed', '2026-05-03 19:05:15', '2026-05-03 19:05:43', NULL, '2026-05-03 16:05:15'),
(44, 34, 23, 30, 0, 400.00, 'completed', '2026-05-03 19:14:54', '2026-05-03 19:15:28', NULL, '2026-05-03 16:14:54'),
(45, 35, 23, 30, 0, 400.00, 'completed', '2026-05-03 19:20:00', '2026-05-03 19:20:51', NULL, '2026-05-03 16:20:00'),
(46, 36, 23, 30, 0, 400.00, 'completed', '2026-05-03 19:25:06', '2026-05-03 19:25:26', NULL, '2026-05-03 16:25:06'),
(47, 37, 23, 30, 0, 400.00, 'completed', '2026-05-03 19:31:19', '2026-05-03 19:31:43', NULL, '2026-05-03 16:31:19'),
(48, 38, 23, 30, 0, 400.00, 'completed', '2026-05-03 19:34:23', '2026-05-03 19:34:46', NULL, '2026-05-03 16:34:23'),
(49, 39, 23, 30, 0, 400.00, 'completed', '2026-05-03 19:39:18', '2026-05-03 19:39:42', NULL, '2026-05-03 16:39:18'),
(50, 40, 23, 30, 0, 400.00, 'completed', '2026-05-03 19:43:28', '2026-05-03 19:44:02', NULL, '2026-05-03 16:43:28'),
(51, 41, 23, 30, 0, 400.00, 'completed', '2026-05-03 20:06:39', '2026-05-03 20:06:58', NULL, '2026-05-03 17:06:39'),
(52, 42, 23, 30, 0, 400.00, 'completed', '2026-05-03 20:09:21', '2026-05-03 20:09:40', NULL, '2026-05-03 17:09:21'),
(54, 44, 42, 20, 0, 250.00, 'completed', '2026-05-03 23:26:33', '2026-05-03 23:27:09', NULL, '2026-05-03 20:26:33'),
(55, 45, 42, 20, 0, 250.00, 'completed', '2026-05-03 23:32:11', '2026-05-03 23:33:57', NULL, '2026-05-03 20:32:11'),
(56, 46, 42, 20, 0, 250.00, 'completed', '2026-05-03 23:36:20', '2026-05-03 23:36:39', NULL, '2026-05-03 20:36:20'),
(57, 47, 23, 20, 0, 400.00, 'completed', '2026-05-03 23:44:48', '2026-05-03 23:45:02', NULL, '2026-05-03 20:44:48'),
(58, 48, 23, 20, 0, 400.00, 'completed', '2026-05-04 06:19:48', '2026-05-04 06:20:20', NULL, '2026-05-04 03:19:48'),
(59, 49, 23, 20, 0, 400.00, 'completed', '2026-05-04 06:24:43', '2026-05-04 06:25:29', NULL, '2026-05-04 03:24:43'),
(60, 50, 23, 20, 0, 400.00, 'completed', '2026-05-04 06:34:56', '2026-05-04 06:36:29', NULL, '2026-05-04 03:34:56'),
(61, 51, 42, 20, 0, 250.00, 'completed', '2026-05-04 06:46:36', '2026-05-04 06:47:22', NULL, '2026-05-04 03:46:36'),
(63, 53, 23, 20, 0, 400.00, 'completed', '2026-05-04 07:00:36', '2026-05-04 07:34:25', NULL, '2026-05-04 04:00:36'),
(64, 54, 23, 20, 0, 400.00, 'completed', '2026-05-04 07:02:38', '2026-05-04 07:06:34', NULL, '2026-05-04 04:02:38'),
(65, 55, 23, 30, 0, 400.00, 'completed', '2026-05-04 07:05:57', '2026-05-04 07:07:51', NULL, '2026-05-04 04:05:57'),
(66, 56, 42, 20, 0, 250.00, 'completed', '2026-05-04 07:12:37', '2026-05-04 07:25:56', NULL, '2026-05-04 04:12:37'),
(67, 57, 42, 20, 0, 250.00, 'completed', '2026-05-04 07:18:16', '2026-05-04 07:26:10', NULL, '2026-05-04 04:18:16'),
(68, 58, 42, 20, 0, 250.00, 'completed', '2026-05-04 07:18:22', '2026-05-04 07:26:21', NULL, '2026-05-04 04:18:22'),
(69, 59, 23, 30, 0, 400.00, 'completed', '2026-05-04 07:18:28', '2026-05-04 07:26:30', NULL, '2026-05-04 04:18:28'),
(70, 60, 23, 20, 0, 400.00, 'completed', '2026-05-04 07:21:13', '2026-05-04 07:26:40', NULL, '2026-05-04 04:21:13'),
(71, 61, 23, 30, 0, 400.00, 'completed', '2026-05-04 07:23:03', '2026-05-04 07:26:50', NULL, '2026-05-04 04:23:03'),
(72, 62, 42, 30, 0, 250.00, 'completed', '2026-05-04 07:25:08', '2026-05-04 07:27:00', NULL, '2026-05-04 04:25:08'),
(73, 63, 42, 30, 0, 250.00, 'completed', '2026-05-04 09:07:59', '2026-05-04 09:08:48', NULL, '2026-05-04 06:07:59'),
(74, 64, 42, 30, 0, 250.00, 'completed', '2026-05-04 09:15:50', '2026-05-04 09:16:33', NULL, '2026-05-04 06:15:50'),
(75, 65, 23, 20, 0, 400.00, 'completed', '2026-05-04 09:20:38', '2026-05-04 09:22:07', NULL, '2026-05-04 06:20:38'),
(76, 66, 23, 30, 0, 400.00, 'completed', '2026-05-04 12:28:12', '2026-05-04 12:29:29', NULL, '2026-05-04 09:28:12'),
(77, 67, 23, 30, 0, 400.00, 'completed', '2026-05-04 13:58:21', '2026-05-04 13:59:19', NULL, '2026-05-04 10:58:21'),
(78, 68, 23, 20, 0, 400.00, 'completed', '2026-05-04 19:57:18', '2026-05-05 21:50:58', NULL, '2026-05-04 16:57:18'),
(79, 69, 117, 18, 0, 700.00, 'completed', '2026-05-05 14:12:45', '2026-05-05 21:51:14', NULL, '2026-05-05 11:12:45'),
(80, 70, 23, 30, 0, 400.00, 'completed', '2026-05-05 21:49:54', '2026-05-05 21:51:27', NULL, '2026-05-05 18:49:54'),
(81, 71, 58, 27, 0, 300.00, 'completed', '2026-05-05 22:25:35', '2026-05-05 22:28:07', NULL, '2026-05-05 19:25:35'),
(94, 85, 118, 13, 0, 5.00, 'pending', NULL, NULL, NULL, '2026-06-27 12:23:57'),
(95, 86, 118, 14, 0, 5.00, 'pending', NULL, NULL, NULL, '2026-06-27 13:39:45'),
(96, 87, 118, 13, 0, 5.00, 'pending', NULL, NULL, NULL, '2026-06-27 13:43:24'),
(97, 88, 28, 13, 0, 400.00, 'pending', NULL, NULL, NULL, '2026-06-27 14:19:42'),
(98, 89, 116, NULL, 0, 600.00, 'pending', NULL, NULL, NULL, '2026-06-28 06:24:51'),
(99, 90, 116, 14, 0, 600.00, 'pending', NULL, NULL, NULL, '2026-06-28 09:08:13'),
(100, 91, 83, 20, 1, 2500.00, 'pending', NULL, NULL, NULL, '2026-06-28 09:26:15');

-- --------------------------------------------------------

--
-- Table structure for table `staffs`
--

CREATE TABLE `staffs` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `id_number` varchar(50) NOT NULL,
  `role` varchar(50) NOT NULL,
  `skill` varchar(100) DEFAULT NULL,
  `commission_rate` decimal(5,2) DEFAULT NULL,
  `additional_info` text DEFAULT NULL,
  `activation_password` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `status` enum('Active','On Leave','Suspended','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staffs`
--

INSERT INTO `staffs` (`id`, `name`, `username`, `email`, `phone`, `id_number`, `role`, `skill`, `commission_rate`, `additional_info`, `activation_password`, `password`, `image_path`, `status`, `created_at`, `updated_at`, `created_by`) VALUES
(12, 'Joseph Ongosh', 'Josongtech', 'ongoshdesktop@gmail.com', '0763640662', '38165164', 'owner', 'Developer/ Maintainer', NULL, 'System Developer and maintainer', NULL, '$2y$10$W/cxqyMJpp24LuA6fYpGzOIZ4nekvlRYsbN743I/EK0ayqRTkibVm', '', 'Active', '2026-04-20 11:30:28', '2026-05-03 08:23:05', 1),
(13, 'Solomon Orodi', 'Solo', 'solomonorody@gmail.com', '0713039001', '31764779', 'attendant', 'Nail technician', NULL, 'Nail technician', NULL, '$2y$10$zPtUhOKYV1s6umqs5hUxxOdIkHFnxCxMcEZ5FKoWTZKaiqZZH4XfW', '', 'Active', '2026-04-20 11:43:20', '2026-04-20 11:49:26', 1),
(14, 'Velma Achola', 'Miss Vee', 'velmaachola8@gmail.com', '0110545902', '41017920', 'attendant', 'Hairdresser/Beautician', NULL, 'Hairdresser/Beautician', NULL, '$2y$10$vkg5OH8jRc7ZlfUz5Mwa2exRF9If/d4MU6hHntmBX6yNWyzVbMpGW', 'uploads/4bdbdb18fc7c20ca67ec2b326e8db829.jpeg', 'Active', '2026-04-20 11:48:08', '2026-05-01 07:17:34', 1),
(15, 'Mary Wanjiru Mungai', 'Shiro', 'marymungai01@gmail.com', '0794820246', '41309623', 'attendant', 'Hairdresser/Beatician', NULL, 'Hairdresser/Beatician', NULL, '$2y$10$HOYLNHYVFxjnl46SJ9dHvOaH9A8TWSN/9/v6cwMFUt2r0TNumhVgi', '', 'Active', '2026-04-20 11:56:32', '2026-04-20 11:57:16', 1),
(16, 'Asha Naisenya', 'Asha', 'naisenyasha88@gmail.com', '0719359796', '37010717', 'attendant', 'Hairdresser/Beautician', NULL, 'Hairdresser/Beautician', NULL, '$2y$10$R/PZmDvkKyDNvaMqyrarRutgH1b.Qeo5e3CmOSyKAqjRIOcl2PyIm', '', 'Active', '2026-04-20 12:01:47', '2026-04-20 12:02:55', 1),
(17, 'TERESIA KINUTHIA', 'Triza', 'trizah4kinuthia1c@gmail.com', '0759052656', '25869540', 'attendant', 'Hairdresser/Beautician', NULL, 'Hairdresser/Beautician', NULL, '$2y$10$fkLo1rLlESz4IsU2z3vF7uaurlTwCTJIfNenRZ9iYVcqqdjV5XyYm', '', 'Active', '2026-04-20 12:11:20', '2026-04-20 12:13:15', 1),
(18, 'Lawrence Thairu', 'Lawrence', 'lawrence.sanyo100@gmail.com', '0728218911', '28644333', 'attendant', 'Nail technician/ Stylist', NULL, 'Nail technician/ Stylist', NULL, '$2y$10$SZ0GkGiYXZ1cJ42jyKph9.AtDTOCb./UwhcWvnGOM.HCDVhq.kRPK', '', 'Active', '2026-04-20 12:21:01', '2026-04-20 12:25:55', 1),
(19, 'Hannah Wanjiku', 'Hannah', 'njugunatafari@gmail.com', '0791082090', '38465088', 'attendant', 'Beautician', NULL, 'Dedicated Beautician with over 5 years of experience in the beauty and wellness industry. Skilled in a wide range of services including facials, skincare treatments, manicures, pedicures, waxing, makeup application, and basic massage techniques.\r\n\r\nStrong understanding of different skin types and beauty products, with the ability to recommend suitable treatments for clients. Known for delivering high-quality services, maintaining strict hygiene standards, and creating a relaxing and professional environment.\r\n\r\nExcellent customer service skills with a passion for client satisfaction, building long-term relationships, and contributing to business growth through professionalism and attention to detail.', NULL, '$2y$10$yyJc4uuJcdIFFCrOnTK/Y.W44jfHYC0i2TtaYRE8pFyvDlgbBdLQq', 'uploads/41de28c145220ac197562a4a73efc156.jpeg', 'Active', '2026-04-20 12:30:46', '2026-05-02 08:33:00', 1),
(20, 'Felix Wanyeki', 'Felix', 'felixfelo041@gmail.com', '0727618381', '37617875', 'attendant', 'Barber', NULL, 'Skilled Barber with over 5 years of experience in grooming and personal care. Expertise in a wide range of services including precision haircuts, fades, beard shaping, shaving, and modern styling techniques.', NULL, '$2y$10$JhZXrbFdjXzlIxu/Ica9DuvNFZDtuJ9oU9.2qVtfzK6TODD09.nra', 'uploads/aebb267b28f936c0297e40f4763a9e70.jpeg', 'Active', '2026-04-20 12:35:24', '2026-05-02 08:30:59', 1),
(25, 'Dismas Momanyi', 'Dismas', 'momanyid098@gmail.com', '0713 553998', '22914334', 'owner', 'management', NULL, 'Management', NULL, '$2y$10$Yust6V3Jx691..q/NEyGoeg41fcVC/tAq9uyNmFzFBmibEZu5HK8C', 'uploads/0baca0737b93d8de453d3664a3632604.jpeg', 'Active', '2026-04-21 07:13:14', '2026-04-23 19:23:27', 1),
(26, 'Mary Wangari', 'Mary', 'marycareh@gmail.com', '0727140581', '33211587', 'manager', 'management', NULL, 'Experienced Spa Manager with 5 years of hands-on experience in the spa and wellness industry. Skilled in daily operations, staff supervision, customer service, sales growth, appointment coordination, inventory control, and maintaining high service standards.\r\n\r\nStrong ability to lead teams, handle client concerns professionally, improve service delivery, and ensure a clean, organized, and relaxing environment for clients. Passionate about growing the business through excellent customer care, teamwork, marketing, and consistent staff performance.', NULL, '$2y$10$dpXhXy06G9r6pMBYdHE8sOjTU3Z7da0AFZ.c7a58vgYQ0npCu6Jg2', 'uploads/a71bf30f302ae85fc37a824ddcac3dcc.jpeg', 'Active', '2026-05-01 06:25:31', '2026-05-02 08:29:10', 1),
(27, 'Grace', 'Grace', 'muigaigrace05@gmail.com', '0706127871', '34356696', 'attendant', 'Nail technician', NULL, 'Nailtechnician', NULL, '$2y$10$nGLr0.RPSzIageVkgA4DCe6YRqUe9emC/w0r2l332yEeKd5OEM0I6', 'uploads/4f18f69a5a6afae854e5ef2566a28244.jpeg', 'Active', '2026-05-01 07:10:50', '2026-05-02 08:26:37', 1),
(28, 'Patriciah', 'Patriciah', 'patriciahrasoa@gmail.com', '0720474157', '37683309', 'attendant', 'Hairdresser', NULL, 'Hairdresser', NULL, '$2y$10$RBalWaIjyMR/6So2cT8VYuhf81sghUKSdN.SHHAq4xDvpP/DWE6Le', 'uploads/80e5d894dde05af2347912622ac26619.jpeg', 'Active', '2026-05-01 07:14:10', '2026-05-02 08:25:55', 1),
(30, 'Allan Mwangi', 'Allan', 'allangassner0@gmail.com', '0757818141', '42865003', 'attendant', 'Barber for 8 years experience ', NULL, 'Experienced Barber with over 8 years of hands-on expertise in grooming, hair styling, beard shaping, and customer service. Skilled in modern and classic cuts, with a strong focus on client satisfaction and precision.', NULL, '$2y$10$JqL.JS4ENJFTqhIA.VrLnutzHZgaYNrT83R8465u2o4Zt9z0wUHi6', 'uploads/d1513778097bf9c52541d2a28eb53d35.jpeg', 'Active', '2026-05-02 06:26:02', '2026-05-02 08:25:08', 1);

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(120) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `value_type` enum('string','number','boolean','json') NOT NULL DEFAULT 'string',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `value_type`, `updated_at`) VALUES
(1, 'commission_pool_rate', '40', 'number', '2026-06-26 13:40:00'),
(2, 'commission_tax_rate', '12', 'number', '2026-06-26 13:40:00'),
(3, 'commission_staff_rate', '10', 'number', '2026-06-26 13:40:00'),
(4, 'offers_enabled', 'true', 'boolean', '2026-06-26 13:40:00'),
(5, 'offers_list', '[\"10% off manicure every Tuesday.\",\"Free beard touch-up after 4 completed visits.\",\"Members get priority weekend slots.\",\"Birthday month facial discount.\"]', 'json', '2026-06-26 13:40:00'),
(6, 'staff_leaves_enabled', 'true', 'boolean', '2026-06-26 13:40:00'),
(7, 'staff_leave_default_days', '21', 'number', '2026-06-26 13:40:00'),
(8, 'staff_leave_requires_approval', 'true', 'boolean', '2026-06-26 13:40:00'),
(1, 'commission_pool_rate', '40', 'number', '2026-06-26 13:40:00'),
(2, 'commission_tax_rate', '12', 'number', '2026-06-26 13:40:00'),
(3, 'commission_staff_rate', '10', 'number', '2026-06-26 13:40:00'),
(4, 'offers_enabled', 'true', 'boolean', '2026-06-26 13:40:00'),
(5, 'offers_list', '[\"10% off manicure every Tuesday.\",\"Free beard touch-up after 4 completed visits.\",\"Members get priority weekend slots.\",\"Birthday month facial discount.\"]', 'json', '2026-06-26 13:40:00'),
(6, 'staff_leaves_enabled', 'true', 'boolean', '2026-06-26 13:40:00'),
(7, 'staff_leave_default_days', '21', 'number', '2026-06-26 13:40:00'),
(8, 'staff_leave_requires_approval', 'true', 'boolean', '2026-06-26 13:40:00'),
(1, 'commission_pool_rate', '40', 'number', '2026-06-26 13:40:00'),
(2, 'commission_tax_rate', '12', 'number', '2026-06-26 13:40:00'),
(3, 'commission_staff_rate', '10', 'number', '2026-06-26 13:40:00'),
(4, 'offers_enabled', 'true', 'boolean', '2026-06-26 13:40:00'),
(5, 'offers_list', '[\"10% off manicure every Tuesday.\",\"Free beard touch-up after 4 completed visits.\",\"Members get priority weekend slots.\",\"Birthday month facial discount.\"]', 'json', '2026-06-26 13:40:00'),
(6, 'staff_leaves_enabled', 'true', 'boolean', '2026-06-26 13:40:00'),
(7, 'staff_leave_default_days', '21', 'number', '2026-06-26 13:40:00'),
(8, 'staff_leave_requires_approval', 'true', 'boolean', '2026-06-26 13:40:00'),
(0, 'loyalty_earn_rate', '10', 'number', '2026-06-28 07:14:34'),
(0, 'loyalty_earn_unit', '100', 'number', '2026-06-28 07:14:34');

-- --------------------------------------------------------

--
-- Table structure for table `token_blacklist`
--

CREATE TABLE `token_blacklist` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `token_jti` varchar(64) NOT NULL,
  `token_type` enum('customer','owner','manager','receptionist','attendant','staff','force_reset') NOT NULL DEFAULT 'customer',
  `user_id` int(10) UNSIGNED NOT NULL,
  `expires_at` int(10) UNSIGNED NOT NULL,
  `blacklisted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `token_blacklist`
--

INSERT INTO `token_blacklist` (`id`, `token_jti`, `token_type`, `user_id`, `expires_at`, `blacklisted_at`) VALUES
(0, 'db39d1fcee36ee5bf1c1e22d3b9cc7e2', 'owner', 12, 1782561825, '2026-06-26 23:36:13');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff','customer') DEFAULT 'customer',
  `loyalty_points` int(11) DEFAULT 0,
  `loyalty_tier` enum('Bronze','Silver','Gold') DEFAULT 'Bronze',
  `status` enum('Active','Inactive','Suspended') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `role`, `loyalty_points`, `loyalty_tier`, `status`, `created_at`, `updated_at`) VALUES
(4, 'Joseph Ongosh', 'ongoshdesktop@gmail.com', '0763640662', '$2y$10$q75GIzI0TlIxAyCisWKlrOHxpPgi49ImeUnwC2Mm82zDfdHiSBnW2', 'customer', 250, 'Silver', 'Active', '2026-04-20 13:16:54', '2026-06-28 09:29:34');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_activity_category` (`category`),
  ADD KEY `idx_activity_actor` (`actor_type`,`actor_id`),
  ADD KEY `idx_activity_created_at` (`created_at`),
  ADD KEY `idx_activity_entity` (`entity_type`,`entity_id`);

--
-- Indexes for table `addons`
--
ALTER TABLE `addons`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `appointment_code` (`appointment_code`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indexes for table `appointment_manage_tokens`
--
ALTER TABLE `appointment_manage_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`),
  ADD UNIQUE KEY `uq_appointment_manage_tokens_appointment` (`appointment_id`);

--
-- Indexes for table `appointment_services`
--
ALTER TABLE `appointment_services`
  ADD KEY `idx_appointment_services_appointment` (`appointment_id`),
  ADD KEY `idx_appointment_services_service` (`service_id`);

--
-- Indexes for table `commissions`
--
ALTER TABLE `commissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_commissions_session_staff_service_source` (`session_id`,`staff_id`,`service_id`,`source_type`),
  ADD UNIQUE KEY `idx_commissions_session_service` (`session_service_id`),
  ADD KEY `staff_id` (`staff_id`),
  ADD KEY `fk_commissions_service` (`service_id`),
  ADD KEY `idx_commissions_settlement_batch` (`settlement_batch_id`);

--
-- Indexes for table `commission_rules`
--
ALTER TABLE `commission_rules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `commission_settlement_batches`
--
ALTER TABLE `commission_settlement_batches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD KEY `idx_expenses_status` (`status`),
  ADD KEY `idx_expenses_expense_date` (`expense_date`);

--
-- Indexes for table `inhouse_service_requests`
--
ALTER TABLE `inhouse_service_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_inhouse_member` (`member_id`),
  ADD KEY `fk_inhouse_service` (`service_id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD KEY `idx_password_resets_token` (`token`),
  ADD KEY `idx_password_resets_user_id` (`user_id`);

--
-- Indexes for table `payment_audit_log`
--
ALTER TABLE `payment_audit_log`
  ADD KEY `idx_payment_audit_session_id` (`session_id`),
  ADD KEY `idx_payment_audit_event_type` (`event_type`),
  ADD KEY `idx_payment_audit_created_at` (`created_at`),
  ADD KEY `idx_payment_audit_tracking_id` (`pesapal_order_tracking_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_stock_movements`
--
ALTER TABLE `product_stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_created` (`product_id`,`created_at`);

--
-- Indexes for table `redemptions`
--
ALTER TABLE `redemptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `member_id` (`member_id`),
  ADD KEY `reward_id` (`reward_id`);

--
-- Indexes for table `rewards`
--
ALTER TABLE `rewards`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `schema_migrations`
--
ALTER TABLE `schema_migrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `migration` (`migration`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_services_category` (`category_id`),
  ADD KEY `fk_services_commission_rule` (`commission_rule_id`);

--
-- Indexes for table `service_categories`
--
ALTER TABLE `service_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `service_products`
--
ALTER TABLE `service_products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_service_product` (`service_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_code` (`session_code`),
  ADD KEY `staff_id` (`staff_id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `fk_sessions_appointment` (`appointment_id`),
  ADD KEY `idx_sessions_billing_status` (`billing_status`);

--
-- Indexes for table `session_feedback`
--
ALTER TABLE `session_feedback`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`),
  ADD UNIQUE KEY `uq_session_feedback_session` (`session_id`);

--
-- Indexes for table `session_services`
--
ALTER TABLE `session_services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `idx_session_services_session_status` (`session_id`,`status`),
  ADD KEY `idx_session_services_assigned_staff` (`assigned_staff_id`);

--
-- Indexes for table `staffs`
--
ALTER TABLE `staffs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD UNIQUE KEY `id_number` (`id_number`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `token_blacklist`
--
ALTER TABLE `token_blacklist`
  ADD KEY `idx_token_blacklist_jti` (`token_jti`),
  ADD KEY `idx_token_blacklist_expires` (`expires_at`),
  ADD KEY `idx_token_blacklist_user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `appointment_manage_tokens`
--
ALTER TABLE `appointment_manage_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `commissions`
--
ALTER TABLE `commissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT for table `commission_rules`
--
ALTER TABLE `commission_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `commission_settlement_batches`
--
ALTER TABLE `commission_settlement_batches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `inhouse_service_requests`
--
ALTER TABLE `inhouse_service_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `product_stock_movements`
--
ALTER TABLE `product_stock_movements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `redemptions`
--
ALTER TABLE `redemptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rewards`
--
ALTER TABLE `rewards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `schema_migrations`
--
ALTER TABLE `schema_migrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=119;

--
-- AUTO_INCREMENT for table `service_categories`
--
ALTER TABLE `service_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `service_products`
--
ALTER TABLE `service_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=92;

--
-- AUTO_INCREMENT for table `session_feedback`
--
ALTER TABLE `session_feedback`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `session_services`
--
ALTER TABLE `session_services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT for table `staffs`
--
ALTER TABLE `staffs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staffs` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `appointment_manage_tokens`
--
ALTER TABLE `appointment_manage_tokens`
  ADD CONSTRAINT `fk_appointment_manage_tokens_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `commissions`
--
ALTER TABLE `commissions`
  ADD CONSTRAINT `commissions_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staffs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `commissions_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_commissions_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_commissions_session_service` FOREIGN KEY (`session_service_id`) REFERENCES `session_services` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_commissions_settlement_batch` FOREIGN KEY (`settlement_batch_id`) REFERENCES `commission_settlement_batches` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `commission_settlement_batches`
--
ALTER TABLE `commission_settlement_batches`
  ADD CONSTRAINT `commission_settlement_batches_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staffs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `inhouse_service_requests`
--
ALTER TABLE `inhouse_service_requests`
  ADD CONSTRAINT `fk_inhouse_member` FOREIGN KEY (`member_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_inhouse_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`);

--
-- Constraints for table `product_stock_movements`
--
ALTER TABLE `product_stock_movements`
  ADD CONSTRAINT `fk_product_stock_movements_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `redemptions`
--
ALTER TABLE `redemptions`
  ADD CONSTRAINT `redemptions_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `redemptions_ibfk_2` FOREIGN KEY (`reward_id`) REFERENCES `rewards` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `fk_services_category` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_services_commission_rule` FOREIGN KEY (`commission_rule_id`) REFERENCES `commission_rules` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `service_products`
--
ALTER TABLE `service_products`
  ADD CONSTRAINT `service_products_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `service_products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `fk_sessions_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staffs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `sessions_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `session_feedback`
--
ALTER TABLE `session_feedback`
  ADD CONSTRAINT `fk_session_feedback_session` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `session_services`
--
ALTER TABLE `session_services`
  ADD CONSTRAINT `fk_session_services_assigned_staff` FOREIGN KEY (`assigned_staff_id`) REFERENCES `staffs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `session_services_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `session_services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
