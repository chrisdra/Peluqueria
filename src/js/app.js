let pagina = 1;

const cita = {
    nombre: '',
    fecha: '',
    hora: '',
    servicios: []
}

document.addEventListener('DOMContentLoaded', function() {
    iniciarApp();
});

function iniciarApp(){
    mostrarServicios();

    //Resalta el Div Actual segun el tab al que se presiona
    mostrarSeccion();

    //Oculta o muestra una seccion segun el tab al que se presiona
    cambiarSeccion();

    //Paginacion siguiente y anterior
    paginaSiguiente();

    paginaAnterior();

    //comprueba la pagina actual para ocultar o mostrar la paginacion
    botonesPaginador();

    //Muestra el resumen de la cita (o mensaje de error en caso de no pasar la validacion)
    mostrarResumen();

    //Almacena el nombre de la cita en el obj
    nombreCita();

    //Almacena la fecha de la cita en el objeto
    fechaCita();

    //Ddeshabilita dias pasados
    deshabilitarFechaAnterior();

    //Almacena la hora de la cita en el objeto
    horaCita();
}

function mostrarSeccion() {

    //Eliminar mostrar-seccion de la seccion anterior
    const seccionAnterior = document.querySelector('.mostrar-seccion');
    if( seccionAnterior ) {
        seccionAnterior.classList.remove('mostrar-seccion');
    }     

    const seccionActual = document.querySelector(`#paso-${pagina}`);
    seccionActual.classList.add('mostrar-seccion');

    //Eliminar la clase de actual en el tab anterior
    const tabAnterior = document.querySelector('.tabs .actual');
    if( tabAnterior ) {
        tabAnterior.classList.remove('actual');
    }
    
    //resalta el tab actual
    const tab = document.querySelector(`[data-paso="${pagina}"]`);
    tab.classList.add('actual');
}

function cambiarSeccion() {
    const enlaces = document.querySelectorAll('.tabs button');

    enlaces.forEach( enlace => {
        enlace.addEventListener('click', e => {
            e.preventDefault();
            pagina = parseInt(e.target.dataset.paso);
            
            // //Agregar mostrar-seccion donde dimos click
            // const seccion = document.querySelector(`#paso-${pagina}`);
            // seccion.classList.add('mostrar-seccion');

            
            // //Agregar la clase de actual en el nuevo tab
            // const tab = document.querySelector(`[data-paso="${pagina}"]`);
            // tab.classList.add('actual');

            //Llamar la funci??n de mostrar secci??n
            mostrarSeccion();

            botonesPaginador();
        })
    })
}

async function mostrarServicios(){
    try {
        const url = 'http://localhost:3000/servicios.php';
        const resultado = await fetch(url); 
        const db = await resultado.json();

        //console.log(db);

        const { servicios } = db;
        
        //Generar el HTML
        db.forEach ( servicio => {
            const { id, nombre, precio } = servicio;
            
            //DOM Scripting
            //Generar nombre del servicio
            const nombreServicio = document.createElement('P');
            nombreServicio.textContent = nombre;
            nombreServicio.classList.add('nombre-servicio');

            //Generar precio del servicio
            const precioServicio = document.createElement('P');
            precioServicio.textContent = `$ ${precio}`;
            precioServicio.classList.add('precio-servicio');

            //Generar div contenedor servicio
            const servicioDiv = document.createElement('DIV');
            servicioDiv.classList.add('servicio');
            servicioDiv.dataset.idServicio = id;

            //Selecciona un servicio para la cita
            servicioDiv.onclick = seleccionarServicio;


            //Inyectar precio y nombre al div servicio
            servicioDiv.appendChild(nombreServicio);
            servicioDiv.appendChild(precioServicio);

            //Inyectarlo en el HTML
            document.querySelector('#servicios').appendChild(servicioDiv);
        } )
    } catch (error) {
        console.log(error);
    }
}

function seleccionarServicio(e) {
    
    let elemento;
    //Forzar que el elemento al cual le damos click sea el div
    if(e.target.tagName === 'P') {
        elemento = e.target.parentElement;
    } else {
        elemento = e.target;
    }

    if(elemento.classList.contains('seleccionado')) {
        elemento.classList.remove('seleccionado');

        const id = parseInt( elemento.dataset.idServicio);

        //console.log( elemento.dataset.idServicio);
        eliminarServicio(id);
    } else {
        elemento.classList.add('seleccionado');

        const servicioObj = {
            id: parseInt( elemento.dataset.idServicio),
            nombre: elemento.firstElementChild.textContent,
            precio: elemento.firstElementChild.nextElementSibling.textContent
        }

        //console.log(servicioObj);
        agregarServicio(servicioObj);
    }
}

function eliminarServicio(id) {
    const { servicios } = cita;
    cita.servicios = servicios.filter( servicio => servicio.id !== id);
    
    console.log(cita);
}

function agregarServicio(servicioObj) {
    const { servicios } = cita;

    cita.servicios = [...servicios, servicioObj];
    
    
    console.log(cita);
}

function paginaSiguiente() {
    const paginaSiguiente = document.querySelector('#siguiente');
    paginaSiguiente.addEventListener('click', () => {
        pagina++;

        console.log(pagina);

        botonesPaginador();
    });
}

function paginaAnterior() {
    const paginaAnterior = document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', () => {
        pagina--;

        console.log(pagina);

        botonesPaginador();
    });
}

