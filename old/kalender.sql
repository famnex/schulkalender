-- phpMyAdmin SQL Dump
-- version 5.2.1deb1+focal2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Erstellungszeit: 18. Feb 2026 um 12:28
-- Server-Version: 8.0.42-0ubuntu0.20.04.1
-- PHP-Version: 8.3.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `kalender`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `kalender`
--

CREATE TABLE `kalender` (
  `ID` int NOT NULL,
  `Titel` text NOT NULL,
  `Link` text NOT NULL,
  `Zusatz` tinyint(1) NOT NULL,
  `Kurzel` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Daten für Tabelle `kalender`
--

INSERT INTO `kalender` (`ID`, `Titel`, `Link`, `Zusatz`, `Kurzel`) VALUES
(2, 'Abwesenheiten', 'https://outlook.office365.com/owa/calendar/9355ff9a969c4a70bbaf12207edfe61c@mso-hef.de/9af87a6808c74642803dd271e41b7aa516310206584433073755/calendar.ics', 0, 'ABW'),
(5, 'Klausurenpläne', 'https://outlook.office365.com/owa/calendar/9355ff9a969c4a70bbaf12207edfe61c@mso-hef.de/e53e9346ce0f4e27bb3e959228c1301a8911110510699153954/calendar.ics', 0, 'KLA'),
(6, 'Konferenzen', 'https://outlook.office365.com/owa/calendar/9355ff9a969c4a70bbaf12207edfe61c@mso-hef.de/9b396d6983bd4cf0bf74d22f55aaa39f15299478974309111034/calendar.ics', 0, 'KON'),
(9, 'Veranstaltungen', 'https://outlook.office365.com/owa/calendar/9355ff9a969c4a70bbaf12207edfe61c@mso-hef.de/cd0e32000523409e97ba4c8166e602eb15191627349903925046/calendar.ics', 0, 'VER'),
(10, 'Abitur, Prüfungen, Noten', 'https://outlook.office365.com/owa/calendar/9355ff9a969c4a70bbaf12207edfe61c@mso-hef.de/bb8ab34ff1864280a2b01f38fe3e61bd3376992564942684286/calendar.ics', 0, 'APN');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `link`
--

CREATE TABLE `link` (
  `ID` varchar(11) NOT NULL,
  `link` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Tags`
--

CREATE TABLE `Tags` (
  `Name` text NOT NULL,
  `Tag` varchar(10) NOT NULL,
  `Kategorie` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Daten für Tabelle `Tags`
--

INSERT INTO `Tags` (`Name`, `Tag`, `Kategorie`) VALUES
('10B', 'ABW:10B', 2),
('10BFS', 'ABW:10BFS', 2),
('10BÜ', 'ABW:10BUE', 2),
('10eCo', 'ABW:10eCo', 2),
('10EH', 'ABW:10EH', 2),
('10Fla', 'ABW:10Fla', 2),
('10Flo', 'ABW:10Flo', 2),
('10GH', 'ABW:10GH', 2),
('10IN', 'ABW:10IN', 2),
('10Info', 'ABW:10Info', 2),
('10SFA', 'ABW:10SFA', 2),
('11B', 'ABW:11B', 2),
('11BFS', 'ABW:11BFS', 2),
('11BÜ', 'ABW:11BUE', 2),
('11eCo', 'ABW:11eCo', 2),
('11EH', 'ABW:11EH', 2),
('11Fla', 'ABW:11Fla', 2),
('11Flo', 'ABW:11Flo', 2),
('11FO', 'ABW:11FO', 2),
('11GH', 'ABW:11GH', 2),
('11IN', 'ABW:11IN', 2),
('11Info', 'ABW:11Info', 2),
('11SFA', 'ABW:11SFA', 2),
('12B', 'ABW:12B', 2),
('12BÜ', 'ABW:12BUE', 2),
('12eCo', 'ABW:12eCo', 2),
('12EH', 'ABW:12EH', 2),
('12Fla', 'ABW:12Fla', 2),
('12Flo', 'ABW:12Flo', 2),
('12FO', 'ABW:12FO', 2),
('12GH', 'ABW:12GH', 2),
('12IN', 'ABW:12IN', 2),
('12Info', 'ABW:12Info', 2),
('12SFA', 'ABW:12SFA', 2),
('Allgemeine', 'ABW:ALL', 2),
('E1', 'ABW:E1', 2),
('E2', 'ABW:E2', 2),
('Q1', 'ABW:Q1', 2),
('Q2', 'ABW:Q2', 2),
('Q3', 'ABW:Q3', 2),
('Q4', 'ABW:Q4', 2),
('Prüfungen: BFS', 'APN:BFS', 10),
('Prüfungen: Fachschule', 'APN:FAS', 10),
('Prüfungen: FOS', 'APN:FOS', 10),
('Prüfungen: Gymnasium', 'APN:GYM', 10),
('Prüfungen: Teilzeit', 'APN:TEZ', 10),
('E1_A', 'KLA:E1_A', 5),
('E1_B', 'KLA:E1_B', 5),
('E1_C', 'KLA:E1_C', 5),
('E1_D', 'KLA:E1_D', 5),
('E2_A', 'KLA:E2_A', 5),
('E2_B', 'KLA:E2_B', 5),
('E2_C', 'KLA:E2_C', 5),
('E2_D', 'KLA:E2_D', 5),
('E2_E', 'KLA:E2_E', 5),
('E2_F', 'KLA:E2_F', 5),
('E2_G', 'KLA:E2_G', 5),
('E2_H', 'KLA:E2_H', 5),
('E2_I', 'KLA:E2_I', 5),
('E2_J', 'KLA:E2_J', 5),
('E2_LK2', 'KLA:E2_LK2', 5),
('E2 Vergleichsarbeiten', 'KLA:E2_VG', 5),
('Nachschriften', 'KLA:Nac', 5),
('Q1_A', 'KLA:Q1_A', 5),
('Q1_B', 'KLA:Q1_B', 5),
('Q1_C', 'KLA:Q1_C', 5),
('Q1_D', 'KLA:Q1_D', 5),
('Q1_E', 'KLA:Q1_E', 5),
('Q1_F', 'KLA:Q1_F', 5),
('Q1_G', 'KLA:Q1_G', 5),
('Q1_H', 'KLA:Q1_H', 5),
('Q1_I', 'KLA:Q1_I', 5),
('Q1_J', 'KLA:Q1_J', 5),
('Q1_K', 'KLA:Q1_K', 5),
('Q1_LK2', 'KLA:Q1_LK2', 5),
('Q1 Vergleichsarbeiten', 'KLA:Q1_VG', 5),
('Q2_A', 'KLA:Q2_A', 5),
('Q2_B', 'KLA:Q2_B', 5),
('Q2_C', 'KLA:Q2_C', 5),
('Q2_D', 'KLA:Q2_D', 5),
('Q2_E', 'KLA:Q2_E', 5),
('Q2_F', 'KLA:Q2_F', 5),
('Q2_G', 'KLA:Q2_G', 5),
('Q2_H', 'KLA:Q2_H', 5),
('Q2_I', 'KLA:Q2_I', 5),
('Q2_J', 'KLA:Q2_J', 5),
('Q2_LK2', 'KLA:Q2_LK2', 5),
('Q2 Vergleichsarbeiten', 'KLA:Q2_VG', 5),
('Q3_A', 'KLA:Q3_A', 5),
('Q3_B', 'KLA:Q3_B', 5),
('Q3_C', 'KLA:Q3_C', 5),
('Q3_D', 'KLA:Q3_D', 5),
('Q3_E', 'KLA:Q3_E', 5),
('Q3_F', 'KLA:Q3_F', 5),
('Q3_G', 'KLA:Q3_G', 5),
('Q3_H', 'KLA:Q3_H', 5),
('Q3_I', 'KLA:Q3_I', 5),
('Q3_J', 'KLA:Q3_J', 5),
('Q3 Kommunikationsprüfungen', 'KLA:Q3_KOM', 5),
('Q3_LK2', 'KLA:Q3_LK2', 5),
('Q3 Vergleichsarbeiten', 'KLA:Q3_VG', 5),
('Q4_A', 'KLA:Q4_A', 5),
('Q4_B', 'KLA:Q4_B', 5),
('Q4_C', 'KLA:Q4_C', 5),
('Q4_D', 'KLA:Q4_D', 5),
('Q4_E', 'KLA:Q4_E', 5),
('Q4_F', 'KLA:Q4_F', 5),
('Q4_G', 'KLA:Q4_G', 5),
('Q4_H', 'KLA:Q4_H', 5),
('Q4_I', 'KLA:Q4_I', 5),
('Q4_J', 'KLA:Q4_J', 5),
('Q4_LK2', 'KLA:Q4_LK2', 5),
('BFS', 'KON:BFS', 6),
('Biologie', 'KON:BIO', 6),
('Chemie', 'KON:CHE', 6),
('Deutsch', 'KON:DEU', 6),
('Digitalisierungsgruppe', 'KON:DIG', 6),
('DS', 'KON:DS', 6),
('Englisch', 'KON:ENG', 6),
('ev. Religion', 'KON:ERE', 6),
('Ethik', 'KON:ETH', 6),
('Fachoberschule', 'KON:FOS', 6),
('Französisch', 'KON:FRA', 6),
('Fachschule', 'KON:FS', 6),
('Geschichte', 'KON:GES', 6),
('Gesamtkonferenzen', 'KON:GK', 6),
('Gymnasiale Oberstufe', 'KON:GOS', 6),
('Informatik', 'KON:INF', 6),
('Internationale Dimension', 'KON:INT', 6),
('kath. Religion', 'KON:KRE', 6),
('Kunst', 'KON:KUN', 6),
('Latein', 'KON:LAT', 6),
('LiV', 'KON:LiV', 6),
('Mathematik', 'KON:MAT', 6),
('Musik', 'KON:MUS', 6),
('Philosophie', 'KON:PHI', 6),
('Physik', 'KON:PHY', 6),
('Politik & Wirtschaft', 'KON:POL', 6),
('Spanisch', 'KON:SPA', 6),
('Sport', 'KON:SPO', 6),
('Schule: Aufgabenfeld I', 'VER:AF1', 9),
('Schule: Aufgabenfeld II', 'VER:AF2', 9),
('Schule: Aufgabenfeld III', 'VER:AF3', 9),
('Schule: Allgemein', 'VER:ALL', 9),
('Fremdveranstaltungen', 'VER:FRE', 9),
('Schule: Kaufmännische Abteilung', 'VER:KAU', 9),
('Schule: LiV', 'VER:LIV', 9),
('Schule: Musik', 'VER:MUS', 9),
('Schule: Sport', 'VER:SPO', 9);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `termine`
--

CREATE TABLE `termine` (
  `ID` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `Titel` text NOT NULL,
  `Start` text NOT NULL,
  `Ende` text NOT NULL,
  `Beschreibung` text NOT NULL,
  `Ort` text NOT NULL,
  `Kategorie` int NOT NULL,
  `Ganztag` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `kalender`
--
ALTER TABLE `kalender`
  ADD PRIMARY KEY (`ID`);

--
-- Indizes für die Tabelle `link`
--
ALTER TABLE `link`
  ADD PRIMARY KEY (`ID`);

--
-- Indizes für die Tabelle `Tags`
--
ALTER TABLE `Tags`
  ADD PRIMARY KEY (`Tag`);

--
-- Indizes für die Tabelle `termine`
--
ALTER TABLE `termine`
  ADD PRIMARY KEY (`ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
