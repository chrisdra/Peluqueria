<?php

function obtenerServicios() : array {
    try {
        //Importar una conexion
        require 'database.php';

        //Escribir el codigo SQL
        $sql = "SELECT * FROM servicios;";

        $consulta = mysqli_query($db, $sql);
        
        //Arreglo vacio
        $servicios = [];

        $i = 0;
        
        //Obtener los resultados
        while( $row = mysqli_fetch_assoc($consulta) ) {
            $servicios[$i]['id'] = $row['id'];
            $servicios[$i]['nombre'] = $row['nombre'];
            $servicios[$i]['precio'] = $row['precio'];

            $i++;
        }
        
        // echo "<pre>";
        // var_dump( $servicios );
        // echo "</pre>";

        return $servicios;

    } catch(\Throwable $th) {
        //throw $th

        var_dump($th);
    }
}

obtenerServicios();