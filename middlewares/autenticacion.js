var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;


// ===============================
// Verficar Token
// ==============================
exports.verificaToken = function( req, res, next ) {

    
    var token = req.query.token;
    //  si tenemos el token en la mano necesito

    jwt.verify( token, SEED, ( err, decoded ) => {

        if( err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();

    });


}

// ===============================
// Verficar ADMIN
// ==============================
exports.verificaAdmin_ROLE= function( req, res, next ) {


    var usuario = req.usuario;

    if( usuario.role === 'ADMIN_ROLE') {

        next();
        return;

    }else{

        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es adminstrador',
            errors: { message: 'No es adminstrador, no puede hacer eso'}
        });

    }
}

// ===============================
// Verficar ADMIN o MISMO USUARIO
// ==============================
exports.verificaAdmin_o_MismoUsuario= function( req, res, next ) {


    var usuario = req.usuario;
    var id = req.params.id;

    if( usuario.role === 'ADMIN_ROLE' || usuario._id === id ) {

        next();
        return;

    }else{

        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es adminstrador ni es el mismo usuario',
            errors: { message: 'No es adminstrador, no puede hacer eso'}
        });

    }
}
