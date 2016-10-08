-- phpMyAdmin SQL Dump
-- version 4.6.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 08, 2016 at 06:58 PM
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
-- Table structure for table `issues`
--

CREATE TABLE `issues` (
  `id` int(11) NOT NULL,
  `project_id` int(8) NOT NULL,
  `dbid` int(11) NOT NULL,
  `date` date NOT NULL,
  `work` varchar(40) NOT NULL,
  `area` int(2) NOT NULL,
  `key` int(2) NOT NULL,
  `defect` int(8) NOT NULL,
  `charm` int(8) NOT NULL,
  `status` decimal(4,0) NOT NULL,
  `no_further_action` tinyint(1) NOT NULL DEFAULT '0',
  `baseline` varchar(50) NOT NULL,
  `reproducible` int(2) NOT NULL,
  `priority` int(2) NOT NULL,
  `messenger` int(2) NOT NULL,
  `summary` text NOT NULL,
  `description` text NOT NULL,
  `solution` text NOT NULL,
  `solution_baseline` varchar(10) NOT NULL,
  `c2c` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `issues`
--

INSERT INTO `issues` (`id`, `project_id`, `dbid`, `date`, `work`, `area`, `key`, `defect`, `charm`, `status`, `no_further_action`, `baseline`, `reproducible`, `priority`, `messenger`, `summary`, `description`, `solution`, `solution_baseline`, `c2c`) VALUES
(4, 1, 1512411, '2016-10-07', 'ashraf', 1, 2, 112665, 556985, '2', 0, 'N4_LATEST_VE11B_20150402_P1', 3, 2, 2, 'summarysummarysummarysummary', 'descriptiondescriptiondescription', 'solutionsolutionsolution', 'CD12', 'c2cc2cc2cc2cc2cc2cc2cc2c'),
(5, 1, 1111323, '2016-10-07', 'jiji', 1, 1, 123123, 12121212, '3', 1, '123123', 1, 1, 1, 'safsdfas', 'fasdfasdf', 'asdfasdf', 'CD15', 'sfdasdfas'),
(6, 1, 1111323, '2016-10-07', 'jiji', 2, 2, 123123, 12121212, '4', 1, '123123', 1, 1, 1, 'safsdfas', 'fasdfasdf', 'asdfasdf', 'CD15', 'sfdasdfas'),
(7, 1, 22222, '2016-10-07', 'lolp', 1, 1, 123123, 33323, '4', 0, '124124', 1, 1, 1, 'sada', 'dasd', 'asd', 'CD14', 'asd');

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

--
-- Indexes for dumped tables
--

--
-- Indexes for table `issues`
--
ALTER TABLE `issues`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `issues`
--
ALTER TABLE `issues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
