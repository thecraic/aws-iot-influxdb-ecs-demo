const Influx = require('influx');

const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB();

//This code writes data from IoT core rule via Lambda into InfluxDB
//It checks the incoming messages for deviceid and clientid
//Any metadata associated with these items are added to the messages

exports.handler = (event, context, callback) => {

    console.log(event);
    var pressureInputValue = JSON.parse(event.pressure);
    var viscosityInputValue = JSON.parse(event.viscosity);
    //Create clientID
    var clientid = JSON.stringify(event.clientid);
    var deviceid = JSON.stringify(event.deviceid);
    var sensorID = deviceid+clientid; 

    var schema_tags = ['sensorID'];
    let meta_tags = new Object();
    meta_tags["sensorID"]=sensorID;
    
    // Look for metadata in DynamoDB
    var params = { }
    params.TableName = process.env.DYNAMODB_TABLE;
    var key = { "metakey": {"S":event.metakey} };
    params.Key = key;
    
    dynamodb.getItem(params, function(err, data) {
        
        
        if (err) console.log(err);
        else {
            console.log(data);
            var item = AWS.DynamoDB.Converter.unmarshall(data.Item);
            console.log(item);
            
            for (var tag in item) {
                schema_tags.push(tag);
                var tag_value=item[tag];
                console.log(tag + " : " + tag_value);
               
                meta_tags[tag]=tag_value;
            }
        }
        
        // write to influx regardless
        var result = writeToInfluxDB (schema_tags,pressureInputValue, viscosityInputValue, meta_tags);
        callback(null, result);

    });
    
  };

function writeToInfluxDB(schema_tags,pressureVar, viscosityVar, tags )
{
    console.log("Executing Influx insert");

    const client = new Influx.InfluxDB({
        database: process.env.INFLUXDB,
        username: process.env.INFLUXDBUSRNAME,
        password: process.env.INFLUXDBPWD,
        port: process.env.INFLUXDBPORT,
        hosts: [{ host: process.env.INFLUXDBHOST }],
        schema: [{
            measurement: 'pressure',
    
            fields: {
                pressureValue: Influx.FieldType.FLOAT, 
                viscosity: Influx.FieldType.FLOAT,
            },
    
            tags: schema_tags
        }]
    });
    
    client.writePoints([{
        measurement: 'pressure', fields: { pressureValue: pressureVar, viscosity: viscosityVar},
        tags: tags
    }]) 
    console.log("Finished executing");
}  