import http, { IncomingMessage, Server, ServerResponse } from "node:http";
import * as fs from "node:fs";
/*
implement your server code here
*/

const server: Server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  
  const db = './server/database.json';

  function readData() {
    try {
      const data = fs.readFileSync(db, { encoding: "utf-8" });
      return JSON.parse(data);
    } catch (err) {
      return null;
    }
  }
  
  function writeData(data: {}) {
    try {
      fs.writeFileSync(db, JSON.stringify(data, null, 2), { encoding: 'utf-8' });
      console.log('Data written successfully.');
    } catch (err) {
      console.error('Error writing data:', err);
    }
  }

  if (req.method === "GET") {
    const data = readData();
    if (data !== null) {
      res.end(JSON.stringify(data));
    } else {
      res.statusCode = 500; // Internal Server Error
      res.end("Internal Server Error");
    }
  } else if (req.method === "POST") {
    let writtenData = "";

    req.on('data', (chunk) => {
      writtenData += chunk;
    });

    req.on('end', () => {
      try {
        const parsedWrittenData = JSON.parse(writtenData);
        let dbData = readData();

        if (dbData === null) {
          dbData = [];
          writeData(dbData); 
          console.log('New database created.');
        }

          let dbIds = []
          for (const each of dbData){
            dbIds.push(each.id)
          }
          dbIds.sort((a,b) => a - b)

          const newId = dbIds.length + 1

        const otherDetails = { 
          "createdDate":new Date().toISOString(), 
          "id": newId
        }
        
        const dataToPost = { ...parsedWrittenData, ...otherDetails}

      
        dbData.push(dataToPost);
        dbData.sort((a: { id: number; }, b: { id: number; }) => a.id - b.id);
        writeData(dbData);
      
        res.statusCode = 200;
        res.end(JSON.stringify(dataToPost));

      } catch (err) {
        res.statusCode = 400; // Bad Request
        res.end('Invalid data');
      }
    });

  }else if (req.method === "DELETE"){
    let toBeDeleted = "";

    req.on('data', (chunk) => {
      toBeDeleted += chunk;
    });

       req.on('end', () => {
      try {
        const parsedToBeDeleted = JSON.parse(toBeDeleted);
        let dbData = readData();
        dbData = dbData.filter((data: { id: any; }) => data.id !== parsedToBeDeleted.id); // Remove the data objects with the matching IDs from the dbData array
        writeData(dbData);

        res.statusCode = 200;
        res.end(JSON.stringify(dbData));
      } catch (error) {
        res.statusCode = 404; // NOt Found
        res.end('Data Not Found');
      }
    });
  } else if(req.method === "PUT"){
   let tobeUpdated = ""
   
   req.on('data', (chunk)=>{
      tobeUpdated += chunk
   })

   req.on('end',()=>{
    try {
      const parsedToBeUpdated = JSON.parse(tobeUpdated);
      let dbData = readData();

      const otherDetails = { 
        "updatedDate": new Date().toISOString(),
      }
      
      const dataToPost = { ...parsedToBeUpdated, ...otherDetails}

      let foundRecord = false;
      for (let i = 0; i < dbData.length; i++) {
        if (dbData[i].id === dataToPost.id) {
          dbData[i] = { ...dbData[i], ...dataToPost };
          foundRecord = true;
          break;
        }
      }

      if (foundRecord) {
        writeData(dbData);
        console.log("Data Updated Successfully");
        res.end("Data Updated Successfully");
      } else {
        res.statusCode = 404; // Not Found
        res.end("No matching Record");
        console.log("No matching Record");
      }

    } catch (error) {
      res.statusCode = 404; // NOt Found
      res.end('Data Not Found');
    }
   })
  }
  else {
    res.statusCode = 404; // Not Found
    res.end("Not Found");
  }

  }
);

server.listen(3005, "127.0.0.1", () => {
  console.log("Server listening on port 3005");
});
