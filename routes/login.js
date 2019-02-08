var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');
// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const {
    OAuth2Client
} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// =========================================
//  Autencación De Google
// =========================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, 
    });

    const payload = ticket.getPayload();
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async (req, res) => {

    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {

            return res.status(403).json({
                ok: false,
                mensaje: 'Token no válido'
            });

        });
    // Verificar los datos como correo en la BD
    Usuario.findOne({
        email: googleUser.email
    }, (err, usuarioBD) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (usuarioBD) {

            if (usuarioBD.google === false) {

                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación normal'

                });
            } else {

                var token = jwt.sign({
                    usuario: usuarioBD
                }, SEED, {
                    expiresIn: 14400
                }); // 4 horas


                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD.id,
                 menu: obtenerMenu(usuarioBD.role)
                });

            }
        } else {

            //  El usuario no exsite, ¡Hay que crearlo!
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioBD) => {

                var token = jwt.sign({
                    usuario: usuarioBD
                }, SEED, {
                    expiresIn: 14400
                }); // 4 horas
                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD.id,
                    menu: obtenerMenu(usuarioBD.role)
                });

            });
        }
    });

})

// =========================================
//  Autencación Normal
// =========================================

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({
        email: body.email
    }, (err, usuarioBD) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioBD) {
            return res.status(400).json({

                ok: false,
                mensaje: 'Credenciales incorrectas - Correo',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({

                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err

            });
        }

        //  Crear un token!!!
        usuarioBD.password = ':)';

        var token = jwt.sign({
            usuario: usuarioBD
        }, SEED, {
            expiresIn: 14400
        }); // 4 horas


        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD.id,
            menu: obtenerMenu(usuarioBD.role)
        });

    });



});

function obtenerMenu(ROLE) {

    var menu =  [
        {
          titulo: 'Principal',
          icono: 'mdi mdi-gauge',
          submenu: [
            { titulo: 'Dashboard', url: '/dashboard' },
            { titulo: 'ProgressBar', url: '/progress' },
            { titulo: 'Gráficas', url: '/graficas1' },
            { titulo: 'Promesas', url: '/promesas' },
            { titulo: 'Rxjs', url: '/rxjs' }
          ]
    
        },
        {
    
          titulo: 'Mantenimiento',
          icono: 'mdi mdi-folder-look-open',
          submenu: [
    
            // { titulo: 'Usuarios', url: '/usuarios'},
            { titulo: 'Hospitales', url: '/hospitales' },
            { titulo: 'Médicos', url: '/medicos'}
          ]
    
        }
      ];
    

      console.log('ROLE',ROLE);
      if ( ROLE === 'ADMIN_ROLE') {

        menu[1].submenu.unshift( { titulo: 'Usuarios', url: '/usuarios'});
      }

    return menu;
}

module.exports = app;