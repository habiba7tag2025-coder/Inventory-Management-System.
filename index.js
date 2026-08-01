import express from "express";
import pool from "./db.js";
import cors from "cors";
import "dotenv/config";


const app = express();
const port = process.env.PORT || 3004;


// Middleware
app.use(express.json());
app.use(cors());


//get all product

app.get("/products" ,async (req , res) => {
    try {
        const [products] = await pool.query("SELECT * FROM products");
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



// Search products by brand or model name

app.get("/products/search", async (req, res) => {
    try {
        const brand = req.query.brand; // مثال: /products/search?brand=Samsung

        if (!brand) {
        return res.status(400).json({ error: "Please provide a brand name to search for" });
        }

        const [filteredProducts] = await pool.query(
            "SELECT * FROM products WHERE Model LIKE ?",
            [`%${brand}%`]
        );

        if (filteredProducts.length === 0) {
            return res.status(404).json({ message: "No products found for this brand" });
    }

        res.status(200).json(filteredProducts);

    } catch (error) {
        console.error("Error searching products:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


//get single product
app.get("/products/:id" , async (req , res) => {
    try {
        const productId = parseInt(req.params.id);
        const [product] = await pool.query("SELECT * FROM products WHERE id = ?", [productId]);
        if (product.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.status(200).json(product[0]);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



//post creat a product 
app.post("/product" , async (req , res) => {
    try {
        const { price, typename, Model } = req.body;

        if (!typename || !price) {
            return res.status(400).json({ message: "Name and price are required" });
            }

        const query = "INSERT INTO products (typename, Model, price) VALUES (?, ?, ?)";
        const [result] = await pool.query(query, [typename, Model, price]);

        const newProduct = {
            id: result.insertId, // الـ ID اللي الداتابيز ولدته تلقائياً
            typename,
            Model,
            price
        };
        res.status(201).json({ message: "Product Created Successfully", newProduct });
        }
    catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Internal server error" });
        }
});



// delete a single product

app.delete("/products/:id", async (req, res) => {
    try {
        const productId = parseInt(req.params.id); // 

        const [existing] = await pool.query("SELECT * FROM products WHERE id = ?", [productId]);
        if (existing.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        await pool.query("DELETE FROM products WHERE id = ?", [productId]);
        res.status(200).json({ message: "Product deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



// update a single product
app.put("/products/:id", async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const { price, typename, Model } = req.body;

        if (!price) {
            return res.status(400).json({ error: "Price is required" });
        }


        const [existing] = await pool.query("SELECT * FROM products WHERE id = ?", [productId]);
        if (existing.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        const query = "UPDATE products SET typename = ?, Model = ?, price = ? WHERE id = ?";
        await pool.query(query, [typename, Model, price, productId]);

        res.status(200).json({ 
            message: "Product updated successfully", 
            product: { id: productId, typename, Model, price } 
        });
        } 
    catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Internal server error" });
        }
});





app.listen(port,() => {
    console.log(`HOST:http://localhost:${port}`);
});


app.get("/" , (req , res) => {
    res.send("Server Health is good");
});
