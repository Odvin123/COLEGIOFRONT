document.addEventListener('DOMContentLoaded', function() {
    const matriculaForm = document.getElementById('matriculaForm');
    if (matriculaForm) {

        // --- Utilidades para mostrar/ocultar errores y mensajes ---
        function showError(input, message) {
            let errorElement = input.nextElementSibling;
            if (!errorElement || !errorElement.classList.contains('error-message')) {
                errorElement = document.createElement('span');
                errorElement.classList.add('error-message');
                input.parentNode.insertBefore(errorElement, input.nextSibling);
            }
            errorElement.textContent = message;
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
        }

        function clearError(input) {
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

        const BACKEND_URL = window.BACKEND_API_URL || 'https://corporate-marketa-odvin123-2e265ec9.koyeb.app';

        // Establece la fecha de matrícula al cargar la página
        function setFechaMatriculaToday() {
            const fechaMatriculaInput = document.getElementById('fechaMatricula');
            if (fechaMatriculaInput) {
                const today = new Date();
                const day = String(today.getDate()).padStart(2, '0');
                const month = String(today.getMonth() + 1).padStart(2, '0'); // Meses son 0-indexados
                const year = today.getFullYear();
                fechaMatriculaInput.value = `${day}/${month}/${year}`; // Formato DD/MM/YYYY
                clearError(fechaMatriculaInput);
            }
        }

        // --- Funciones de Validación ---

        // Validación: solo letras y espacios para nombres y apellidos
        function applyLettersOnlyValidation(inputElement, fieldName) {
            if (inputElement) {
                inputElement.addEventListener('input', function(event) {
                    const inputValue = event.target.value;
                    // Permite letras (mayúsculas y minúsculas), ñ, vocales acentuadas y espacios
                    const sanitizedValue = inputValue.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
                    event.target.value = sanitizedValue;

                    if (inputValue !== sanitizedValue) {
                        showError(this, `Solo se permiten letras y espacios para ${fieldName}.`);
                    } else {
                        clearError(this);
                    }
                });

                inputElement.addEventListener('blur', function() {
                    if (this.value.trim() === '') {
                        clearError(this);
                    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(this.value)) {
                        showError(this, `Solo se permiten letras y espacios para ${fieldName}.`);
                    } else {
                        clearError(this);
                        this.classList.add('is-valid');
                    }
                });
            }
        }

        // Validación: solo números y longitud exacta para teléfono
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
                        event.target.value = sanitizedValue.slice(0, exactLength);
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

        // Validación de cédula (formato nicaragüense: XXX-XXXXXX-XXXXA)
        function applyCedulaValidation(typeSelectElement, cedulaInputElement) {
            if (typeSelectElement && cedulaInputElement) {
                const validateCedula = () => {
                    if (typeSelectElement.value === 'Cedula Nicaraguense') {
                        cedulaInputElement.disabled = false;
                        let value = cedulaInputElement.value.toUpperCase().replace(/[^0-9A-Z]/g, '');
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
                        cedulaInputElement.value = formattedValue;

                        // Valida el formato completo al desenfocar o si no está vacío
                        if (cedulaInputElement.value.trim() === '') {
                            clearError(cedulaInputElement);
                        } else if (!/^\d{3}-\d{6}-\d{4}[A-Z]$/.test(cedulaInputElement.value)) {
                            showError(cedulaInputElement, 'Formato de cédula nicaragüense incorrecto. Debe ser XXX-XXXXXX-XXXXA. Ejemplo: 123-456789-0123A');
                        } else {
                            clearError(cedulaInputElement);
                            cedulaInputElement.classList.add('is-valid');
                        }
                    } else if (typeSelectElement.value === 'Cedula Extranjera') {
                        cedulaInputElement.disabled = false;
                        clearError(cedulaInputElement); // Limpia cualquier error de formato de cédula nica
                        cedulaInputElement.classList.remove('is-invalid', 'is-valid'); // No aplica validación específica
                    } else {
                        cedulaInputElement.value = '';
                        cedulaInputElement.disabled = true;
                        clearError(cedulaInputElement);
                        cedulaInputElement.classList.remove('is-invalid', 'is-valid');
                    }
                };

                typeSelectElement.addEventListener('change', validateCedula);
                cedulaInputElement.addEventListener('input', validateCedula);
                cedulaInputElement.addEventListener('blur', validateCedula);
                validateCedula(); // Ejecutar al cargar para establecer el estado inicial
            }
        }

        // Validación: números positivos y que no sean 0 (peso, talla)
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
                    paisNacimientoInput.classList.add('is-valid'); // Marca como válido si se autopopula
                } else if (nacionalidadSelect.value === 'Extranjero') {
                    paisNacimientoInput.value = '';
                    paisNacimientoInput.readOnly = false;
                    paisNacimientoInput.placeholder = 'Ingrese el país de nacimiento';
                    clearError(paisNacimientoInput);
                    paisNacimientoInput.classList.remove('is-valid'); // Remueve la clase válida si no está lleno
                } else {
                    paisNacimientoInput.value = '';
                    paisNacimientoInput.readOnly = false;
                    paisNacimientoInput.placeholder = '';
                    clearError(paisNacimientoInput);
                    paisNacimientoInput.classList.remove('is-valid');
                }
            };

            if (nacionalidadSelect && paisNacimientoInput) {
                nacionalidadSelect.addEventListener('change', updatePaisNacimiento);
                updatePaisNacimiento();
            }
        }

        // Lógica para filtrar Grado y establecer Modalidad según Nivel Educativo
        function setupGradeAndModalityFiltering() {
            const nivelEducativoSelect = document.getElementById('nivelEducativo');
            const gradoSelect = document.getElementById('grado');
            const modalidadInput = document.getElementById('modalidad');

            if (nivelEducativoSelect && gradoSelect && modalidadInput) {
                const initialGradoOptions = Array.from(gradoSelect.options);

                const filterOptions = () => {
                    const selectedNivel = nivelEducativoSelect.value;

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
                    filteredGradoOptions.forEach(option => gradoSelect.appendChild(option.cloneNode(true)));
                    gradoSelect.value = '';
                    clearError(gradoSelect); // Limpiar errores del grado

                    if (selectedNivel === 'Educación Inicial') {
                        modalidadInput.value = 'Preescolar-formal';
                    } else if (selectedNivel === 'Educación Primaria') {
                        modalidadInput.value = 'Primaria';
                    } else if (selectedNivel === 'Educación Secundaria') {
                        modalidadInput.value = 'Secundaria';
                    } else {
                        modalidadInput.value = '';
                    }
                    clearError(modalidadInput);
                    if (modalidadInput.value !== '') {
                        modalidadInput.classList.add('is-valid');
                    } else {
                        modalidadInput.classList.remove('is-valid');
                    }
                };

                nivelEducativoSelect.addEventListener('change', filterOptions);
                filterOptions();
            }
        }

        // Sincronizar campos de ubicación del estudiante con los académicos
        function synchronizeLocationFields() {
            // Renombré 'departamento' y 'municipio' a 'residenciaDepartamento' y 'residenciaMunicipio'
            // para que coincidan con los IDs del HTML proporcionado anteriormente.
            const studentDepartmentSelect = document.getElementById('residenciaDepartamento');
            const studentMunicipioSelect = document.getElementById('residenciaMunicipio');
            const academicDepartmentInput = document.getElementById('departamentoacad');
            const academicMunicipioInput = document.getElementById('municipioAcad');

            const updateAcademicLocation = () => {
                academicDepartmentInput.value = studentDepartmentSelect.value;
                academicMunicipioInput.value = studentMunicipioSelect.value;
                clearError(academicDepartmentInput);
                clearError(academicMunicipioInput);
                if (academicDepartmentInput.value !== '') {
                    academicDepartmentInput.classList.add('is-valid');
                } else {
                    academicDepartmentInput.classList.remove('is-valid');
                }
                if (academicMunicipioInput.value !== '') {
                    academicMunicipioInput.classList.add('is-valid');
                } else {
                    academicMunicipioInput.classList.remove('is-valid');
                }
            };

            if (studentDepartmentSelect && studentMunicipioSelect && academicDepartmentInput && academicMunicipioInput) {
                studentDepartmentSelect.addEventListener('change', updateAcademicLocation);
                studentMunicipioSelect.addEventListener('change', updateAcademicLocation);
                updateAcademicLocation();
            }
        }

        // --- Aplicar Validaciones a los Campos ---

        // Validaciones para DATOS PERSONALES DEL ESTUDIANTE
        applyLettersOnlyValidation(document.getElementById('primerNombre'), 'Primer Nombre');
        applyLettersOnlyValidation(document.getElementById('segundoNombre'), 'Segundo Nombre');
        applyLettersOnlyValidation(document.getElementById('primerApellido'), 'Primer Apellido');
        applyLettersOnlyValidation(document.getElementById('segundoApellido'), 'Segundo Apellido');
        applyPhoneValidation(document.getElementById('telefono'), 8, '88887777');
        applyPositiveNumberValidation(document.getElementById('peso'), 'peso');
        applyPositiveNumberValidation(document.getElementById('talla'), 'talla');
        // El país de nacimiento se gestiona con setupNationalityDependentFields, pero si es manual, también debería validarse
        // applyLettersOnlyValidation(document.getElementById('paisNacimiento'), 'País de Nacimiento');
        applyLettersOnlyValidation(document.getElementById('territorioIndigenaEstudiante'), 'Territorio Indígena');
        applyLettersOnlyValidation(document.getElementById('habitaIndigenaEstudiante'), 'Habita Indígena');


        // Validaciones para DATOS PERSONALES DE LOS PADRES O TUTOR
        // Madre
        applyLettersOnlyValidation(document.getElementById('primerNombreMadre'), 'Primer Nombre de la Madre');
        applyLettersOnlyValidation(document.getElementById('segundoNombreMadre'), 'Segundo Nombre de la Madre');
        applyLettersOnlyValidation(document.getElementById('primerApellidoMadre'), 'Primer Apellido de la Madre');
        applyLettersOnlyValidation(document.getElementById('segundoApellidoMadre'), 'Segundo Apellido de la Madre');
        applyCedulaValidation(document.getElementById('tipoIdentificacionMadre'), document.getElementById('cedulaMadre'));
        applyPhoneValidation(document.getElementById('telefonoMadre'), 8, '88887777');

        // Padre
        applyLettersOnlyValidation(document.getElementById('primerNombrePadre'), 'Primer Nombre del Padre');
        applyLettersOnlyValidation(document.getElementById('segundoNombrePadre'), 'Segundo Nombre del Padre');
        applyLettersOnlyValidation(document.getElementById('primerApellidoPadre'), 'Primer Apellido del Padre');
        applyLettersOnlyValidation(document.getElementById('segundoApellidoPadre'), 'Segundo Apellido del Padre');
        applyCedulaValidation(document.getElementById('tipoIdentificacionPadre'), document.getElementById('cedulaPadre'));
        applyPhoneValidation(document.getElementById('telefonoPadre'), 8, '88887777');

        // Tutor
        applyLettersOnlyValidation(document.getElementById('primerNombreTutor'), 'Primer Nombre del Tutor');
        applyLettersOnlyValidation(document.getElementById('segundoNombreTutor'), 'Segundo Nombre del Tutor');
        applyLettersOnlyValidation(document.getElementById('primerApellidoTutor'), 'Primer Apellido del Tutor');
        applyLettersOnlyValidation(document.getElementById('segundoApellidoTutor'), 'Segundo Apellido del Tutor');
        applyCedulaValidation(document.getElementById('tipoIdentificacionTutor'), document.getElementById('cedulaTutor'));
        applyPhoneValidation(document.getElementById('telefonoTutor'), 8, '88887777');


        // --- Configuración de campos dependientes ---
        setupNationalityDependentFields();
        setupGradeAndModalityFiltering();
        synchronizeLocationFields();
        setFechaMatriculaToday(); // Asegúrate de que se ejecuta al final para no ser sobrescrito por otras lógicas


        // --- Manejo del envío del formulario ---
        matriculaForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value.trim();
            }

            // Asegura que los valores de radio button se recojan correctamente
            data.turno = document.querySelector('input[name="turno"]:checked')?.value || '';
            data.repitente = document.querySelector('input[name="repitente"]:checked')?.value || '';

            let formIsValid = true;

            // Limpiar todos los errores antes de revalidar
            document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
            document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
            document.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));

            // Re-ejecutar las validaciones en el envío para asegurar que todos los campos sean revisados
            // Esto es crucial para campos que quizás no se han enfocado o desenfocado
            this.querySelectorAll('input:not([type="radio"]), select, textarea').forEach(input => {
                if (!input.readOnly && !input.disabled) { // Solo validar campos que el usuario puede editar
                    // Dispara un evento 'blur' para ejecutar las validaciones adjuntas
                    const event = new Event('blur');
                    input.dispatchEvent(event);
                }
            });
            // Re-validar también los selectores de tipo de identificación para que apliquen la lógica de la cédula
            ['Madre', 'Padre', 'Tutor'].forEach(role => {
                const typeSelect = document.getElementById(`tipoIdentificacion${role}`);
                const cedulaInput = document.getElementById(`cedula${role}`);
                if (typeSelect && cedulaInput) {
                    applyCedulaValidation(typeSelect, cedulaInput); // Re-ejecuta la lógica de habilitación/validación
                    if (typeSelect.value === 'Cedula Nicaraguense' && cedulaInput.value.trim() !== '' && !/^\d{3}-\d{6}-\d{4}[A-Z]$/.test(cedulaInput.value)) {
                         showError(cedulaInput, 'Formato de cédula nicaragüense incorrecto. Debe ser XXX-XXXXXX-XXXXA. Ejemplo: 123-456789-0123A');
                    } else if (typeSelect.value !== '' && cedulaInput.value.trim() === '' && !cedulaInput.disabled) {
                        showError(cedulaInput, 'Este campo es obligatorio cuando se selecciona un tipo de identificación.');
                    }
                }
            });

            // Validar campos obligatorios del estudiante
            // Cambié 'nombre' por 'primerNombre' y 'apellido1' por 'primerApellido'
            // y 'departamento' y 'municipio' por 'residenciaDepartamento' y 'residenciaMunicipio'
            const studentRequiredFields = ['telefono', 'direccion', 'primerNombre', 'primerApellido', 'fechaNacimiento',
                'genero', 'peso', 'talla', 'nacionalidad', 'paisNacimiento',
                'residenciaDepartamento', 'residenciaMunicipio', 'lenguaMaterna', 'discapacidad'
            ];
            for (const fieldName of studentRequiredFields) {
                const inputElement = this.querySelector(`[name="${fieldName}"]`);
                if (inputElement && data[fieldName] === '' && !inputElement.readOnly) {
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
                        const parentDiv = radioGroup[0].closest('div');
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
                            if (errorSpan) errorSpan.remove();
                        }
                    }
                } else if (inputElement && data[fieldName] === '' && !inputElement.readOnly) { // Solo si no es readonly
                    showError(inputElement, 'Este campo es obligatorio.');
                    formIsValid = false;
                }
            }


            // Verificar si hay algún campo marcado como inválido por las validaciones individuales
            const invalidInputs = this.querySelectorAll('.is-invalid');
            if (invalidInputs.length > 0) {
                formIsValid = false;
                invalidInputs[0].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }

            if (!formIsValid) {
                alert("Por favor, corrige todos los campos marcados con errores antes de enviar.");
                return;
            }

            // Si el formulario es válido, proceder con el envío
            try {
                document.getElementById('loadingIndicator').style.display = 'block';
                document.getElementById('formSuccessMessage').textContent = ''; // Limpiar mensaje de éxito anterior
                document.getElementById('formSuccessMessage').style.display = 'none';
                document.getElementById('formErrorMessage').style.display = 'none';

                // 1. Enviar Datos Académicos
                const academicResponse = await fetch(`${BACKEND_URL}/api/academic`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fechaMatricula: data.fechaMatricula,
                        departamento: data.departamentoacad,
                        municipio: data.municipioAcad,
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
                    const errorBody = await academicResponse.text();
                    throw new Error(`Error en el envío de datos académicos: ${academicResponse.status} - ${errorBody}`);
                }

                const academicResult = await academicResponse.json();
                const matriculaId = academicResult.id;
                console.log('✅ Datos académicos guardados. ID de Matrícula:', matriculaId);

                // 2. Enviar Datos del Estudiante
                const studentResponse = await fetch(`${BACKEND_URL}/api/student`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        matriculaId: matriculaId,
                        telefono: data.telefono,
                        direccion: data.direccion,
                        primerNombre: data.primerNombre, // Corregido de 'nombre'
                        segundoNombre: data.segundoNombre,
                        primerApellido: data.primerApellido, // Corregido de 'apellido1'
                        segundoApellido: data.segundoApellido,
                        fechaNacimiento: data.fechaNacimiento,
                        genero: data.genero,
                        peso: parseFloat(data.peso),
                        talla: parseFloat(data.talla),
                        nacionalidad: data.nacionalidad,
                        paisNacimiento: data.paisNacimiento,
                        residenciaDepartamento: data.residenciaDepartamento, // Corregido de 'departamento'
                        residenciaMunicipio: data.residenciaMunicipio, // Corregido de 'municipio'
                        lenguaMaterna: data.lenguaMaterna,
                        discapacidad: data.discapacidad,
                        territorioIndigena: data.territorioIndigenaEstudiante, // Corregido el nombre
                        habitaIndigena: data.habitaIndigenaEstudiante // Corregido el nombre
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

            } catch (error) {
                console.error('❌ Error al enviar el formulario:', error);
                document.getElementById('loadingIndicator').style.display = 'none';
                document.getElementById('formErrorMessage').textContent = `Error al registrar la matrícula: ${error.message}. Por favor, inténtalo de nuevo.`;
                document.getElementById('formErrorMessage').style.display = 'block';
                document.getElementById('formSuccessMessage').style.display = 'none';
            }
        });
    } else {
        console.error('El elemento matriculaForm no se encontró en el DOM.');
    }
});