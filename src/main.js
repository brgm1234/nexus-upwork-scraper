const { Actor } = require('apify');
const axios = require('axios');

Actor.main(async () => {
  const input = await Actor.getInput();
  const { queries, maxJobs = 30 } = input;
  
  console.log('Starting Upwork scraper...');
  console.log('Queries:', queries);
  console.log('Max jobs:', maxJobs);
  
  const results = [];
  const proxyConfiguration = await Actor.createProxyConfiguration({
    groups: ['RESIDENTIAL']
  });
  
  for (const query of queries) {
    if (results.length >= maxJobs) break;
    
    try {
      const searchUrl = `https://www.upwork.com/api/v3/jobs/search?keywords=${encodeURIComponent(query)}&per_page=${Math.min(maxJobs - results.length, 50)}`;
      
      const response = await axios.get(searchUrl, {
        proxy: proxyConfiguration.createProxyUrl(),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'X-Upwork-API-Version': 'v3'
        }
      });
      
      const jobs = response.data?.jobs || response.data?.results || [];
      
      for (const job of jobs) {
        if (results.length >= maxJobs) break;
        
        results.push({
          title: job.title || '',
          budget: job.amount?.amount ? `${job.amount.amount} ${job.amount.currency}` : job.hourlyBudget?.amount ? `${job.hourlyBudget.amount}/hr` : 'Not specified',
          description: job.description || '',
          skills: job.skills || job.occupations || [],
          posted: job.publishedOn || job.createdAt || '',
          clientCountry: job.client?.location?.country || '',
          proposals: job.proposalsTier || job.proposalCount || '0',
          jobUrl: job.ciphertext ? `https://www.upwork.com/jobs/~${job.ciphertext}` : '',
          query
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`Error scraping query "${query}":`, error.message);
    }
  }
  
  await Actor.pushData(results);
  console.log('Scraping completed. Total results:', results.length);
});