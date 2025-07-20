const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");

app.use(cors());
app.set('view engine', 'ejs');
app.set("views", __dirname + "/views");
app.use(express.static( __dirname + "/public"))
app.get('/', (req, res) => {
    res.render('index');    
});



app.get("/about", (req, res) => {
res.render('about');
});



app.get("/privacy", (req, res) => {
res.render('privacy');
});

app.get("/contact", (req, res) => {
res.render('contact');
});



// handel url like tool/currency-converter-pounds-to-dollars?from=gbp&to=usd

app.get("/tool/:description/:slug",(req,res)=>{
    const {slug}  = req.params;
    const [from, to] = slug.split("-to-"); 

   
    console.log(`From: ${from}, To: ${to}`);
     
    let title = "Convert " + from + " to " + to + " | Currency Converter";

    let metaDescription = `Convert ${from} to ${to} with our Currency Converter. Get real-time exchange rates and convert your money easily.`;

    let hading = `Convert ${from} to ${to}`;

    let peragraph = `Use our Currency Converter to convert ${from} to ${to}. Get the latest exchange rates and make informed decisions.`;

    let canonical = req.protocol + '://' + req.get('host') + req.originalUrl;

    let keywords = `${from}, ${to}, currency converter, exchange rates, convert money`;

    let data = {
        title,
        metaDescription,
        hading,
        peragraph,
        canonical,
        keywords,
         fromCurrency: from?.toUpperCase() || 'USD',  // Default to USD if not provided
        toCurrency: to?.toUpperCase() || 'EUR'       // Default to EUR if not provided
    };
    
   res.render('tool', data);
})


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
