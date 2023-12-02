-- ----------------------------
--  Which artists have written the most Rock music?
-- ----------------------------

-- Option 1
SELECT Artist.ArtistId AS artistId, Artist.Name AS name, COUNT(Track.Name) AS Songs 
FROM Artist 
JOIN Album ON Album.ArtistId = Artist.ArtistId 
JOIN Track ON Album.AlbumId = Track.AlbumId 
JOIN Genre ON Track.GenreId = Genre.GenreId WHERE Genre.Name = 'Rock' 
GROUP BY Artist.ArtistId, Artist.Name, Genre.Name 
ORDER BY Songs DESC 
FETCH FIRST 10 ROWS ONLY; 

-- Option 2
CREATE MATERIALIZED VIEW RockView
BUILD IMMEDIATE
AS
SELECT Artist.ArtistId AS artistId, Artist.Name AS name, COUNT(Track.Name) AS Songs 
FROM Artist
JOIN Album ON Album.ArtistId = Artist.ArtistId 
JOIN Track ON Album.AlbumId = Track.AlbumId 
JOIN Genre ON Track.GenreId = Genre.GenreId WHERE Genre.Name = 'Rock' 
GROUP BY Artist.ArtistId, Artist.Name, Genre.Name 
ORDER BY Songs DESC; 

ALTER TABLE CHINOOK.ROCKVIEW ADD SUPPLEMENTAL LOG DATA (ALL) COLUMNS;
ALTER MATERIALIZED VIEW RockView ADD CONSTRAINT PK_RockVIEW PRIMARY KEY (ArtistId);

SELECT * FROM RockView
FETCH FIRST 10 ROWS ONLY; 
