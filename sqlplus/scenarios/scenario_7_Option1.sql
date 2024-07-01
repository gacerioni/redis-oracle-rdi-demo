-- ----------------------------
--  Which artists have written the most Rock music?
-- ----------------------------
set lines 256;
set trimout on;
set tab off;
set pagesize 100;
set colsep " | ";

SELECT Artist.ArtistId AS artistId, Artist.Name AS name, COUNT(Track.Name) AS Songs 
FROM Artist 
JOIN Album ON Album.ArtistId = Artist.ArtistId 
JOIN Track ON Album.AlbumId = Track.AlbumId 
JOIN Genre ON Track.GenreId = Genre.GenreId WHERE Genre.Name = 'Rock' 
GROUP BY Artist.ArtistId, Artist.Name, Genre.Name 
ORDER BY Songs DESC 
FETCH FIRST 10 ROWS ONLY; 