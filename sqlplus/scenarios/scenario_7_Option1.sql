-- ----------------------------
--  Which artists have written the most Rock music?
-- ----------------------------
SET lines 256;
SET trimout on;
SET tab off;
SET pagesize 100;
SET colsep " | ";
COLUMN name FORMAT A50;

SELECT Artist.ArtistId AS artistId, Artist.Name AS name, COUNT(Track.Name) AS Songs 
FROM Artist 
JOIN Album ON Album.ArtistId = Artist.ArtistId 
JOIN Track ON Album.AlbumId = Track.AlbumId 
JOIN Genre ON Track.GenreId = Genre.GenreId WHERE Genre.Name = 'Rock' 
GROUP BY Artist.ArtistId, Artist.Name, Genre.Name 
ORDER BY Songs DESC 
FETCH FIRST 10 ROWS ONLY; 