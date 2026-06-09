import dns from 'dns';

dns.resolve4('api.cohere.ai', (err, addresses) => {
  if (err) {
    console.error("DNS resolution failed for api.cohere.ai:", err);
  } else {
    console.log("DNS addresses for api.cohere.ai:", addresses);
  }
});

dns.resolve4('api.mistral.ai', (err, addresses) => {
  if (err) {
    console.error("DNS resolution failed for api.mistral.ai:", err);
  } else {
    console.log("DNS addresses for api.mistral.ai:", addresses);
  }
});
