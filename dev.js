import { handler } from "./index.js";
import express from 'express'; 
import morgan from 'morgan'
let event = {
    headers : {
        authorization : ''
    },
    routeKey : '',
    pathParameters: {id : ''},
    body: {}
};

let context;
let callback;

const app = express()
app.use(express.json())
app.use(morgan('dev'))
app.get("/items", async (req, res) => {
    event.headers.authorization=req.headers.authorization;
    event.routeKey = 'GET /items'
    const result = await handler(event, context, callback);
    res.statusCode=result.statusCode;
    res.send(result.body);
});

app.put('/items',  async(req, res) => {
    event.routeKey = 'PUT /items'
    event.headers.authorization=req.headers.authorization;
    event.body = JSON.stringify(req.body);
    console.log(event.body);
    const result = await handler(event, context, callback);
    res.statusCode=result.statusCode;
    res.send(result.body);
});

app.get('/items/:id', async(req,res)=> {
    event.headers.authorization=req.headers.authorization;
    event.routeKey = 'GET /items/{id}'
    event.pathParameters.id= +(req.params.id);
    const result = await handler(event, context, callback);
    res.statusCode=result.statusCode;
    res.send(result.body);
});

app.delete('/items/:id', async(req,res)=> {
    event.headers.authorization=req.headers.authorization;
    event.routeKey = 'DELETE /items/{id}'
    event.pathParameters.id= +(req.params.id);
    const result = await handler(event, context, callback);
    res.statusCode=result.statusCode;
    res.send(result.body);
});

app.listen(3000, () => console.log(`Server running on Port 3000`))