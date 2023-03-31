import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

import AWS from 'aws-sdk';

import {config} from './config.js';

AWS.config.update(config.aws_remote_config);

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "http-crud-training-assignment";

export const handler = async (event, context, callback) => {
  var authorizationHeader = event.headers.authorization
  // console.log(event);
  if (!authorizationHeader) return callback('Unauthorized')

  var encodedCreds = authorizationHeader.split(' ')[1]
  var plainCreds = (new Buffer(encodedCreds, 'base64')).toString().split(':')
  // console.log({encodedCreds, plainCreds});
  var username = plainCreds[0]
  var password = plainCreds[1]
  // console.log(event);
  if (!(username === 'admin' && password === 'secret')) 
  { 
    // console.log(authorizationHeader);
    // console.log(username + ' ' + password);
    let statusCode = 401;
    let body = 'Unauthorized'
    return {
      statusCode,
      body,
    };
  }

  let body = {message:'', Item:'', Count: ''};
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    switch (event.routeKey) {
      case "DELETE /items/{id}":
        console.log('Delete item by id');
        let del_item = await dynamo.send(
          new GetCommand({
            TableName: tableName,
            Key: {
              id: +event.pathParameters.id,
            },
          })
        );
        if(del_item.Item == undefined) {
          body = `Item is not present in the database`;
          statusCode = 404;
        }
        else {
          await dynamo.send(
            new DeleteCommand({
              TableName: tableName,
              Key: {
                id: +event.pathParameters.id,
              },
            })
          );
          statusCode = 204;
          body =''
        }
        break;
      case "GET /items/{id}":
        console.log('Get item by id');
        let fetchedItem = await dynamo.send(
          new GetCommand({
            TableName: tableName,
            Key: {
              id: +event.pathParameters.id,
            },
          })
        );
        if(!fetchedItem.Item)
        {
            body = 'Item with ID: ' +event.pathParameters.id  + ' is not present in the database.'
            statusCode = 404
        }
        else 
        {
          body = fetchedItem.Item;
        }
        break;
      case "GET /items":
        console.log('Get all items');
        let fetchedItems = await dynamo.send(
          new ScanCommand({ TableName: tableName })
        );
        delete body.message;
        body.Count = fetchedItems.Count;
        body.Item = fetchedItems.Items;
        break;
      case "PUT /items":
        let requestJSON = JSON.parse(event.body);
        console.log('Put item');
        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: +requestJSON.id,
              price: requestJSON.price,
              name: requestJSON.name,
            },
          })
        );
        body = '';
        break;
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  }
  // console.log({statusCode}, {body})
  return {
    statusCode,
    body,
    headers,
  };
};