function botonesPaginador() {
    const paginaSiguiente = document.querySelector('#siguiente');
    const paginaAnterior = document.querySelector('#anterior');

    if (pagina === 1){
        paginaAnterior.classList.add('ocultar');
    } else if (pagina === 3) {
        paginaSiguiente.classList.add('ocultar');
        paginaAnterior.classList.remove('ocultar');


        mostrarResumen(); //Estamos en la pagina 3, carga el resumen de la cita
    } else {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    }

    mostrarSeccion(); //Cambia la seccion que muestra
}

function mostrarResumen() {
    //Destructuring
    const { nombre, fecha, hora, servicios} = cita;

    
    //Seleccionar el resumen
    const resumenDiv = document.querySelector('.contenido-resumen');

    //Limpia el HTML previo
    while( resumenDiv.firstChild) {
        resumenDiv.removeChild( resumenDiv.firstChild );
    }

    //validacion de objeto
    if(Object.values(cita).includes('')) {
        const noServicios = document.createElement('P');
        noServicios.textContent = 'Faltan datos de Servicios, hora, fecha o nombre'

        noServicios.classList.add('invalidar-cita');

        //Agregar a resumen Div
        resumenDiv.appendChild(noServicios);
        return;
    } 

    const headingCita = document.createElement('H3');
    headingCita.textContent = 'Resumen de Cita';

    //Mostrar el resumen
    const nombreCita = document.createElement('P');
    nombreCita.innerHTML = `<span>Nombre:</span> ${nombre}`;

    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Fecha:</span> ${fecha}`;

    const horaCita = document.createElement('P');
    horaCita.innerHTML = `<span>Hora:</span> ${hora}`;

    const serviciosCita = document.createElement('DIV');
    serviciosCita.classList.add('resumen-servicios');

    const headingServicios = document.createElement('H3');
    headingServicios.textContent = 'Resumen de Servicios';

    serviciosCita.appendChild(headingServicios);

    let cantidad = 0;

    //Iterar sobre el arreglo de servicios
    servicios.forEach( servicio => {

        const { nombre, precio } = servicio;
        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicio');

        const textoServicio = document.createElement('P');
        textoServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.textContent = precio;
        precioServicio.classList.add('precio');

        const totalServicio = precio.split('$');
        //console.log(parseInt( totalServicio[1].trim()));

        cantidad += parseInt( totalServicio[1].trim());

        //Colocar texto y precio en el div
        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);

        serviciosCita.appendChild(contenedorServicio);
    });

    resumenDiv.appendChild(headingCita);
    resumenDiv.appendChild(nombreCita);
    resumenDiv.appendChild(fechaCita);
    resumenDiv.appendChild(horaCita);

    resumenDiv.appendChild(serviciosCita);

    const cantidadPagar = document.createElement('P');
    cantidadPagar.classList.add('total');
    cantidadPagar.innerHTML = `<span>Total a Pagar: </span> $ ${cantidad}`;

    resumenDiv.appendChild(cantidadPagar);
}

function nombreCita() {
    const nombreInput = document.querySelector('#nombre');

    nombreInput.addEventListener('input', e => {
        const nombreTexto = e.target.value.trim();

        //Validacion de que nombreTexto debe tener algo
        if( nombreTexto === '' || nombreTexto.length < 3 ){
            mostrarAlerta('Nombre no valido', 'error');
        } else {
            const alerta = document.querySelector('.alerta');
            if(alerta){
                alerta.remove();
            }
            cita.nombre = nombreTexto;
        }
        //console.log(e.target.values);
    })
}

function mostrarAlerta(mensaje, tipo) {

    //Si hay una alerta previa, no crear otra
    const alertaPrevia = document.querySelector('.alerta');
    if(alertaPrevia){
        return;
    }

    console.log('El mensaje es ', mensaje);

    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');

    if(tipo === 'error') {
        alerta.classList.add('error');
    }

    //Insertar en el HTML
    const formulario = document.querySelector('.formulario');
    formulario.appendChild( alerta );

    //Eliminar la alerta despues de 3 segundos
    setTimeout(() => {
        alerta.remove();
    }, 3000);
}

function fechaCita() {
    const fechaInput = document.querySelector('#fecha');
    fechaInput.addEventListener('input', e => {

        const dia = new Date(e.target.value).getUTCDay();

        //0 indica dia domingo y 6 dia sabado
        if([0, 6].includes(dia)) {
            e.preventDefault();
            fechaInput.value = '';
            mostrarAlerta('Fines de Semana no son permitidos', 'error');
        } else {
            cita.fecha = fechaInput.value;

            console.log(cita);
        }
    });
}

function deshabilitarFechaAnterior() {
    const inputFecha = document.querySelector('#fecha');

    const fechaAhora = new Date();
    const year = fechaAhora.getFullYear();
    const mes = fechaAhora.getMonth() + 1;
    const dia = fechaAhora.getDate() + 1; //Esto permitira que no sea seleccionado el mismo dia en el cual esta solicitando hora

    const fechaDeshabilitar = `${year}-${mes}-${dia}`;

    inputFecha.min = fechaDeshabilitar;

}

function horaCita() {
    const inputHora = document.querySelector('#hora');
    inputHora.addEventListener('input', e => {

        const horaCita = e.target.value;
        const hora = horaCita.split(':');

        if(hora[0] < 10 || hora[0] > 18) {
            mostrarAlerta('Horas no validas', 'error');
            setTimeout(() => {
                inputHora.value = '';
            }, 3000);
        } else {
            cita.hora = horaCita;

            console.log(cita);
        }
    });   
}