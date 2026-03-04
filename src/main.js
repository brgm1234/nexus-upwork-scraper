const { Actor } = require('apify');
const axios = require('axios');

Actor.main(async () => {
  const input = await Actor.getInput();
  const { queries, maxJobs = 30 } = input;
  
  console.log('Starting Upwork scraper...');
  console.log('Queries:', queries);
  console.log('Max jobs:', maxJobs);
  
  // TODO: Implement Upwork scraping logic
  // Use RESIDENTIAL proxy configuration
  
  const results = [];
  
  await Actor.pushData(results);
  console.logg('Scraping completed. Total results:', results.length);
});