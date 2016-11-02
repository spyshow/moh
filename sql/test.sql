-- phpMyAdmin SQL Dump
-- version 4.6.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 02, 2016 at 12:14 AM
-- Server version: 5.7.14
-- PHP Version: 5.6.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `test`
--

-- --------------------------------------------------------

--
-- Table structure for table `actions`
--

CREATE TABLE `actions` (
  `id` int(11) NOT NULL,
  `issue_id` int(11) NOT NULL,
  `description` text COLLATE utf8mb4_german2_ci NOT NULL,
  `date` varchar(10) COLLATE utf8mb4_german2_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_german2_ci;

--
-- Dumping data for table `actions`
--

INSERT INTO `actions` (`id`, `issue_id`, `description`, `date`) VALUES
(1, 10, 'description(1) description(1) description(1) description(1) description(1) description(1) description(1) description(1) ', '2016-10-21'),
(2, 10, 'description(2) description(2) description(2) description(2) description(2) description(2) description(2) description(2) description(2) description(2) ', '2016-10-19'),
(3, 6, 'description(3) description(3) description(3) description(3) description(3) description(3) description(3) description(3) description(3) description(3) ', '2016-10-01'),
(4, 6, 'description(4) description(4) description(4) description(4) description(4) description(4) description(4) description(4) ', '2016-10-12'),
(5, 10, 'description(5) description(5) description(5) description(5) description(5) description(5) description(5) description(5) description(5) description(5) ', '2016-10-29'),
(6, 9, 'new action 1', '2016-10-30'),
(7, 10, 'hiiii', '2016-11-1'),
(8, 9, 'new action 2', '2016-11-1'),
(9, 9, 'new action 3', '2016-11-1'),
(10, 9, 'new action 4', '2016-11-1'),
(11, 9, 'new action 5', '2016-11-1'),
(12, 9, '6', '2016-11-1'),
(13, 9, '7', '2016-11-1'),
(14, 10, '1', '2016-11-1'),
(15, 10, '2', '2016-11-1');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `system` varchar(50) NOT NULL,
  `sn` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `system`, `sn`) VALUES
(1, 'name(1)s', 'System(1)sd', 111111111),
(2, 'dadassdasd', 'msi', 33224421),
(3, 'sham12312', 'msi', 3322441),
(4, 'sham ', 'msi', 332244),
(5, 'dada', 'msirr', 1111111),
(6, 'dady', 'system(1)', 11111);

-- --------------------------------------------------------

--
-- Table structure for table `issues`
--

