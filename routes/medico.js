var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');
var jwt = require('jsonwebtoken');

var app = express();
var Medico = require('../models/medico');

// ===============================
// Obtener todos los medicos
// ==============================


// Rutas
app.get('/',(req,res,next) => {

    var  desde  = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre correo')
        .populate('hospital')
        .exec(
            (err, medicos) => {

                if( err) {

                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) =>{
                    
                    res.status(200).json({
                        ok:true,
                        medicos: medicos,
                        total: conteo
                    });

                });
                
            });

});

// ===============================
// Actualizar Medico
// ==============================
app.put('/:id', mdAutenticacion.verificaToken , (req,res) => {

    var id = req.params.id;
    var body = req.body;
    Medico.findById( id,  (err, medico)=> {

       

        if(err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Medico',
                erros: err
            });
        }

        if( !medico ){

            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + 'no existe',
                errors: { message: 'No existe un medico con ese ID'}

            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;
      

        medico.save( (err, medicoGuardado) => {

            if ( err ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar  medico',
                    erros: err
                });
            }

          

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });

       
    })

});


// ===============================
// Crear un nuevo Medico
// ==============================
app.post('/', mdAutenticacion.verificaToken ,(req, res) => {

    var body = req.body;
//  e New usuario hacer referencia al modelo de datos de usuario
    var medico = new Medico({

        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save( (err, medicoGuardado ) => {

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
            medico: medicoGuardado
        
        });


     });

});


// ===============================
// Borrar Medico
// ==============================
app.delete('/:id', mdAutenticacion.verificaToken , (req, res) => {
   
    var id  = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if( err) {

            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if( !medicoBorrado ) {

            return res.status(400).json({
                ok: false,
                mensaje: 'No existe medico con ese id',
                errors: {message: 'No existe medico con ese id '}
            });
        }



        //  si todo lo hace correctamente entonces procedemos con este codigo
        res.status(200).json({
            ok:true,
            medico: medicoBorrado
        });


    })
});



module.exports = app;