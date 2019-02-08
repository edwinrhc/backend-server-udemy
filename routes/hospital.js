var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');
// var jwt = require('jsonwebtoken');

var app = express();
var Hospital = require('../models/hospital');

// ===============================
// Obtener todos los hospitales
// ==============================


// Rutas
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5) // el limite que muestra los resultados
        .populate('usuario', 'nombre correo')
        .exec(
            (err, hospitales) => {

                if (err) {

                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });


                });


            });

});


// ===============================
// Obtener Hospital
// ==============================
app.get('/:id', (req, res) => {
            var id = req.params.id;
            Hospital.findById(id)
                .populate('usuario', 'nombre img email')
                .exec((err, hospital) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al buscar hospital',
                                errors: err
                            });
                        }
                        if (!hospital) {
                            return res.status(400).json({
                                    ok: false,
                                    mensaje: 'El hospital con el id ' + id + 'no existe ',
                                    errors: {
                                        message: 'No existe un hospital con ese ID ' }
                                    });
                            }
                            res.status(200).json({
                                ok: true,
                                hospital: hospital
                            });
                        })
                })


// ===============================
// Actualizar Hospital
// ==============================
        app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

            var id = req.params.id;
            var body = req.body;
            Hospital.findById(id, (err, hospital) => {



                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar Hospital',
                        erros: err
                    });
                }

                if (!hospital) {

                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El hospital con el id ' + id + 'no existe',
                        errors: {
                            message: 'No existe un hospital con ese ID'
                        }

                    });
                }

                hospital.nombre = body.nombre;
                hospital.usuario = req.usuario._id;


                hospital.save((err, hospitalGuardado) => {

                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al actualizar  hospital',
                            erros: err
                        });
                    }



                    res.status(200).json({
                        ok: true,
                        hospital: hospitalGuardado
                    });
                });


            })

        });


        // ===============================
        // Crear un nuevo Hospital
        // ==============================
        app.post('/', mdAutenticacion.verificaToken, (req, res) => {

            var body = req.body;
            //  e New usuario hacer referencia al modelo de datos de usuario
            var hospital = new Hospital({

                nombre: body.nombre,
                usuario: req.usuario._id
            });

            hospital.save((err, hospitalGuardado) => {

                if (err) {

                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al crear usuario',
                        errors: err
                    });
                }
                //  si todo lo hace correctamente entonces procedemos con este codigo
                res.status(201).json({
                    ok: true,
                    hospital: hospitalGuardado

                });


            });

        });


        // ===============================
        // Borrar Hospital
        // ==============================
        app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

            var id = req.params.id;

            Hospital.findByIdAndRemove(id, (err, hospitaloBorrado) => {

                if (err) {

                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al borrar hospital',
                        errors: err
                    });
                }

                if (!hospitaloBorrado) {

                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No existe hospital con ese id',
                        errors: {
                            message: 'No existe hospital con ese id '
                        }
                    });
                }



                //  si todo lo hace correctamente entonces procedemos con este codigo
                res.status(200).json({
                    ok: true,
                    hospital: hospitaloBorrado
                });


            })
        });



        module.exports = app;