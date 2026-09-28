const fs = require('fs');
const http = require('http');

console.log('=== SITE QA & INTEGRITY VERIFICATION ===\n');

// 1. Verify index.html content
const html = fs.readFileSync('index.html', 'utf8');

const requiredIds = [
  'heroVideo', 'heroReplayBtn', 'brandResolution', 'sustainability',
  'archScrollSection', 'scrollCanvas', 'deonarayan', 'plans',
  'specifications', 'specFilm', 'specificationVideo', 'location',
  'leaderboard', 'anima', 'enquiry', 'persistentCta', 'floatingWhatsapp'
];

let htmlOk = true;
for (const id of requiredIds) {
  if (!html.includes(`id="${id}"`)) {
    console.error(`FAIL: Missing element id="${id}"`);
    htmlOk = false;
  } else {
    console.log(`PASS: Element id="${id}" exists`);
  }
}

if (html.includes('id="heroMuteBtn"')) {
  console.error('FAIL: heroMuteBtn is still present in HTML!');
  htmlOk = false;
} else {
  console.log('PASS: heroMuteBtn is removed from HTML');
}

// 2. Verify WhatsApp links and phone number
const phone = '919121314502';
if (html.includes(phone)) {
  console.log(`PASS: Verified phone number (+${phone}) found in WhatsApp CTAs`);
} else {
  console.error(`FAIL: Verified phone number not found in WhatsApp CTAs!`);
  htmlOk = false;
}

// 3. Verify Dedicated Leaderboard CTA
if (html.includes('GET IN TOUCH WITH US')) {
  console.log('PASS: Dedicated Leaderboard CTA "GET IN TOUCH WITH US" found');
} else {
  console.error('FAIL: Missing Leaderboard CTA "GET IN TOUCH WITH US"');
  htmlOk = false;
}

// 4. Verify original motto and sustainable growth
if (html.includes('Bring home to quality') && html.includes('Crafting Spaces, Creating Memories')) {
  console.log('PASS: Original SkyScraper motto and brand taglines present');
} else {
  console.error('FAIL: Missing original SkyScraper motto/taglines');
  htmlOk = false;
}

// 5. Verify HTTP Endpoints against running server (localhost:3000)
const endpoints = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/assets/deonarayan_asset/SPECIFICATION.mp4',
  '/cinematic_opening_film.mp4',
  '/public/leaderboard/leadership_page_1.jpg',
  '/public/leaderboard/leadership_page_2.jpg',
  '/public/leaderboard/leadership_page_3.jpg',
  '/public/leaderboard/leadership_page_4.jpg',
  '/public/leaderboard/leadership_page_5.jpg',
  '/public/leaderboard/leadership_page_6.jpg',
  '/public/floorplans/floor_plan_page_1.jpg',
  '/public/floorplans/floor_plan_page_2.jpg',
  '/public/floorplans/floor_plan_page_3.jpg',
  '/public/floorplans/floor_plan_page_4.jpg'
];

console.log('\n--- Checking HTTP Endpoints ---');

let completed = 0;
endpoints.forEach(urlPath => {
  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: urlPath,
    method: 'HEAD'
  }, res => {
    if (res.statusCode === 200 || res.statusCode === 206) {
      console.log(`PASS: ${res.statusCode} ${urlPath}`);
    } else {
      console.error(`FAIL: ${res.statusCode} ${urlPath}`);
    }
    completed++;
    if (completed === endpoints.length) {
      console.log('\n=== QA VERIFICATION COMPLETE ===');
    }
  });

  req.on('error', err => {
    console.error(`CONN ERROR on ${urlPath}: ${err.message}`);
    completed++;
  });
  req.end();
});
