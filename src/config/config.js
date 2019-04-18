module.exports = {
  port: 8081,
  // dbURL: 'mongodb://localhost/eventtime',
  dbURL: 'mongodb+srv://broodd:Tooptoop22@eventtime-hqv67.gcp.mongodb.net/eventtime?retryWrites=true',
  dbOptions: { 
    useNewUrlParser: true,
    useMongoClient: true 
  }
}


/* 
Import 

mongoimport --host eventtime-shard-00-00-hqv67.gcp.mongodb.net:27017 --db eventtime --collection cards --type json D:\Desktop/export.json --authenticationDatabase admin --ssl --username broodd --password Tooptoop22

*/