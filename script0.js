document.addEventListener('DOMContentLoaded', function() {
    const matriculaForm = document.getElementById('matriculaForm');
    if (matriculaForm) {

        function showError(input, message) {
            // Usa el span de error específico para el input o crea uno si no existe
            let errorElement = input.nextElementSibling;
            if (!errorElement || !errorElement.classList.contains('error-message')) {
                errorElement = document.createElement('span');
                errorElement.classList.add('error-message');
                // Asegúrate de que el span de error esté justo después del input
                input.parentNode.insertBefore(errorElement, input.nextSibling);
            }
            errorElement.textContent = message;
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
        }

        const BACKEND_URL = window.BACKEND_API_URL || 'https://corporate-marketa-odvin123-2e265ec9.koyeb.app';

        setFechaMatriculaToday(); // Establece la fecha de matrícula al cargar


        function clearError(input) {
            // Elimina el span de error si existe
            const errorElement = input.nextElementSibling;
            if (errorElement && errorElement.classList.contains('error-message')) {
                errorElement.remove();
            }
            input.classList.remove('is-invalid');
            // Añade la clase 'is-valid' solo si el campo no es de solo lectura y tiene valor
            if (input.value.trim() !== '' && !input.readOnly) {
                input.classList.add('is-valid');
            } else {
                input.classList.remove('is-valid');
            }
        }


        function setFechaMatriculaToday() {
            const fechaMatriculaInput = document.getElementById('fechaMatricula');
            if (fechaMatriculaInput) {
                const today = new Date();
                const day = String(today.getDate()).padStart(2, '0');
                const month = String(today.getMonth() + 1).padStart(2, '0'); // Meses son 0-indexados
                const year = today.getFullYear();
                fechaMatriculaInput.value = `${day}/${month}/${year}`; // Formato DD/MM/YYYY
                clearError(fechaMatriculaInput); // Limpiar cualquier error previo
            }
        }

        // Función de validación: solo letras y espacios
        function applyLettersOnlyValidation(inputElement, fieldName) {
            if (inputElement) {
                inputElement.addEventListener('input', function(event) {
                    const inputValue = event.target.value;
                    const sanitizedValue = inputValue.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ''); // Permite letras, espacios y caracteres acentuados
                    event.target.value = sanitizedValue; // Actualiza el valor del input sin números

                    if (inputValue !== sanitizedValue) {
                        showError(this, `Solo se permiten letras y espacios para ${fieldName}. Ejemplo: ABCD`);
                    } else {
                        clearError(this);
                    }
                });

                inputElement.addEventListener('blur', function() {
                    if (this.value.trim() === '') {
                        clearError(this); // Si está vacío, no hay error de formato
                    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(this.value)) {
                        showError(this, `Solo se permiten letras y espacios para ${fieldName}. Ejemplo: ABCD`);
                    } else {
                        clearError(this);
                        this.classList.add('is-valid');
                    }
                });
            }
        }

        // Función de validación: solo números y longitud exacta para teléfono
        function applyPhoneValidation(inputElement, exactLength, example) {
            if (inputElement) {
                inputElement.addEventListener('input', function(event) {
                    const inputValue = event.target.value;
                    const sanitizedValue = inputValue.replace(/[^0-9]/g, '');
                    event.target.value = sanitizedValue;

                    if (inputValue !== sanitizedValue) {
                        showError(this, 'Solo se permiten números. Ejemplo: ' + example);
                    } else {
                        clearError(this);
                    }

                    if (sanitizedValue.length > 0 && sanitizedValue.length < exactLength) {
                        showError(this, `Faltan ${exactLength - sanitizedValue.length} dígitos. Ejemplo: ${example}`);
                    } else if (sanitizedValue.length > exactLength) {
                        event.target.value = sanitizedValue.slice(0, exactLength); // Trunca si excede la longitud
                        showError(this, `El número debe tener exactamente ${exactLength} dígitos. Ejemplo: ${example}`);
                    } else if (sanitizedValue.length === exactLength) {
                        clearError(this);
                        this.classList.add('is-valid');
                    } else {
                        clearError(this);
                    }
                });

                inputElement.addEventListener('blur', function() {
                    if (this.value.trim() === '') {
                        clearError(this);
                    } else if (this.value.length !== exactLength) {
                        showError(this, `El número debe tener exactamente ${exactLength} dígitos. Ejemplo: ${example}`);
                    } else if (!/^[0-9]+$/.test(this.value)) {
                        showError(this, 'Solo se permiten números. Ejemplo: ' + example);
                    } else {
                        clearError(this);
                        this.classList.add('is-valid');
                    }
                });
            }
        }

        // Función de validación de cédula (formato nicaragüense)
        function applyCedulaValidation(inputElement) {
            if (inputElement) {
                inputElement.addEventListener('input', function() {
                    let value = this.value.toUpperCase().replace(/[^0-9A-Z]/g, ''); // Solo números y letras, mayúsculas
                    let formattedValue = '';

                    // Aplica el formato XXX-XXXXXX-XXXXA
                    if (value.length > 0) {
                        formattedValue += value.substring(0, 3);
                        if (value.length > 3) {
                            formattedValue += '-' + value.substring(3, 9);
                            if (value.length > 9) {
                                formattedValue += '-' + value.substring(9, 13);
                                if (value.length > 13) {
                                    formattedValue += value.substring(13, 14); // Última letra
                                }
                            }
                        }
                    }
                    // Limita la longitud total a 16 (incluyendo guiones)
                    if (formattedValue.length > 16) {
                        formattedValue = formattedValue.slice(0, 16);
                    }
                    this.value = formattedValue;

                    // Mostrar error si el formato es incorrecto o incompleto
                    if (formattedValue.length > 0 && formattedValue.length < 16) {
                        if (formattedValue.length > 3 && formattedValue[3] !== '-') {
                            showError(this, 'Formato de cédula nicaragüense incorrecto. Ejemplo: 123-456789-0123A');
                        } else if (formattedValue.length > 10 && formattedValue[10] !== '-') {
                            showError(this, 'Formato de cédula nicaragüense incorrecto. Ejemplo: 123-456789-0123A');
                        } else {
                            clearError(this);
                        }
                    } else {
                        clearError(this);
                    }
                });

                inputElement.addEventListener('blur', function() {
                    if (this.value.trim() === '') {
                        clearError(this);
                    } else if (!/^\d{3}-\d{6}-\d{4}[A-Z]$/.test(this.value)) {
                        showError(this, 'Formato de cédula nicaragüense incorrecto. Debe ser XXX-XXXXXX-XXXXA. Ejemplo: 123-456789-0123A');
                    } else {
                        clearError(this);
                        this.classList.add('is-valid');
                    }
                });
            }
        }

        // Función de validación: números positivos (peso, talla)
        function applyPositiveNumberValidation(inputElement, fieldName) {
            if (inputElement) {
                inputElement.addEventListener('input', function() {
                    let value = parseFloat(this.value);
                    if (isNaN(value) || value <= 0) {
                        showError(this, `El campo ${fieldName} debe ser un número positivo mayor que 0.`);
                    } else {
                        clearError(this);
                    }
                });
                inputElement.addEventListener('blur', function() {
                    let value = parseFloat(this.value);
                    if (isNaN(value) || value <= 0) {
                        showError(this, `El campo ${fieldName} debe ser un número positivo mayor que 0.`);
                    } else {
                        clearError(this);
                        this.classList.add('is-valid');
                    }
                });
            }
        }

        // Lógica para País de Nacimiento (dependiendo de Nacionalidad)
        function setupNationalityDependentFields() {
            const nacionalidadSelect = document.getElementById('nacionalidad');
            const paisNacimientoInput = document.getElementById('paisNacimiento');

            const updatePaisNacimiento = () => {
                if (nacionalidadSelect.value === 'Nicaragüense') {
                    paisNacimientoInput.value = 'Nicaragua';
                    paisNacimientoInput.readOnly = true;
                    clearError(paisNacimientoInput);
                } else if (nacionalidadSelect.value === 'Extranjero') {
                    paisNacimientoInput.value = '';
                    paisNacimientoInput.readOnly = false;
                    paisNacimientoInput.placeholder = 'Ingrese el país de nacimiento';
                } else {
                    paisNacimientoInput.value = '';
                    paisNacimientoInput.readOnly = false;
                    paisNacimientoInput.placeholder = '';
                }
                clearError(paisNacimientoInput); // Limpiar errores después de cambiar el estado
            };

            if (nacionalidadSelect && paisNacimientoInput) {
                nacionalidadSelect.addEventListener('change', updatePaisNacimiento);
                updatePaisNacimiento(); // Ejecutar al cargar la página
            }
        }

        // Lógica para filtrar Grado y establecer Modalidad según Nivel Educativo
        function setupGradeAndModalityFiltering() {
            const nivelEducativoSelect = document.getElementById('nivelEducativo');
            const gradoSelect = document.getElementById('grado');
            const modalidadInput = document.getElementById('modalidad');

            if (nivelEducativoSelect && gradoSelect && modalidadInput) {
                const initialGradoOptions = Array.from(gradoSelect.options); // Guardar todas las opciones originales

                const filterOptions = () => {
                    const selectedNivel = nivelEducativoSelect.value;

                    // Limpiar y añadir la opción por defecto
                    gradoSelect.innerHTML = '';
                    const defaultGradoOption = document.createElement('option');
                    defaultGradoOption.value = '';
                    defaultGradoOption.textContent = 'Seleccione una opción';
                    gradoSelect.appendChild(defaultGradoOption);

                    let filteredGradoOptions = [];
                    if (selectedNivel === 'Educación Inicial') {
                        filteredGradoOptions = initialGradoOptions.filter(option =>
                            ['Primer Nivel', 'Segundo Nivel', 'Tercer Nivel'].includes(option.textContent)
                        );
                    } else if (selectedNivel === 'Educación Primaria') {
                        filteredGradoOptions = initialGradoOptions.filter(option =>
                            ['Primer grado', 'Segundo grado', 'Tercer grado', 'Cuarto grado', 'Quinto grado', 'Sexto grado'].includes(option.textContent)
                        );
                    } else if (selectedNivel === 'Educación Secundaria') {
                        filteredGradoOptions = initialGradoOptions.filter(option =>
                            ['Séptimo grado/Primer año', 'Octavo grado/Segundo año', 'Noveno grado/Tercer año', 'Décimo grado/Cuarto año', 'Undécimo grado/Quinto año'].includes(option.textContent)
                        );
                    }
                    // Añadir las opciones filtradas al select de grado
                    filteredGradoOptions.forEach(option => gradoSelect.appendChild(option.cloneNode(true)));
                    gradoSelect.value = ''; // Resetear la selección de grado

                    // Establecer la modalidad según el nivel educativo
                    if (selectedNivel === 'Educación Inicial') {
                        modalidadInput.value = 'Preescolar-formal';
                    } else if (selectedNivel === 'Educación Primaria') {
                        modalidadInput.value = 'Primaria';
                    } else if (selectedNivel === 'Educación Secundaria') {
                        modalidadInput.value = 'Secundaria';
                    } else {
                        modalidadInput.value = '';
                    }
                    clearError(modalidadInput); // Limpiar cualquier error previo
                };

                nivelEducativoSelect.addEventListener('change', filterOptions);
                filterOptions(); // Ejecutar al cargar la página para establecer el estado inicial
            }
        }

        // Sincronizar campos de ubicación del estudiante con los académicos
        function synchronizeLocationFields() {
            const studentDepartmentSelect = document.getElementById('departamento');
            const studentMunicipioSelect = document.getElementById('municipio');
            const academicDepartmentInput = document.getElementById('departamentoacad');
            const academicMunicipioInput = document.getElementById('municipioAcad');

            const updateAcademicLocation = () => {
                academicDepartmentInput.value = studentDepartmentSelect.value;
                academicMunicipioInput.value = studentMunicipioSelect.value;
                clearError(academicDepartmentInput);
                clearError(academicMunicipioInput);
            };

            if (studentDepartmentSelect && studentMunicipioSelect && academicDepartmentInput && academicMunicipioInput) {
                studentDepartmentSelect.addEventListener('change', updateAcademicLocation);
                studentMunicipioSelect.addEventListener('change', updateAcademicLocation);
                updateAcademicLocation(); // Ejecutar al cargar la página
            }
        }

        // --- Aplicar Validaciones a los Campos ---

        // Validaciones para DATOS PERSONALES DEL ESTUDIANTE
        applyLettersOnlyValidation(document.getElementById('nombre'), 'Primer Nombre');
        applyLettersOnlyValidation(document.getElementById('segundoNombre'), 'Segundo Nombre');
        applyLettersOnlyValidation(document.getElementById('apellido1'), 'Primer Apellido');
        applyLettersOnlyValidation(document.getElementById('apellido2'), 'Segundo Apellido');
        applyPhoneValidation(document.getElementById('telefono'), 8, '88887777');
        applyPositiveNumberValidation(document.getElementById('peso'), 'peso');
        applyPositiveNumberValidation(document.getElementById('talla'), 'talla');
        applyLettersOnlyValidation(document.getElementById('paisNacimiento'), 'País de Nacimiento');
        applyLettersOnlyValidation(document.getElementById('territorioIndigena'), 'Territorio Indígena');
        applyLettersOnlyValidation(document.getElementById('habitaIndigena'), 'Habita Indígena');


        // Validaciones para DATOS PERSONALES DE LOS PADRES O TUTOR
        // Madre
        applyLettersOnlyValidation(document.getElementById('primerNombreMadre'), 'Primer Nombre de la Madre');
        applyLettersOnlyValidation(document.getElementById('segundoNombreMadre'), 'Segundo Nombre de la Madre');
        applyLettersOnlyValidation(document.getElementById('primerApellidoMadre'), 'Primer Apellido de la Madre');
        applyLettersOnlyValidation(document.getElementById('segundoApellidoMadre'), 'Segundo Apellido de la Madre');
        applyCedulaValidation(document.getElementById('cedulaMadre'));
        applyPhoneValidation(document.getElementById('telefonoMadre'), 8, '88887777');

        // Padre
        applyLettersOnlyValidation(document.getElementById('primerNombrePadre'), 'Primer Nombre del Padre');
        applyLettersOnlyValidation(document.getElementById('segundoNombrePadre'), 'Segundo Nombre del Padre');
        applyLettersOnlyValidation(document.getElementById('primerApellidoPadre'), 'Primer Apellido del Padre');
        applyLettersOnlyValidation(document.getElementById('segundoApellidoPadre'), 'Segundo Apellido del Padre');
        applyCedulaValidation(document.getElementById('cedulaPadre'));
        applyPhoneValidation(document.getElementById('telefonoPadre'), 8, '88887777');

        // Tutor
        applyLettersOnlyValidation(document.getElementById('primerNombreTutor'), 'Primer Nombre del Tutor');
        applyLettersOnlyValidation(document.getElementById('segundoNombreTutor'), 'Segundo Nombre del Tutor');
        applyLettersOnlyValidation(document.getElementById('primerApellidoTutor'), 'Primer Apellido del Tutor');
        applyLettersOnlyValidation(document.getElementById('segundoApellidoTutor'), 'Segundo Apellido del Tutor');
        applyCedulaValidation(document.getElementById('cedulaTutor'));
        applyPhoneValidation(document.getElementById('telefonoTutor'), 8, '88887777');


        // --- Configuración de campos dependientes ---
        setupNationalityDependentFields();
        setupGradeAndModalityFiltering();
        synchronizeLocationFields();


        // --- Manejo del envío del formulario ---
        matriculaForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Previene el envío por defecto del formulario

            const formData = new FormData(this);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value.trim(); // Recopila todos los datos del formulario
            }

            // Asegura que los valores de radio button se recojan correctamente
            data.turno = document.querySelector('input[name="turno"]:checked')?.value || '';
            data.repitente = document.querySelector('input[name="repitente"]:checked')?.value || '';

            let formIsValid = true; // Bandera para controlar la validez del formulario

            // Trigger blur event for all relevant inputs to run their validations
            this.querySelectorAll('input:not([type="radio"]), select, textarea').forEach(input => {
                if (!input.readOnly) { // No validar campos de solo lectura con blur si no son obligatorios o se llenan automáticamente
                    const event = new Event('blur');
                    input.dispatchEvent(event);
                    if (input.classList.contains('is-invalid')) {
                        formIsValid = false;
                    }
                }
            });

            // Validar campos obligatorios del estudiante
            const studentRequiredFields = ['telefono', 'direccion', 'nombre', 'apellido1', 'fechaNacimiento',
                'genero', 'peso', 'talla', 'nacionalidad', 'paisNacimiento',
                'departamento', 'municipio', 'lenguaMaterna', 'discapacidad'
            ];
            for (const fieldName of studentRequiredFields) {
                const inputElement = this.querySelector(`[name="${fieldName}"]`);
                if (inputElement && data[fieldName] === '') {
                    showError(inputElement, 'Este campo es obligatorio.');
                    formIsValid = false;
                }
            }

            // Validación de al menos un conjunto de datos de padres/tutor
            const isMadreComplete = data.primerNombreMadre || data.segundoNombreMadre || data.primerApellidoMadre || data.segundoApellidoMadre || data.tipoIdentificacionMadre || data.cedulaMadre || data.telefonoMadre;
            const isPadreComplete = data.primerNombrePadre || data.segundoNombrePadre || data.primerApellidoPadre || data.segundoApellidoPadre || data.tipoIdentificacionPadre || data.cedulaPadre || data.telefonoPadre;
            const isTutorComplete = data.primerNombreTutor || data.segundoNombreTutor || data.primerApellidoTutor || data.segundoApellidoTutor || data.tipoIdentificacionTutor || data.cedulaTutor || data.telefonoTutor;

            const errorMessageElement = document.getElementById('error-message');

            if (!isMadreComplete && !isPadreComplete && !isTutorComplete) {
                if (errorMessageElement) {
                    errorMessageElement.style.display = 'block';
                    errorMessageElement.textContent = "Debe completar al menos un conjunto de datos de contacto (madre, padre o tutor).";
                }
                formIsValid = false;
            } else {
                if (errorMessageElement) {
                    errorMessageElement.style.display = 'none';
                    errorMessageElement.textContent = "";
                }
            }


            // Validar campos obligatorios académicos (incluyendo radio buttons)
            const academicRequiredFields = ['fechaMatricula', 'departamentoacad', 'municipioAcad', 'codigoUnico',
                'codigoCentro', 'nombreCentro', 'nivelEducativo', 'modalidad',
                'turno', 'grado', 'seccion', 'repitente'
            ];
            for (const fieldName of academicRequiredFields) {
                const inputElement = this.querySelector(`[name="${fieldName}"]`);
                if (inputElement && inputElement.type === 'radio') {
                    const radioGroup = this.querySelectorAll(`input[name="${fieldName}"]`);
                    const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                    if (!isChecked) {
                        const parentDiv = radioGroup[0].closest('div'); // Encuentra el div contenedor del grupo de radio
                        if (parentDiv) {
                            let errorSpan = parentDiv.querySelector('.error-message');
                            if (!errorSpan) {
                                errorSpan = document.createElement('span');
                                errorSpan.classList.add('error-message');
                                parentDiv.appendChild(errorSpan);
                            }
                            errorSpan.textContent = `Seleccione una opción para ${fieldName}.`;
                        }
                        formIsValid = false;
                    } else {
                        const parentDiv = radioGroup[0].closest('div');
                        if (parentDiv) {
                            const errorSpan = parentDiv.querySelector('.error-message');
                            if (errorSpan) errorSpan.remove(); // Elimina el error si ya está checked
                        }
                    }
                } else if (inputElement && data[fieldName] === '') {
                    showError(inputElement, 'Este campo es obligatorio.');
                    formIsValid = false;
                }
            }


            // Desplazarse al primer input inválido si hay errores
            const invalidInputs = this.querySelectorAll('.is-invalid');
            if (invalidInputs.length > 0) {
                formIsValid = false; // Confirmar que el formulario no es válido

                // Hacer scroll al primer elemento inválido
                invalidInputs[0].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }


            if (!formIsValid) {
                alert("Por favor, corrige todos los campos marcados con errores antes de enviar.");
                return; // Detiene el envío si el formulario no es válido
            }


            // Si el formulario es válido, proceder con el envío
            try {
                // Mostrar indicador de carga y mensajes de éxito/error
                document.getElementById('loadingIndicator').style.display = 'block';
                document.getElementById('formSuccessMessage').textContent = '¡Matrícula Generada Exitosamente! 🎉'; // Muestra un mensaje inicial de éxito
                document.getElementById('formErrorMessage').style.display = 'none'; // Asegura que el mensaje de error esté oculto


                // 1. Enviar Datos Académicos
                const academicResponse = await fetch(`${BACKEND_URL}/api/academic`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fechaMatricula: data.fechaMatricula,
                        departamento: data.departamentoacad, // Coincide con el nombre del campo en el backend
                        municipio: data.municipioAcad, // Coincide con el nombre del campo en el backend
                        codigoUnico: data.codigoUnico,
                        codigoCentro: data.codigoCentro,
                        nombreCentro: data.nombreCentro,
                        nivelEducativo: data.nivelEducativo,
                        modalidad: data.modalidad,
                        turno: data.turno,
                        grado: data.grado,
                        seccion: data.seccion,
                        repitente: data.repitente
                    })
                });

                if (!academicResponse.ok) {
                    const errorBody = await academicResponse.text(); // Intenta leer el cuerpo del error
                    throw new Error(`Error en el envío de datos académicos: ${academicResponse.status} - ${errorBody}`);
                }

                const academicResult = await academicResponse.json();
                const matriculaId = academicResult.id; // Obtener el ID de la matrícula
                console.log('✅ Datos académicos guardados. ID de Matrícula:', matriculaId);


                // 2. Enviar Datos del Estudiante
                const studentResponse = await fetch(`${BACKEND_URL}/api/student`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        matriculaId: matriculaId, // Usar el ID de la matrícula recién creada
                        telefono: data.telefono,
                        direccion: data.direccion,
                        primerNombre: data.nombre, // Asegúrate de que 'nombre' en el frontend sea 'primerNombre' en el backend
                        segundoNombre: data.segundoNombre,
                        primerApellido: data.apellido1, // Asegúrate de que 'apellido1' en el frontend sea 'primerApellido' en el backend
                        segundoApellido: data.apellido2,
                        fechaNacimiento: data.fechaNacimiento,
                        genero: data.genero,
                        peso: parseFloat(data.peso),
                        talla: parseFloat(data.talla),
                        nacionalidad: data.nacionalidad,
                        paisNacimiento: data.paisNacimiento,
                        residenciaDepartamento: data.departamento, // Aquí se usa el departamento de residencia
                        residenciaMunicipio: data.municipio, // Aquí se usa el municipio de residencia
                        lenguaMaterna: data.lenguaMaterna,
                        discapacidad: data.discapacidad,
                        territorioIndigena: data.territorioIndigena,
                        habitaIndigena: data.habitaIndigena
                    })
                });

                if (!studentResponse.ok) {
                    const errorBody = await studentResponse.text();
                    throw new Error(`Error en el envío de datos del estudiante: ${studentResponse.status} - ${errorBody}`);
                }
                console.log('✅ Datos del estudiante guardados.');


                // 3. Enviar Datos de Padres/Tutor
                const parentResponse = await fetch(`${BACKEND_URL}/api/parent`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        matriculaId: matriculaId,
                        // Datos de la Madre
                        primerNombreMadre: data.primerNombreMadre,
                        segundoNombreMadre: data.segundoNombreMadre,
                        primerApellidoMadre: data.primerApellidoMadre,
                        segundoApellidoMadre: data.segundoApellidoMadre,
                        tipoIdentificacionMadre: data.tipoIdentificacionMadre,
                        cedulaMadre: data.cedulaMadre,
                        telefonoMadre: data.telefonoMadre,
                        // Datos del Padre
                        primerNombrePadre: data.primerNombrePadre,
                        segundoNombrePadre: data.segundoNombrePadre,
                        primerApellidoPadre: data.primerApellidoPadre,
                        segundoApellidoPadre: data.segundoApellidoPadre,
                        tipoIdentificacionPadre: data.tipoIdentificacionPadre,
                        cedulaPadre: data.cedulaPadre,
                        telefonoPadre: data.telefonoPadre,
                        // Datos del Tutor
                        primerNombreTutor: data.primerNombreTutor,
                        segundoNombreTutor: data.segundoNombreTutor,
                        primerApellidoTutor: data.primerApellidoTutor,
                        segundoApellidoTutor: data.segundoApellidoTutor,
                        tipoIdentificacionTutor: data.tipoIdentificacionTutor,
                        cedulaTutor: data.cedulaTutor,
                        telefonoTutor: data.telefonoTutor
                    })
                });

                if (!parentResponse.ok) {
                    const errorBody = await parentResponse.text();
                    throw new Error(`Error en el envío de datos de padres/tutor: ${parentResponse.status} - ${errorBody}`);
                }
                console.log('✅ Datos de padres/tutor guardados.');


                document.getElementById('loadingIndicator').style.display = 'none';
                document.getElementById('formSuccessMessage').textContent = '¡Registro de matrícula completado con éxito!';
                document.getElementById('formSuccessMessage').style.display = 'block';


                console.log('✅ Todos los datos han sido guardados exitosamente.');
                this.reset(); // Limpia el formulario
                // Quitar clases de validación para una nueva entrada
                this.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
                    el.classList.remove('is-valid', 'is-invalid');
                });
                // Restablecer valores iniciales de campos dependientes
                setupGradeAndModalityFiltering();
                synchronizeLocationFields();
                setupNationalityDependentFields();

                // Ocultar el mensaje de error de "al menos un padre/tutor"
                const errorMessage = document.getElementById('error-message');
                if (errorMessage) {
                    errorMessage.style.display = 'none';
                    errorMessage.textContent = "";
                }

                // Redirigir al usuario después de un breve retraso
                setTimeout(() => {
                    window.location.href = '../index.html'; // Ajusta esto a tu página de destino
                }, 2000); // Espera 2 segundos antes de redirigir

            } catch (err) {
                // Manejo de errores generales
                document.getElementById('loadingIndicator').style.display = 'none';
                document.getElementById('formErrorMessage').textContent = `Hubo un error al guardar los datos de matrícula: ${err.message}. Por favor, revise la consola para más detalles.`;
                document.getElementById('formErrorMessage').style.display = 'block';

                console.error("❌ Error general al guardar la matrícula:", err.message);
            }
        });
    }
});