const express = require('express')
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const url = 'https://elpais.com/ultimas-noticias/';

const router = express.Router();

let noticias = [];

// Leer datos desde el archivo JSON
function leerDatos() {
    try {
        const data = fs.readFileSync('noticias.json', 'utf-8');
        return noticias = JSON.parse(data);
    } catch (error) {
        console.error('Error al leer el archivo noticias.json:', error.message);
    }
};

// Guardar datos en el archivo JSON
function guardarDatos() {
    fs.writeFileSync('noticias.json', JSON.stringify(noticias, null, 2));
}

router.get('/scraping', async (req, res) => {
    try {
        const response = await axios.get(url);
        const html = response.data
        const $ = cheerio.load(html)
        arrTitulos = [];
        arrEnlances = [];
        arrDescrip = [];
        arrImg = [];

        $('.c_t a').each((index, elemento) => {
            const titulo = $(elemento).text();
            arrTitulos.push(titulo);
            const enlace = $(elemento).attr('href');
            arrEnlances.push(enlace)
        })

        $('.c_d').each((index, elemento) => {
            const descripcion = $(elemento).text()
            arrDescrip.push(descripcion);
        })

        $('.b-st_a img').each((index, elemento) => {
            const imagen = $(elemento).attr('src');
            arrImg.push(imagen);
        })

        for (let i = 0; i < arrTitulos.length; i++) {
            const noticia = {
                id: i,
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

router.post('/scraping', (req, res) => {
    leerDatos();
    const noticia = {
        id: noticias.length,
        titulo: req.body.titulo,
        imagen: req.body.imagen,
        descripcion: req.body.descripcion,
        enlace: req.body.enlace,
    };
    noticias.push(noticia);
    guardarDatos();
})

router.get('/scraping/:id', (req, res) => {
    const id = req.params.id;
    noticias = leerDatos();
    const findNews = noticias.find(noticia => noticia.id == id)
    res.json(findNews)
    console.log(findNews)

});

router.put('/scraping/:id', (req, res) => {
    noticias = leerDatos();
    const id = req.params.id;
    const index = noticias.findIndex(noticia => noticia.id == id);
    if (index != -1) {
        noticias[index] = {
            id: noticias[index].id,
            titulo: req.body.titulo,
            imagen: req.body.imagen,
            descripcion: req.body.descripcion,
            enlace: req.body.enlace,
        };
        guardarDatos();
        res.json(noticias[index]);
    } else {
        res.status(404).send('Noticia no encontrada')
    };
});

router.delete('/scraping/:id', (req, res) => {
    leerDatos();
    const id = req.params.id;
    noticias = noticias.filter(noticia => noticia.id != id);
    res.json(noticias);

});

module.exports = router;