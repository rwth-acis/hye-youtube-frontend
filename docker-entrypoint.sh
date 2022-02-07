sed -i "s|localhost:8081|${BASE_URL}|" index.html
sed -i "s|localhost:8081|${BASE_URL}|" ./dev/*.html
sed -i "s|http://localhost:8081/|${BASE_URL}|" ./main-page.js
sed -i "s|http://localhost:8081/|${BASE_URL}|" ./search-page.js
sed -i "s|http://localhost:8081/|${BASE_URL}|" ./video-page.js
sed -i "s|http://localhost:8081/|${BASE_URL}|" ./config-page.js
sed -i "s|http://localhost:8081|${BASE_URL}|" ./node_modules/las2peer-frontend-statusbar/las2peer-frontend-statusbar.js
npm run serve
