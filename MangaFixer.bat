@echo off
set "src=C:\Users\satya\.gemini\antigravity\brain\8aa5c058-0f82-4981-8d91-f9d06029cb4b"
set "dest=d:\New folder\Ebook Project\frontend\BookForge\public\samples"

if not exist "%dest%" mkdir "%dest%"

echo Deploying Manga Assets...
copy /Y "%src%\shonen_manga_sample_v1_1774465564217.png" "%dest%\shonen.png"
copy /Y "%src%\seinen_manga_sample_v1_1774465581556.png" "%dest%\seinen.png"
copy /Y "%src%\adventure_manga_sample_v1_1774465598593.png" "%dest%\adventure.png"

echo Done! Refresh your browser.
pause
