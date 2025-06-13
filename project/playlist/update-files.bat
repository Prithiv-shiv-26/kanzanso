@echo off
echo Updating Spotify integration files...

echo Backing up original files...
copy main.js main.js.bak
copy style.css style.css.bak
copy index.html index.html.bak

echo Replacing with new files...
copy main.js.new main.js
copy style.css.new style.css
copy index.html.new index.html

echo Done!
pause