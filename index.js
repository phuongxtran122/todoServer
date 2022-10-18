const express = require("express");
const cors = require("cors");
const pool = require("./db");
require('dotenv').config()
const app = express();
// middleware
app.use(cors());
app.use(express.json()); // gives us function to call req.body
function auth(key) {
    if (key===process.env.TODO_API_KEY) {
        return true
    }
    return false
}
// ROUTES for postgre//
// create a todo entry
app.post("/todos", async(req, res) => {
    // authentication failed
    if (!auth(req.headers['todo-api-key'])){
        res.status(403).json({
            error: "Unauthorized Permission"
        })
    } 
    else {
        // await, async allows await function which only continue when function is complete
        try{
            
            console.log(req.body);
            const { description } = req.body;
            // insert description into
            // returning the table
            const newTodoEntry = await pool.
            query(
                "INSERT INTO todo (description) \
                VALUES($1) \
                RETURNING *", 
                [description]
            );
            res.json(newTodoEntry.rows[0])
        } catch (e) {
            console.error(e.message);
            res.status(200).json({
                status: "Failed"
            });
            }
        }
    }
);

app.get("/favicon.ico", async(req, res) =>{

});
app.get("/", async(req,res) => {
    res.json("hi")
});
// get all todo items
app.get("/todos", async(req, res) => {
    try{
        const allTodoEntries = await pool.
        query(
            "SELECT * \
            FROM todo");
        res.json(allTodoEntries.rows);
    } catch(e) {
        console.error(e.message);
    }
});

// get a todo entry
app.get("/todos/:entryId", async(req, res) => {
    try {
        // console.log(req.params);
        // do NOT forget the squiggly paranthesis
        const {entryId} = req.params;
        console.error(req.params);
        const entry = await pool.
        query(
            "SELECT * \
            FROM todo \
            WHERE todo_id = $1", 
            [
            entryId
            ]
        );
        res.json(entry);
        // const entry = await pool.query("SELECT")
    } catch (e) {
        console.error(e.message);
    }
});

// update a todo entry
app.put("/todos/:entryId", async(req, res) => {
    try {
        const { entryId } = req.params;
        // name needs to match database, cant be desc or descr, has to be description
        const { description } = req.body;
        console.log( req.params);

        const updateTodo = await pool.
        query(
            "UPDATE todo \
            SET description = $1 \
            WHERE todo_id = $2 \
            RETURNING *", 
            [
                description, 
                entryId
            ]);
        console.log( req.body);
        res.json(updateTodo.rows)
    } catch (e) {
        console.error(e.message);
    }
});
// delete a todo entry
app.delete("/todos/:entryId", async(req, res) => {
    try {
        const {entryId} = req.params;
        const deleteEntry = await pool.
        query(
            "DELETE FROM todo \
            WHERE todo_id = $1 \
            RETURNING *",
            [entryId]
            );
        res.json("Todo was deleted")
    } catch (e) {
        console.log(e.message);
    }
});
// run server for testing -node index
app.listen(process.env.PORT || 3000, () => {
    console.log("server has started on port 5000");
})
module.exports = app