var express = require('express');
var app = express();
// Es para saltar las carpetas de manera mas simple
const path = require('path');
//  File System
const fs = require('fs');

// Rutas
app.get('/:tipo/:img',(req,res,next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    //  ___dirname informa que todo la ruta de donde me encuentra en este momento
    var pathImagen = path.resolve( __dirname, `../uploads/${tipo}/${img}`);

    if(fs.existsSync( pathImagen)) {

        res.sendFile( pathImagen);

    }else{
        var pathNoImage = path.resolve( __dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImage);
    }



});

module.exports = app;