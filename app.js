const express = require('express');
const app = express();
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('node:fs');
const url = 'https://elpais.com/ultimas-noticias/';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let noticias = [];

// Leer datos desde el archivo JSON
function leerDatos() {
    try {
      const data = fs.readFileSync('noticias.json', 'utf-8');
      noticias = JSON.parse(data);
    } catch (error) {
      console.error('Error al leer el archivo noticias.json:', error.message);
    }
  }
  
  // Guardar datos en el archivo JSON
  function guardarDatos() {
    fs.writeFileSync('noticias.json', JSON.stringify(noticias, null, 2));
  }

app.get('/scraping', async(req, res) => {
    try {
        const response = await axios.get(url);
        const html = response.data
        const $ = cheerio.load(html)
        arrTitulos= [];
        arrEnlances=[];
        arrDescrip = [];
        arrImg=[];

        $('.c_t a').each((index, elemento)=>{
            const titulo = $(elemento).text();
            arrTitulos.push(titulo);
            const enlace = $(elemento).attr('href');
            arrEnlances.push(enlace)
        })

        $('.c_d').each((index,elemento)=>{
            const descripcion = $(elemento).text()
            arrDescrip.push(descripcion);
        })        
        
        $('.b-st_a img').each((index, elemento) => {
            const imagen = $(elemento).attr('src');
            arrImg.push(imagen);     
        })

        for (let i = 0; i< arrTitulos.length; i++){
            const noticia = {
                titulo: arrTitulos[i],
                imagen: arrImg[i],
                descripcion: arrDescrip[i],
                enlace: arrEnlances[i],
              };
              noticias.push(noticia);
        }
        guardarDatos();   
       
    } catch (error) {
        console.log(error);
    }

}); //app.get('/')

app.post('/scraping', (req, res)=>{
    leerDatos();
    const noticia = {
        titulo: req.body.titulo,
        imagen: req.body.imagen,
        descripcion: req.body.descripcion,
        enlace: req.body.enlace,
      };
    noticias.push(noticia);
    guardarDatos();
})

app.get('/scraping/:enlace', (req, res)=>{
    const enlance = req.params.enlace;
    

})

app.delete('/scraping/:enlace', (req, res) => {
    leerDatos();
    const enlance = req.params.enlace;
    console.log(enlace)
    noticias = noticias.filter(noticia => noticia.enlance !== enlance);
    res.json(noticias)
    

})



app.listen(3000, () => {
    console.log('Express a la escucha del puerto http://localhost:3000');
});