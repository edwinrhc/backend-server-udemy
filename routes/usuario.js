var express = require('express');
var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();
var Usuario = require('../models/usuario');

// ===============================
// Obtener todos los usuarios
// ==============================

// Rutas
app.get('/',(req, res, next) => {

    var  desde  = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google')
                .skip(desde)
                .limit(5)
            .exec(
             (err, usuarios) => {

        if( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuario',
                errors: err
            });
        }

        Usuario.count({}, (err, conteo) => {
            
            res.status(200).json({
                ok:true,
                usuarios: usuarios,
                total: conteo
            }); 

        });

    });

});


// ===============================
// Actualizar un  Usuario
// ==============================
app.put('/:id',[mdAutenticacion.verificaToken, mdAutenticacion.verificaAdmin_o_MismoUsuario ] , (req,res) => {

    var id = req.params.id;
    var body = req.body;
    Usuario.findById( id,  (err, usuario)=> {

       

        if(err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Usuario',
                erros: err
            });
        }

        if( !usuario ){

            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + 'no existe',
                errors: { message: 'No existe un usuario con ese ID'}

            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save( (err, usuarioGuardado) => {

            if ( err ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar  usuario',
                    erros: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });

       
    })

});

// ===============================
// Crear un nuevo Usuario
// ============================== mdAutenticacion.verificaToken ,
app.post('/', (req, res) => {

    var body = req.body;
//  e New usuario hacer referencia al modelo de datos de usuario
    var usuario = new Usuario({

        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password,10),
        img: body.img,
        role: body.role
    });

    usuario.save( (err, usuarioGuardado ) => {

        if( err) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }
        //  si todo lo hace correctamente entonces procedemos con este codigo
        res.status(201).json({
            ok:true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });


     });

});

// ===============================
// Borrar Usuario
// ==============================
app.delete('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaAdmin_ROLE] , (req, res) => {
   
    var id  = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if( err) {

            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if( !usuarioBorrado ) {

            return res.status(400).json({
                ok: false,
                mensaje: 'No existe usuario con ese id',
                errors: {message: 'No existe usuario con ese id '}
            });
        }



        //  si todo lo hace correctamente entonces procedemos con este codigo
        res.status(200).json({
            ok:true,
            usuario: usuarioBorrado
        });


    })
});


module.exports = app;