CREATE TABLE `issues` (
  `id` int(11) NOT NULL,
  `project_id` int(8) NOT NULL,
  `dbid` int(11) NOT NULL,
  `date` varchar(10) CHARACTER SET utf8 COLLATE utf8_german2_ci NOT NULL,
  `work` varchar(40) CHARACTER SET utf8 COLLATE utf8_german2_ci NOT NULL,
  `area` int(2) NOT NULL,
  `key` int(2) NOT NULL,
  `defect` int(8) NOT NULL,
  `charm` int(8) NOT NULL,
  `status` decimal(4,0) NOT NULL,
  `no_further_action` tinyint(1) NOT NULL DEFAULT '0',
  `baseline` varchar(50) CHARACTER SET utf8 COLLATE utf8_german2_ci NOT NULL,
  `cd` varchar(10) CHARACTER SET utf8 COLLATE utf8_german2_ci NOT NULL,
  `reproducible` int(2) NOT NULL,
  `priority` int(2) NOT NULL,
  `messenger` int(2) NOT NULL,
  `summary` text CHARACTER SET utf8 COLLATE utf8_german2_ci NOT NULL,
  `description` text CHARACTER SET utf8 COLLATE utf8_german2_ci NOT NULL,
  `description_de` text CHARACTER SET utf8 COLLATE utf8_german2_ci NOT NULL,
  `solution` text CHARACTER SET utf8 COLLATE utf8_german2_ci NOT NULL,
  `solution_baseline` varchar(10) CHARACTER SET utf8 COLLATE utf8_german2_ci NOT NULL,
  `c2c` text CHARACTER SET utf8 COLLATE utf8_german2_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `issues`
--

INSERT INTO `issues` (`id`, `project_id`, `dbid`, `date`, `work`, `area`, `key`, `defect`, `charm`, `status`, `no_further_action`, `baseline`, `cd`, `reproducible`, `priority`, `messenger`, `summary`, `description`, `description_de`, `solution`, `solution_baseline`, `c2c`) VALUES
(6, 1, 1111323, '2016-10-07', 'jiji', 2, 2, 123123, 12121212, '4', 1, '123123', '14', 1, 1, 1, 'summary(1)', 'description(1) description(1) description(1) description(1) description(1) description(1) ', 'description de(1) description de(1) description de(1) description de(1) description de(1) description de(1) description de(1) description de(1) ', 'solution(1) solution(1) solution(1) solution(1) solution(1) solution(1) solution(1) solution(1) solution(1) solution(1) solution(1) solution(1) ', 'CD15', 'sfdasdfas'),
(8, 4, 23123223, '2016-10-07', 'jihad khorfan', 1, 1, 123123, 33323, '4', 0, '124124', '', 1, 1, 1, 'summary(2)', 'description(2) description(2) description(2) description(2) description(2) description(2) description(2) description(2) ', 'description de(2) description de(2) description de(2) description de(2) description de(2) description de(2) description de(2) description de(2) ', 'solution(2) solution(2) solution(2) solution(2) solution(2) solution(2) ', 'CD14', 'asd'),
(9, 1, 66661111, '2016-10-07', 'eyad', 1, 1, 123123, 33323, '4', 1, '124124', '10', 1, 1, 1, 'summary(3)', 'description(3) description(3) description(3) description(3) description(3) description(3) description(3) description(3) ', 'description de(3) description de(3) description de(3) description de(3) description de(3) description de(3) description de(3) description de(3) description de(3) description de(3) ', 'solution(3) solution(3) solution(3) solution(3) solution(3) solution(3) ', 'CD14', 'asd'),
(10, 1, 424242, '2016-10-07', 'ashraf', 1, 1, 123123, 33323, '4', 0, '124124', '1', 1, 1, 1, 'summary(4)', 'description(4) description(4) description(4) description(4) description(4) description(4) description(4) description(4) ', 'description de(4) description de(4) description de(4) description de(4) description de(4) description de(4) description de(4) description de(4) ', 'solution(4) solution(4) solution(4) solution(4) solution(4) solution(4) ', 'CD14', 'asd');

-- --------------------------------------------------------

--
-- Table structure for table `issues_customers`
--

CREATE TABLE `issues_customers` (
  `issue_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `issues_customers`
--

INSERT INTO `issues_customers` (`issue_id`, `customer_id`) VALUES
(6, 1),
(8, 1),
(10, 1),
(6, 2),
(8, 2),
(9, 3),
(10, 3),
(8, 4),
(8, 5);

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `project_name` varchar(15) NOT NULL,
  `charm` tinyint(1) NOT NULL,
  `tsf` tinyint(1) NOT NULL,
  `cpf_doc_id` int(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `project_name`, `charm`, `tsf`, `cpf_doc_id`) VALUES
(1, 'VE11A', 1, 0, 34545321),
(2, 'VF6454', 0, 1, 99937711),
(4, 'VE2A44', 1, 0, 34542123),
(5, 'SF6454', 0, 1, 1111122);

-- --------------------------------------------------------

--
-- Table structure for table `projects_customers`
--

CREATE TABLE `projects_customers` (
  `project_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `projects_customers`
--

INSERT INTO `projects_customers` (`project_id`, `customer_id`) VALUES
(1, 1),
(1, 2),
(1, 3);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `actions`
--
ALTER TABLE `actions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `issue_id` (`issue_id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `issues`
--
ALTER TABLE `issues`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `issues` ADD FULLTEXT KEY `search` (`summary`);

--
-- Indexes for table `issues_customers`
--
ALTER TABLE `issues_customers`
  ADD PRIMARY KEY (`issue_id`,`customer_id`),
  ADD KEY `fk_cus_id` (`customer_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `projects_customers`
--
ALTER TABLE `projects_customers`
  ADD PRIMARY KEY (`project_id`,`customer_id`),
  ADD KEY `fk_pro2cust_id` (`customer_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `actions`
--
ALTER TABLE `actions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
--
-- AUTO_INCREMENT for table `issues`
--
ALTER TABLE `issues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `actions`
--
ALTER TABLE `actions`
  ADD CONSTRAINT `actions_ibfk_1` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `issues_customers`
--
ALTER TABLE `issues_customers`
  ADD CONSTRAINT `fk_cus_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_issue_id ` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `projects_customers`
--
ALTER TABLE `projects_customers`
  ADD CONSTRAINT `fk_pro2cust_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_project_id ` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
