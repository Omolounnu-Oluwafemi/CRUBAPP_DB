import http, { IncomingMessage, Server, ServerResponse } from "node:http";
import https from "node:https"
/*
implement your server code here
*/
  // Function to extract the title from the HTML content
  function getTitle(htmlContent: string) {
    const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
    return titleMatch ? titleMatch[1] : null;
  }

   // Function to extract the description from the HTML content
function getDescription(htmlContent: string) {
  const descriptionMatch = htmlContent.match(/<meta\s+name="description"\s+content="(.*?)"/i);
  return descriptionMatch ? descriptionMatch[1] : null;
}

 // Function to extract the image URL from the HTML content
function getImageUrl(htmlContent: string) {
  const imageUrlMatch = htmlContent.match(/<meta\s+property="og:image"\s+content="(.*?)"/i)
  return imageUrlMatch ? imageUrlMatch[1] : null;
}


const server = http.createServer((req:IncomingMessage, res:ServerResponse) => {
  if (req.method === 'POST') {
    let urlReceived = '';

    req.on('data', (chunk) => {
      urlReceived += chunk;
    });

    req.on('end', () => {
      try {
        const parsedData = JSON.parse(urlReceived);
        const value = parsedData.url;

        if (!value) {
          res.writeHead(400);
          res.end('URL is missing in the request body');
          return;
        }

        // Check if the URL is HTTP or HTTPS
        let protocol

          const valueToarray = value.split('');

        if (valueToarray.slice(0,4)) {
          protocol = https;
        } else {
          protocol = http;
        }

        // Send a GET request to the provided URL
        protocol.get(value, (response) => {
          let htmlContent = '';

          // Read the HTML content from the response
          response.on('data', (chunk) => {
            htmlContent += chunk;
          });

          response.on('end', () => {
            try {
              // Extract the metadata information (title, description, etc.)
              const title = getTitle(htmlContent);
              const description = getDescription(htmlContent);
              const imageUrl = getImageUrl(htmlContent);

              // Respond with the extracted metadata
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ title, description, imageUrl }));
            } catch (error) {
              res.writeHead(500);
              res.end('Internal Server Error');
            }
          });
        }).on('error', () => {
          // If the URL is invalid or the request fails, return an error
          res.writeHead(400);
          res.end('Failed to fetch content from the provided URL');
        });
      } catch (error) {
        res.writeHead(400);
        res.end('Invalid JSON data in the request body');
      }
    });
  } else {
    // Respond with a 405 Method Not Allowed for other HTTP methods
    res.writeHead(405);
    res.end('Method Not Allowed');
  }
});



server.listen(3001, "127.0.0.1", ()=>{
  console.log("Server listening on port 3001")
});

