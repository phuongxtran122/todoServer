const express = require("express");
const cors = require("cors");
const pool = require("./db");
const app = express();
// middleware
app.use(cors());
app.use(express.json()); // gives us function to call req.body

// ROUTES for postgre//
// create a todo entry
app.post("/todos", async(req, res) => {
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
    }
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
app.listen(5000, () => {
    console.log("server has started on port 5000");
});