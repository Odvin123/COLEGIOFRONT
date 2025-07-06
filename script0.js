document.addEventListener('DOMContentLoaded', function() {
    const matriculaForm = document.getElementById('matriculaForm');
    if (matriculaForm) {
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap'); /* Fuente "bonita" */
            .alert-float {
                position: fixed;
                top: 50%; /* Centra verticalmente */
                left: 50%; /* Centra horizontalmente */
                transform: translate(-50%, -50%); /* Ajuste para centrado perfecto */
                background-color: #28a745; /* Verde Bootstrap success */
                color: white;
                padding: 20px 30px;
                border-radius: 10px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                z-index: 1050; /* Por encima de la mayoría de los elementos */
                opacity: 0; /* Inicialmente oculto */
                transition: opacity 0.5s ease-in-out;
                font-family: 'Pacifico', cursive; /* Aplica la fuente */
                font-size: 1.5em;
                text-align: center; /* Centra el texto */
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px; /* Espacio entre el texto y el emoji */
            }
            .alert-float.success-visible {
                opacity: 1; /* Visible cuando tiene la clase success-visible */
            }
            .alert-float .emoji {
                font-size: 1.8em; /* Tamaño del emoji */
            }
        `;
        document.head.appendChild(style);

        // Helper function to generate a UUID (Universally Unique Identifier)
        function uuidv4() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

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
            if (input.value.trim() !== '' && !input.readOnly) {
                input.classList.add('is-valid');
            } else {
                input.classList.remove('is-valid');
            }
        }

        function validateParentOrTutorFields(role) {
            const requiredFields = [
                `primerNombre${role}`,
                `primerApellido${role}`,
                `tipoIdentificacion${role}`,
                `cedula${role}`,
                `telefono${role}`
            ];
            const optionalFields = [
                `segundoNombre${role}`,
                `segundoApellido${role}`
            ];

            const hasAnyValue = [...requiredFields, ...optionalFields].some(field => {
                const input = document.getElementById(field);
                return input && input.value.trim() !== '';
            });

            if (hasAnyValue) {
                requiredFields.forEach(field => {
                    const input = document.getElementById(field);
                    if (input && input.value.trim() === '') {
                        showError(input, `Este campo es obligatorio para ${role}.`);
                    } else {
                        clearError(input);
                    }
                });
                optionalFields.forEach(field => {
                    const input = document.getElementById(field);
                    if (input && input.value.trim() === '') {
                        clearError(input);
                    }
                });
            } else {
                ([
                    ...requiredFields, ...optionalFields
                ]).forEach(field => {
                    const input = document.getElementById(field);
                    if (input) clearError(input);
                });
            }
        }

        ['Madre', 'Padre', 'Tutor'].forEach(role => {
            const inputs = [
                document.getElementById(`primerNombre${role}`),
                document.getElementById(`segundoNombre${role}`),
                document.getElementById(`primerApellido${role}`),
                document.getElementById(`segundoApellido${role}`),
                document.getElementById(`tipoIdentificacion${role}`),
                document.getElementById(`cedula${role}`),
                document.getElementById(`telefono${role}`)
            ];
            inputs.forEach(input => {
                if (input) {
                    input.addEventListener('input', () => validateParentOrTutorFields(role));
                    input.addEventListener('blur', () => validateParentOrTutorFields(role));
                }
            });
        });

        const BACKEND_URL = window.BACKEND_API_URL || 'https://corporate-marketa-odvin123-2e265ec9.koyeb.app';

        function setFechaMatriculaToday() {
            const fechaMatriculaInput = document.getElementById('fechaMatricula');
            if (fechaMatriculaInput) {
                const today = new Date();
                const day = String(today.getDate()).padStart(2, '0');
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const year = today.getFullYear();
                fechaMatriculaInput.value = `${day}/${month}/${year}`;
                clearError(fechaMatriculaInput);
            }
        }

        function clearForm() {
            matriculaForm.reset();
            document.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
                el.classList.remove('is-valid', 'is-invalid');
            });
            document.querySelectorAll('.error-message').forEach(el => {
                el.remove();
            });
            const fechaMatriculaInput = document.getElementById('fechaMatricula');
            if (fechaMatriculaInput) {
                setFechaMatriculaToday();
            }
            const paisNacimientoInput = document.getElementById('paisNacimiento');
            const nacionalidadSelect = document.getElementById('nacionalidad');
            if (nacionalidadSelect && paisNacimientoInput) {
                nacionalidadSelect.value = '';
                const event = new Event('change');
                nacionalidadSelect.dispatchEvent(event);
            }
            const nivelEducativoSelect = document.getElementById('nivelEducativo');
            if (nivelEducativoSelect) {
                nivelEducativoSelect.value = '';
                const event = new Event('change');
                nivelEducativoSelect.dispatchEvent(event);
            }
            ['Madre', 'Padre', 'Tutor'].forEach(role => {
                const typeSelect = document.getElementById(`tipoIdentificacion${role}`);
                const cedulaInput = document.getElementById(`cedula${role}`);
                if (typeSelect) {
                    typeSelect.value = '';
                    if (cedulaInput) {
                        cedulaInput.disabled = true;
                        cedulaInput.value = '';
                        clearError(cedulaInput);
                    }
                }
            });
            const errorMessageElement = document.getElementById('error-message');
            if (errorMessageElement) {
                errorMessageElement.style.display = 'none';
                errorMessageElement.textContent = '';
            }
            document.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
        }

        function applyLettersOnlyValidation(inputElement, fieldName) {
            if (inputElement) {
                inputElement.addEventListener('input', function(event) {
                    const inputValue = event.target.value;
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

        function applyCedulaValidation(typeSelectElement, cedulaInputElement) {
            if (typeSelectElement && cedulaInputElement) {
                const validateCedula = () => {
                    if (typeSelectElement.value === 'Cedula Nicaraguense') {
                        cedulaInputElement.disabled = false;
                        let value = cedulaInputElement.value.toUpperCase().replace(/[^0-9A-Z]/g, '');
                        let formattedValue = '';
                        if (value.length > 0) {
                            formattedValue += value.substring(0, 3);
                            if (value.length > 3) {
                                formattedValue += '-' + value.substring(3, 9);
                                if (value.length > 9) {
                                    formattedValue += '-' + value.substring(9, 13);
                                    if (value.length > 13) {
                                        formattedValue += value.substring(13, 14);
                                    }
                                }
                            }
                        }
                        if (formattedValue.length > 16) {
                            formattedValue = formattedValue.slice(0, 16);
                        }
                        cedulaInputElement.value = formattedValue;
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
                        cedulaInputElement.placeholder = 'DNI o Documento válido';
                        clearError(cedulaInputElement);
                        cedulaInputElement.classList.remove('is-invalid', 'is-valid');
                    } else {
                        // Si no se selecciona tipo de identificación
                        cedulaInputElement.value = '';
                        cedulaInputElement.disabled = true;
                        clearError(cedulaInputElement);
                        cedulaInputElement.classList.remove('is-invalid', 'is-valid');
                    }
                };
                // Eventos para detectar cambios
                typeSelectElement.addEventListener('change', validateCedula);
                cedulaInputElement.addEventListener('input', validateCedula);
                cedulaInputElement.addEventListener('blur', validateCedula);
                validateCedula(); // Ejecutar una vez al cargar
            }
        }

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

        function setupNationalityDependentFields() {
            const nacionalidadSelect = document.getElementById('nacionalidad');
            const paisNacimientoInput = document.getElementById('paisNacimiento');
            const updatePaisNacimiento = () => {
                if (nacionalidadSelect.value === 'Nicaragüense') {
                    paisNacimientoInput.value = 'Nicaragua';
                    paisNacimientoInput.readOnly = true;
                    clearError(paisNacimientoInput);
                    paisNacimientoInput.classList.add('is-valid');
                } else if (nacionalidadSelect.value === 'Extranjero') {
                    paisNacimientoInput.value = '';
                    paisNacimientoInput.readOnly = false;
                    paisNacimientoInput.placeholder = 'Ingrese el país de nacimiento';
                    clearError(paisNacimientoInput);
                    paisNacimientoInput.classList.remove('is-valid');
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
                updatePaisNacimiento(); // Set initial state
            }
            applyLettersOnlyValidation(paisNacimientoInput, 'País de Nacimiento');
            if (nacionalidadSelect && paisNacimientoInput) {
                nacionalidadSelect.addEventListener('change', updatePaisNacimiento);
                applyLettersOnlyValidation(paisNacimientoInput, 'País de Nacimiento');
                updatePaisNacimiento(); // Call on load to set initial state
            }
        }

        function setupGradeAndModalityFiltering() {
            const nivelEducativoSelect = document.getElementById('nivelEducativo');
            const gradoSelect = document.getElementById('grado');
            const modalidadInput = document.getElementById('modalidad');

            if (nivelEducativoSelect && gradoSelect && modalidadInput) {
                const initialGradoOptions = Array.from(gradoSelect.options);

                const filterOptions = () => {
                    const selectedNivel = nivelEducativoSelect.value;
                    gradoSelect.innerHTML = ''; // Clear current options

                    // Add a default "Select an option"
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
                    clearError(gradoSelect);

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

        function synchronizeLocationFields() {
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


        applyLettersOnlyValidation(document.getElementById('primerNombre'), 'Primer Nombre');
        applyLettersOnlyValidation(document.getElementById('segundoNombre'), 'Segundo Nombre');
        applyLettersOnlyValidation(document.getElementById('primerApellido'), 'Primer Apellido');
        applyLettersOnlyValidation(document.getElementById('segundoApellido'), 'Segundo Apellido');
        applyPhoneValidation(document.getElementById('telefono'), 8, '88887777');
        applyPositiveNumberValidation(document.getElementById('peso'), 'peso');
        applyPositiveNumberValidation(document.getElementById('talla'), 'talla');
        applyLettersOnlyValidation(document.getElementById('territorioIndigenaEstudiante'), 'Territorio Indígena');
        applyLettersOnlyValidation(document.getElementById('habitaIndigenaEstudiante'), 'Habita Indígena');

        applyLettersOnlyValidation(document.getElementById('primerNombreMadre'), 'Primer Nombre de la Madre');
        applyLettersOnlyValidation(document.getElementById('segundoNombreMadre'), 'Segundo Nombre de la Madre');
        applyLettersOnlyValidation(document.getElementById('primerApellidoMadre'), 'Primer Apellido de la Madre');
        applyLettersOnlyValidation(document.getElementById('segundoApellidoMadre'), 'Segundo Apellido de la Madre');
        applyCedulaValidation(document.getElementById('tipoIdentificacionMadre'), document.getElementById('cedulaMadre'));
        applyPhoneValidation(document.getElementById('telefonoMadre'), 8, '88887777');

        applyLettersOnlyValidation(document.getElementById('primerNombrePadre'), 'Primer Nombre del Padre');
        applyLettersOnlyValidation(document.getElementById('segundoNombrePadre'), 'Segundo Nombre del Padre');
        applyLettersOnlyValidation(document.getElementById('primerApellidoPadre'), 'Primer Apellido del Padre');
        applyLettersOnlyValidation(document.getElementById('segundoApellidoPadre'), 'Segundo Apellido del Padre');
        applyCedulaValidation(document.getElementById('tipoIdentificacionPadre'), document.getElementById('cedulaPadre'));
        applyPhoneValidation(document.getElementById('telefonoPadre'), 8, '88887777');

        applyLettersOnlyValidation(document.getElementById('primerNombreTutor'), 'Primer Nombre del Tutor');
        applyLettersOnlyValidation(document.getElementById('segundoNombreTutor'), 'Segundo Nombre del Tutor');
        applyLettersOnlyValidation(document.getElementById('primerApellidoTutor'), 'Primer Apellido del Tutor');
        applyLettersOnlyValidation(document.getElementById('segundoApellidoTutor'), 'Segundo Apellido del Tutor');
        applyCedulaValidation(document.getElementById('tipoIdentificacionTutor'), document.getElementById('cedulaTutor'));
        applyPhoneValidation(document.getElementById('telefonoTutor'), 8, '88887777');


        setupNationalityDependentFields();
        setupGradeAndModalityFiltering();
        synchronizeLocationFields();
        setFechaMatriculaToday();

        matriculaForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('--- Inicio de la presentación del formulario ---');

            const formData = new FormData(this);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value.trim();
            }

            // Add radio button values
            data.turno = document.querySelector('input[name="turno"]:checked')?.value || '';
            data.repitente = document.querySelector('input[name="repitente"]:checked')?.value || '';
            console.log('Datos del formulario recopilados:', data);

            let formIsValid = true;

            // Clear previous errors and validations
            document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
            document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
            document.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));

            // Re-run validations on all relevant inputs to ensure updated state
            this.querySelectorAll('input:not([type="radio"]), select, textarea').forEach(input => {
                if (!input.readOnly && !input.disabled) {
                    const event = new Event('blur'); // Trigger blur to re-validate
                    input.dispatchEvent(event);
                }
            });

            // Specific validation for parent/tutor cedula when type is selected but cedula is empty
            ['Madre', 'Padre', 'Tutor'].forEach(role => {
                const typeSelect = document.getElementById(`tipoIdentificacion${role}`);
                const cedulaInput = document.getElementById(`cedula${role}`);
                if (typeSelect && cedulaInput) {
                    applyCedulaValidation(typeSelect, cedulaInput); // Re-run cedula validation
                    if (typeSelect.value !== '' && cedulaInput.value.trim() === '' && !cedulaInput.disabled) {
                        showError(cedulaInput, 'Este campo es obligatorio cuando se selecciona un tipo de identificación.');
                        formIsValid = false;
                    }
                }
            });

            // Check if any invalid fields exist after re-validation
            if (document.querySelectorAll('.is-invalid').length > 0) {
                formIsValid = false;
                console.log('Errores de validación encontrados en el formulario.');
            }

            if (!formIsValid) {
                const errorMessageElement = document.getElementById('error-message');
                if (errorMessageElement) {
                    errorMessageElement.textContent = 'Por favor, corrija los errores en el formulario.';
                    errorMessageElement.style.display = 'block';
                }
                console.log('Envío de formulario cancelado debido a errores de validación.');
                return; // Stop form submission
            }


            // Generate a unique matriculaId for linking records
            const matriculaId = uuidv4();
            data.matriculaId = matriculaId; // Add matriculaId to the main data object
            console.log('MatriculaId generada:', matriculaId);

            // Separate data for each endpoint
            const studentData = {
                matriculaId: data.matriculaId,
                primerNombre: data.primerNombre,
                segundoNombre: data.segundoNombre,
                primerApellido: data.primerApellido,
                segundoApellido: data.segundoApellido,
                fechaNacimiento: data.fechaNacimiento,
                edad: parseInt(data.edad), // Ensure age is a number
                sexo: data.sexo,
                nacionalidad: data.nacionalidad,
                paisNacimiento: data.paisNacimiento,
                departamentoNacimiento: data.departamentoNacimiento,
                municipioNacimiento: data.municipioNacimiento,
                domicilio: data.domicilio,
                residenciaDepartamento: data.residenciaDepartamento,
                residenciaMunicipio: data.residenciaMunicipio,
                telefono: data.telefono,
                email: data.email,
                ocupacion: data.ocupacion,
                trabaja: data.trabaja,
                peso: parseFloat(data.peso), // Ensure peso is a number
                talla: parseFloat(data.talla), // Ensure talla is a number
                discapacidad: data.discapacidad,
                tipoDiscapacidad: data.tipoDiscapacidad,
                cronica: data.cronica,
                tipoCronica: data.tipoCronica,
                territorioIndigenaEstudiante: data.territorioIndigenaEstudiante,
                habitaIndigenaEstudiante: data.habitaIndigenaEstudiante,
                // Nested parent data for student endpoint (as per current backend expectation)
                madre: {
                    primerNombreMadre: data.primerNombreMadre,
                    segundoNombreMadre: data.segundoNombreMadre,
                    primerApellidoMadre: data.primerApellidoMadre,
                    segundoApellidoMadre: data.segundoApellidoMadre,
                    tipoIdentificacionMadre: data.tipoIdentificacionMadre,
                    cedulaMadre: data.cedulaMadre,
                    telefonoMadre: data.telefonoMadre
                },
                padre: {
                    primerNombrePadre: data.primerNombrePadre,
                    segundoNombrePadre: data.segundoNombrePadre,
                    primerApellidoPadre: data.primerApellidoPadre,
                    segundoApellidoPadre: data.segundoApellidoPadre,
                    tipoIdentificacionPadre: data.tipoIdentificacionPadre,
                    cedulaPadre: data.cedulaPadre,
                    telefonoPadre: data.telefonoPadre
                },
                tutor: {
                    primerNombreTutor: data.primerNombreTutor,
                    segundoNombreTutor: data.segundoNombreTutor,
                    primerApellidoTutor: data.primerApellidoTutor,
                    segundoApellidoTutor: data.segundoApellidoTutor,
                    tipoIdentificacionTutor: data.tipoIdentificacionTutor,
                    cedulaTutor: data.cedulaTutor,
                    telefonoTutor: data.telefonoTutor
                }
            };

            const parentData = { // This object will be sent to the /api/parent endpoint
                matriculaId: data.matriculaId,
                primerNombreMadre: data.primerNombreMadre,
                segundoNombreMadre: data.segundoNombreMadre,
                primerApellidoMadre: data.primerApellidoMadre,
                segundoApellidoMadre: data.segundoApellidoMadre,
                tipoIdentificacionMadre: data.tipoIdentificacionMadre,
                cedulaMadre: data.cedulaMadre,
                telefonoMadre: data.telefonoMadre,
                primerNombrePadre: data.primerNombrePadre,
                segundoNombrePadre: data.segundoNombrePadre,
                primerApellidoPadre: data.primerApellidoPadre,
                segundoApellidoPadre: data.segundoApellidoPadre,
                tipoIdentificacionPadre: data.tipoIdentificacionPadre,
                cedulaPadre: data.cedulaPadre,
                telefonoPadre: data.telefonoPadre,
                primerNombreTutor: data.primerNombreTutor,
                segundoNombreTutor: data.segundoNombreTutor,
                primerApellidoTutor: data.primerApellidoTutor,
                segundoApellidoTutor: data.segundoApellidoTutor,
                tipoIdentificacionTutor: data.tipoIdentificacionTutor,
                cedulaTutor: data.cedulaTutor,
                telefonoTutor: data.telefonoTutor
            };

            const academicData = {
                matriculaId: data.matriculaId, // Asegúrate de enviar matriculaId también a academic
                fechaMatricula: data.fechaMatricula,
                modalidad: data.modalidad,
                nivelEducativo: data.nivelEducativo,
                grado: data.grado,
                turno: data.turno,
                seccion: data.seccion,
                repitente: data.repitente,
                centroEstudioAnterior: data.centroEstudioAnterior,
                departamentoacad: data.departamentoacad,
                municipioAcad: data.municipioAcad
            };

            // Prepare parent data for PDF generation (flattened structure expected by pdfController)
            const flattenedParentDataForPdf = {
                primerNombreMadre: data.primerNombreMadre,
                segundoNombreMadre: data.segundoNombreMadre,
                primerApellidoMadre: data.primerApellidoMadre,
                segundoApellidoMadre: data.segundoApellidoMadre,
                tipoIdentificacionMadre: data.tipoIdentificacionMadre,
                cedulaMadre: data.cedulaMadre,
                telefonoMadre: data.telefonoMadre,
                primerNombrePadre: data.primerNombrePadre,
                segundoNombrePadre: data.segundoNombrePadre,
                primerApellidoPadre: data.primerApellidoPadre,
                segundoApellidoPadre: data.segundoApellidoPadre,
                tipoIdentificacionPadre: data.tipoIdentificacionPadre,
                cedulaPadre: data.cedulaPadre,
                telefonoPadre: data.telefonoPadre,
                primerNombreTutor: data.primerNombreTutor,
                segundoNombreTutor: data.segundoNombreTutor,
                primerApellidoTutor: data.primerApellidoTutor,
                segundoApellidoTutor: data.segundoApellidoTutor,
                tipoIdentificacionTutor: data.tipoIdentificacionTutor,
                cedulaTutor: data.cedulaTutor,
                telefonoTutor: data.telefonoTutor
            };

            console.log('Datos de estudiante a enviar:', studentData);
            console.log('Datos de padres/tutores a enviar:', parentData);
            console.log('Datos académicos a enviar:', academicData);
            console.log('Datos de padres/tutores para PDF a enviar:', flattenedParentDataForPdf);


            const loadingMessage = document.getElementById('loading-message');
            const errorMessageElement = document.getElementById('error-message');
            loadingMessage.style.display = 'block'; // Show loading message
            errorMessageElement.style.display = 'none'; // Hide error message
            matriculaForm.style.display = 'none'; // Hide form during submission

            try {
                // 1. Send Student Data
                console.log('Enviando datos del estudiante a:', `${BACKEND_URL}/api/student`);
                const studentResponse = await fetch(`${BACKEND_URL}/api/student`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(studentData),
                });

                if (!studentResponse.ok) {
                    const errorText = await studentResponse.text();
                    console.error('Respuesta de error de /api/student:', errorText);
                    throw new Error(`Error al guardar datos del estudiante: ${errorText}`);
                }
                console.log('✅ Datos del estudiante guardados exitosamente.');

                // 2. Send Parent Data
                console.log('Enviando datos de padres/tutores a:', `${BACKEND_URL}/api/parent`);
                const parentResponse = await fetch(`${BACKEND_URL}/api/parent`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(parentData),
                });

                if (!parentResponse.ok) {
                    const errorText = await parentResponse.text();
                    console.error('Respuesta de error de /api/parent:', errorText);
                    throw new Error(`Error al guardar datos de padres/tutores: ${errorText}`);
                }
                console.log('✅ Datos de padres/tutores guardados exitosamente.');

                // 3. Send Academic Data
                console.log('Enviando datos académicos a:', `${BACKEND_URL}/api/academic`);
                const academicResponse = await fetch(`${BACKEND_URL}/api/academic`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(academicData),
                });

                if (!academicResponse.ok) {
                    const errorText = await academicResponse.text();
                    console.error('Respuesta de error de /api/academic:', errorText);
                    throw new Error(`Error al guardar datos académicos: ${errorText}`);
                }
                console.log('✅ Datos académicos guardados exitosamente.');


                // 4. Generate PDF
                console.log('Solicitando generación de PDF a:', `${BACKEND_URL}/api/generate-pdf`);
                const pdfResponse = await fetch(`${BACKEND_URL}/api/generate-pdf`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        studentData: studentData,
                        academicData: academicData,
                        parentData: flattenedParentDataForPdf
                    }),
                });

                if (!pdfResponse.ok) {
                    const errorText = await pdfResponse.text();
                    console.error('Respuesta de error de /api/generate-pdf:', errorText);
                    throw new Error(`Error al generar el PDF: ${errorText}`);
                }

                const pdfBlob = await pdfResponse.blob();
                const url = window.URL.createObjectURL(pdfBlob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `Matricula_${data.primerNombre}_${data.primerApellido}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                console.log('✅ PDF generado y descargado exitosamente.');

                // Show success message
                const successMessage = document.getElementById('success-message');
                if (successMessage) {
                    successMessage.classList.add('success-visible');
                    // Automatically hide after 3 seconds
                    setTimeout(() => {
                        successMessage.classList.remove('success-visible');
                    }, 3000);
                }

                // Clear form
                clearForm();
                console.log('Formulario limpiado.');

                // Redirect to index.html after a short delay to allow messages to be seen
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3500); // Redirect after 3.5 seconds

            } catch (error) {
                console.error('  ❌  Error general en el proceso de matrícula:', error);
                const errorMessageElement = document.getElementById('error-message');
                if (errorMessageElement) {
                    let errorText = error.message;
                    if (error.message.includes('Failed to fetch')) {
                        errorText = 'No se pudo conectar con el servidor. Verifique que el backend esté funcionando.';
                    } else if (error.message.includes('Error al guardar datos del estudiante')) {
                        errorText = 'Error al guardar los datos del estudiante. Verifique los campos e intente de nuevo.';
                    } else if (error.message.includes('Error al guardar datos de padres/tutores')) {
                        errorText = 'Error al guardar los datos de padres/tutores. Verifique los campos e intente de nuevo.';
                    } else if (error.message.includes('Error al guardar datos académicos')) {
                        errorText = 'Error al guardar los datos académicos. Verifique los campos e intente de nuevo.';
                    } else if (error.message.includes('Error al generar el PDF')) {
                        errorText = 'Hubo un problema al generar el PDF. Asegúrese de que todos los datos sean válidos.';
                    }
                    errorMessageElement.style.display = 'block';
                    errorMessageElement.textContent = `Error: ${errorText}`;
                }
            } finally {
                loadingMessage.style.display = 'none'; // Hide loading message
                // Note: Form will be hidden if successful and redirect, or shown if error
                if (!formIsValid) { // Only show form if validation failed or other unhandled error
                    matriculaForm.style.display = 'block';
                }
                console.log('--- Fin del proceso de presentación del formulario ---');
            }
        });
    }
});