var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;


// ===============================
// Verficar Token
// ==============================
exports.verificaToken = function( req, res, next ) {

    
    var token = req.query.toke;
    //  si tenemos el token en la mano necesito

    jwt.verify( token, SEED, ( err, decoded ) => {

        if( err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Toke incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();

    });


}



