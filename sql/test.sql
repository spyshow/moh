-- phpMyAdmin SQL Dump
-- version 4.6.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 12, 2016 at 07:18 AM
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
(15, 10, '2', '2016-11-1'),
(16, 10, 'new video action', '2016-11-6'),
(17, 10, '1 .. 2 .. 3 .. action !!!', '2016-11-6'),
(18, 17, '1', '2016-11-8'),
(19, 17, ' 2', '2016-11-8');

-- --------------------------------------------------------

--
-- Table structure for table `baselines`
--

CREATE TABLE `baselines` (
  `id` int(11) NOT NULL,
  `name` varchar(100) CHARACTER SET utf8 COLLATE utf8_german2_ci NOT NULL,
  `cd` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_german2_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `baselines`
--

INSERT INTO `baselines` (`id`, `name`, `cd`) VALUES
(1, 'N4_VE11B_LATEST_20150402', 'CD#12'),
(2, 'N5_VE11B_LATEST_20150425', 'CD#13'),
(3, 'via prerel 20140425 1222 CUT', 'CD#14'),
(4, '20140425 333 CUT', 'CD#15'),
(5, 'sssss 20140425 1222 CUT', 'CD#16'),
(6, 'nnnn 20140425 1222 CUT', 'CD#16'),
(7, 'nnnn 20140425 1222 CUT', 'CD#17'),
(29, 'aaa 1222 CUT', 'CD#25');

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
(3, 'sham12312sd', 'msi', 3322441),
(4, 'sham ', 'msi', 332244),
(5, 'dada', 'msirr', 1111111),
(6, 'dady', 'system(1)', 11111);

-- --------------------------------------------------------

--
-- Table structure for table `files`
--

CREATE TABLE `files` (
  `id` int(11) NOT NULL,
  `issue_id` int(10) NOT NULL,
  `type` varchar(15) COLLATE utf8_german2_ci NOT NULL,
  `path` varchar(100) COLLATE utf8_german2_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_german2_ci;

--
-- Dumping data for table `files`
--

INSERT INTO `files` (`id`, `issue_id`, `type`, `path`) VALUES
(14, 6, 'Savelog', '1111323'),
(15, 35, 'Patient data', 'f:/data/logfile.log');

-- --------------------------------------------------------

--
-- Table structure for table `issues`
--

CREATE TABLE `issues` (
  `id` int(11) NOT NULL,
  `project_id` int(8) NOT NULL,
  `date` varchar(10) CHARACTER SET utf8 COLLATE utf8_german2_ci DEFAULT NULL,
  `work` varchar(40) CHARACTER SET utf8 COLLATE utf8_german2_ci DEFAULT NULL,
  `area` int(2) DEFAULT NULL,
  `key` int(2) DEFAULT NULL,
  `defect` int(8) DEFAULT NULL,
  `charm` int(8) DEFAULT NULL,
  `status` decimal(4,0) DEFAULT NULL,
  `no_further_action` tinyint(1) NOT NULL DEFAULT '0',
  `baseline` varchar(50) CHARACTER SET utf8 COLLATE utf8_german2_ci DEFAULT NULL,
  `cd` varchar(10) CHARACTER SET utf8 COLLATE utf8_german2_ci DEFAULT NULL,
  `reproducible` int(2) NOT NULL DEFAULT '1',
  `priority` int(2) NOT NULL DEFAULT '1',
  `messenger` int(2) NOT NULL DEFAULT '1',
  `summary` text CHARACTER SET utf8 COLLATE utf8_german2_ci,
  `description` text CHARACTER SET utf8 COLLATE utf8_german2_ci,
  `description_de` text CHARACTER SET utf8 COLLATE utf8_german2_ci,
  `solution` text CHARACTER SET utf8 COLLATE utf8_german2_ci,
  `solution_de` text CHARACTER SET utf8 COLLATE utf8_german2_ci,
  `c2c` text CHARACTER SET utf8 COLLATE utf8_german2_ci
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `issues`
--

INSERT INTO `issues` (`id`, `project_id`, `date`, `work`, `area`, `key`, `defect`, `charm`, `status`, `no_further_action`, `baseline`, `cd`, `reproducible`, `priority`, `messenger`, `summary`, `description`, `description_de`, `solution`, `solution_de`, `c2c`) VALUES
(6, 1, '2016-10-07', 'jiji', 2, 2, 123123, 12121212, '4', 1, '123123', '14', 1, 1, 1, 'summary(1)', 'description(1) description(1) description(1) description(1) description(1) description(1) ', 'description de(1) description de(1) description de(1) description de(1) description de(1) description de(1) description de(1) description de(1) ', 'solution(1) solution(1) solution(1) solution(1) solution(1) solution(1) solution(1) solution(1) solution(1) solution(1) solution(1) solution(1) ', 'CD15', 'sfdasdfas'),
(8, 4, '2016-10-07', 'jihad khorfan', 1, 1, 123123, 33323, '4', 0, '124124', '', 1, 1, 1, 'summary(2)', 'description(2) description(2) description(2) description(2) description(2) description(2) description(2) description(2) ', 'description de(2) description de(2) description de(2) description de(2) description de(2) description de(2) description de(2) description de(2) ', 'solution(2) solution(2) solution(2) solution(2) solution(2) solution(2) ', 'CD14', 'asd'),
(9, 1, '2016-10-07', 'eyad', 1, 1, NULL, NULL, '4', 1, '124124', '10', 1, 1, 1, 'summary(3)', 'description(3) description(3) description(3) description(3) description(3) description(3) description(3) description(3) ', 'description de(3) description de(3) description de(3) description de(3) description de(3) description de(3) description de(3) description de(3) description de(3) description de(3) ', 'solution(3) solution(3) solution(3) solution(3) solution(3) solution(3) ', 'CD14', 'asd'),
(10, 1, '2016-10-07', 'ashraf', 1, 1, 123123, 33323, '4', 0, '124124', '1', 1, 1, 1, 'summary(4)', 'description(4) description(4) description(4) description(4) description(4) description(4) description(4) description(4) ', 'description de(4) description de(4) description de(4) description de(4) description de(4) description de(4) description de(4) description de(4) ', 'solution(4) solution(4) solution(4) solution(4) solution(4) solution(4) ', 'CD14', 'soso'),
(17, 1, '2016-11-8', 'CUT-Team', 3, 17, NULL, NULL, '4', 0, 'baseline 17 vb', 'CD17', 2, 2, 2, 'summary 17 summary 17 summary 17 summary 17 summary 17 summary 17 ', 'description 17 description 17 description 17 description 17 description 17 description 17 description 17 description 17 description 17 ', 'description de 17 description de 17 description de 17 description de 17 description de 17 description de 17 description de 17 description de 17 ', 'solution 17 solution 17 solution 17 solution 17 solution 17 solution 17 ', 'solution de 17 solution de 17 solution de 17 solution de 17 ', 'c2c 17'),
(35, 1, '2016-11-8', 'CUT-Team', 1, 123, NULL, 123, NULL, 0, 'sasd', '', 1, 1, 1, '', 'asdasd', 'description(4)', '', '', 'c2c');

-- --------------------------------------------------------

--
-- Table structure for table `issues_baselines`
--

CREATE TABLE `issues_baselines` (
  `issue_id` int(11) NOT NULL,
  `baseline_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `issues_baselines`
--

INSERT INTO `issues_baselines` (`issue_id`, `baseline_id`) VALUES
(6, 1),
(9, 1),
(8, 2),
(10, 3),
(17, 4),
(35, 29);

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
(9, 1),
(10, 1),
(6, 2),
(8, 2),
(35, 2),
(9, 3),
(17, 3),
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
  `cpf_doc_id` int(8) NOT NULL,
  `realvsn` varchar(15) CHARACTER SET utf8 COLLATE utf8_german2_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `project_name`, `charm`, `tsf`, `cpf_doc_id`, `realvsn`) VALUES
(1, 'VE11A', 1, 0, 34545321, '1'),
(2, 'VF6454', 0, 1, 99937711, '2'),
(4, 'VE2A44', 1, 0, 34542123, '4'),
(5, 'SF6454', 0, 1, 1111122, '5');

-- --------------------------------------------------------

--
-- Table structure for table `projects_baselines`
--

CREATE TABLE `projects_baselines` (
  `project_id` int(11) NOT NULL,
  `baseline_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_german2_ci;

--
-- Dumping data for table `projects_baselines`
--

INSERT INTO `projects_baselines` (`project_id`, `baseline_id`) VALUES
(1, 1),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(1, 13),
(1, 14),
(1, 15),
(1, 16),
(1, 17),
(1, 18),
(1, 19),
(1, 20),
(1, 21),
(1, 22),
(1, 23),
(1, 24),
(1, 25),
(1, 26),
(1, 27),
(1, 28),
(1, 29);

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
-- Indexes for table `baselines`
--
ALTER TABLE `baselines`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `issue_id` (`issue_id`);

--
-- Indexes for table `issues`
--
ALTER TABLE `issues`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `issues` ADD FULLTEXT KEY `search` (`summary`);

--
-- Indexes for table `issues_baselines`
--
ALTER TABLE `issues_baselines`
  ADD PRIMARY KEY (`baseline_id`,`issue_id`),
  ADD KEY `baseline_id` (`baseline_id`),
  ADD KEY `issue_id` (`issue_id`);

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
-- Indexes for table `projects_baselines`
--
ALTER TABLE `projects_baselines`
  ADD PRIMARY KEY (`project_id`,`baseline_id`),
  ADD KEY `baseline_id` (`baseline_id`),
  ADD KEY `baseline_id_2` (`baseline_id`),
  ADD KEY `baseline_id_3` (`baseline_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;
--
-- AUTO_INCREMENT for table `baselines`
--
ALTER TABLE `baselines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;
--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
--
-- AUTO_INCREMENT for table `files`
--
ALTER TABLE `files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
--
-- AUTO_INCREMENT for table `issues`
--
ALTER TABLE `issues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;
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
-- Constraints for table `files`
--
ALTER TABLE `files`
  ADD CONSTRAINT `files_ibfk_1` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`);

--
-- Constraints for table `issues_baselines`
--
ALTER TABLE `issues_baselines`
  ADD CONSTRAINT `issues_baselines_ibfk_1` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `issues_baselines_ibfk_2` FOREIGN KEY (`baseline_id`) REFERENCES `baselines` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `issues_customers`
--
ALTER TABLE `issues_customers`
  ADD CONSTRAINT `fk_cus_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_issue_id ` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `projects_baselines`
--
ALTER TABLE `projects_baselines`
  ADD CONSTRAINT `fk_base2base` FOREIGN KEY (`baseline_id`) REFERENCES `baselines` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pro2base` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `projects_customers`
--
ALTER TABLE `projects_customers`
  ADD CONSTRAINT `fk_pro2cust_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_project_id ` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
