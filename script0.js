document.addEventListener('DOMContentLoaded', function() {
    const matriculaForm = document.getElementById('matriculaForm');
    if (matriculaForm) {
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap'); /* Fuente "bonita" */

            /* Estilos para el mensaje flotante de éxito */
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

            /* Estilos para los mensajes de error - Ajustados para los nuevos contenedores */
            .form-group {
                position: relative; /* Importante para posicionar los errores absolutamente */
                margin-bottom: 1.5em; /* Espacio adicional para el error-message */
            }

            .form-check-inline-group { /* Nuevo contenedor para grupos de radio/checkbox */
                position: relative;
                margin-bottom: 2.5em; /* Más espacio para errores debajo de los radios */
                padding-top: 0.5em; /* Espacio superior si es necesario */
            }

            .error-message {
                color: #dc3545; /* Color rojo de Bootstrap para errores */
                font-size: 0.875em;
                display: block; /* Asegura que ocupe su propia línea */
                position: absolute; /* Posicionamiento absoluto para no desacomodar */
                bottom: -1.5em; /* Ajusta la posición debajo del input/select/radio group */
                left: 0;
                width: 100%;
                text-align: left;
            }

            /* Asegúrate de que los inputs afectados por validación también tengan bordes */
            .is-invalid {
                border-color: #dc3545 !important;
            }
            .is-valid {
                border-color: #28a745 !important;
            }
        `;
        document.head.appendChild(style);

        // Modificada para buscar el contenedor correcto
        function showError(input, message) {
            let parentContainer = input.closest('.form-group') || input.closest('.form-check-inline-group');
            if (!parentContainer) {
                // Para radios que no tienen un .form-check-inline-group
                parentContainer = input.parentNode.closest('.form-check-inline-group') || input.parentNode;
            }

            let errorElement = parentContainer.querySelector('.error-message');

            if (!errorElement) {
                errorElement = document.createElement('span');
                errorElement.classList.add('error-message');
                parentContainer.appendChild(errorElement);
            }
            errorElement.textContent = message;
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
        }

        // Modificada para buscar el contenedor correcto
        function clearError(input) {
            let parentContainer = input.closest('.form-group') || input.closest('.form-check-inline-group');
            if (!parentContainer) {
                parentContainer = input.parentNode.closest('.form-check-inline-group') || input.parentNode;
            }
            const errorElement = parentContainer.querySelector('.error-message');
            if (errorElement) {
                errorElement.remove();
            }
            input.classList.remove('is-invalid');
            if (input.value.trim() !== '' && !input.readOnly && !input.disabled) { // Solo añadir is-valid si no es readonly/disabled
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
                `cedula${role}`, // Condicional
                `telefono${role}` // Condicional
            ];
            const optionalFields = [
                `segundoNombre${role}`,
                `segundoApellido${role}`
            ];

            // Verificar si AL MENOS UN CAMPO de este rol tiene un valor (excluyendo el tipo de identificación y cédula inicial)
            const hasAnyValue = [...requiredFields, ...optionalFields].some(field => {
                const input = document.getElementById(field);
                return input && input.type !== 'select-one' && input.value.trim() !== ''; // Excluir select para esta comprobación inicial
            });
            
            // Si el select de identificación o la cédula tienen valor, también se considera que hay "algún valor"
            const tipoIdentificacionSelect = document.getElementById(`tipoIdentificacion${role}`);
            const cedulaInput = document.getElementById(`cedula${role}`);
            if (tipoIdentificacionSelect && tipoIdentificacionSelect.value !== '') {
                hasAnyValue = true;
            }
            if (cedulaInput && cedulaInput.value !== '') {
                hasAnyValue = true;
            }


            if (hasAnyValue) {
                let currentRoleHasErrors = false;
                requiredFields.forEach(fieldId => {
                    const input = document.getElementById(fieldId);
                    if (input) {
                        // Validar campos requeridos directamente
                        if (input.value.trim() === '') {
                            // Cédula y teléfono son condicionales, los manejamos aparte si no hay tipo de identificación
                            if (fieldId === `cedula${role}` || fieldId === `telefono${role}`) {
                                const parentTypeSelect = document.getElementById(`tipoIdentificacion${role}`);
                                // Si hay un tipo de identificación seleccionado, entonces estos campos son obligatorios
                                if (parentTypeSelect && parentTypeSelect.value !== '') {
                                    showError(input, `Este campo es obligatorio para ${role}.`);
                                    currentRoleHasErrors = true;
                                } else {
                                    clearError(input); // No es error si no hay tipo de identificación
                                }
                            } else {
                                showError(input, `Este campo es obligatorio para ${role}.`);
                                currentRoleHasErrors = true;
                            }
                        } else {
                            clearError(input);
                        }
                    }
                });
                
                // Validación específica para cédula si se seleccionó un tipo de identificación
                if (tipoIdentificacionSelect && tipoIdentificacionSelect.value !== '' && cedulaInput && cedulaInput.value.trim() === '') {
                    showError(cedulaInput, `Este campo es obligatorio para ${role} si seleccionó un tipo de identificación.`);
                    currentRoleHasErrors = true;
                } else if (tipoIdentificacionSelect && tipoIdentificacionSelect.value === '' && cedulaInput && cedulaInput.value.trim() !== '') {
                    // Si la cédula tiene valor pero no hay tipo de identificación, esto es un error
                    showError(tipoIdentificacionSelect, `Debe seleccionar un tipo de identificación para ${role}.`);
                    currentRoleHasErrors = true;
                }


                // Si hay errores en campos requeridos, no intentar validar más allá
                if (currentRoleHasErrors) {
                    return false; // Indica que este rol tiene errores
                }

                // Limpiar errores en campos opcionales si están vacíos
                optionalFields.forEach(field => {
                    const input = document.getElementById(field);
                    if (input) clearError(input);
                });
                return true; // Indica que este rol está validado sin errores obligatorios
            } else {
                // Si no hay ningún campo lleno para este rol, limpiar todos los errores
                [...requiredFields, ...optionalFields].forEach(field => {
                    const input = document.getElementById(field);
                    if (input) clearError(input);
                });
                return true; // Considerado válido si está completamente vacío
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
                    // Solo validar en blur, el submit manejará la validación completa
                    input.addEventListener('blur', () => validateParentOrTutorFields(role));
                    if (input.type === 'select-one') {
                        input.addEventListener('change', () => validateParentOrTutorFields(role));
                    }
                }
            });
            const typeSelect = document.getElementById(`tipoIdentificacion${role}`);
            const cedulaInput = document.getElementById(`cedula${role}`);
            if (typeSelect && cedulaInput) {
                applyCedulaValidation(typeSelect, cedulaInput);
            }
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
                fechaMatriculaInput.classList.add('is-valid'); // Marcar como válido si se autocompleta
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

            // Restablecer radios (si aplica, aunque ahora hay más selects)
            document.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.checked = false;
            });

            // Restablecer selects
            document.querySelectorAll('select').forEach(select => {
                select.value = '';
                const event = new Event('change');
                select.dispatchEvent(event); // Disparar change para actualizar dependencias
                clearError(select);
            });

            // Restablecer inputs de texto/número que puedan tener estados particulares
            document.querySelectorAll('input[type="text"], input[type="number"], input[type="tel"], textarea').forEach(input => {
                input.value = '';
                clearError(input);
                input.classList.remove('is-valid', 'is-invalid');
            });

            // Asegurar que fechaMatricula se setee de nuevo
            setFechaMatriculaToday();

            // Sincronizar ubicaciones y grados
            setupNationalityDependentFields();
            setupGradeAndModalityFiltering();
            synchronizeLocationFields();

            // Deshabilitar tipoDiscapacidad
            const tipoDiscapacidadInput = document.getElementById('tipoDiscapacidad');
            if (tipoDiscapacidadInput) {
                tipoDiscapacidadInput.value = '';
                tipoDiscapacidadInput.disabled = true;
                clearError(tipoDiscapacidadInput);
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
                        clearError(this); // No es un error si está vacío al salir del campo
                    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(this.value)) {
                        showError(this, `Solo se permiten letras y espacios para ${fieldName}.`);
                    } else {
                        clearError(this);
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
                });

                inputElement.addEventListener('blur', function() {
                    if (this.value.trim() === '') {
                        clearError(this); // No es un error si está vacío al salir del campo
                    } else if (this.value.length !== exactLength) {
                        showError(this, `El número debe tener exactamente ${exactLength} dígitos. Ejemplo: ${example}`);
                    } else if (!/^[0-9]+$/.test(this.value)) {
                        showError(this, 'Solo se permiten números. Ejemplo: ' + example);
                    } else {
                        clearError(this);
                    }
                });
            }
        }

        function applyCedulaValidation(typeSelectElement, cedulaInputElement) {
            if (typeSelectElement && cedulaInputElement) {
                const validateCedula = () => {
                    const selectedType = typeSelectElement.value;
                    let hasError = false;

                    if (selectedType === 'Cedula Nicaraguense') {
                        cedulaInputElement.disabled = false;
                        cedulaInputElement.placeholder = 'XXX-XXXXXX-XXXXA';
                        let value = cedulaInputElement.value.toUpperCase().replace(/[^0-9A-Z]/g, '');
                        let formattedValue = '';
                        if (value.length > 0) {
                            formattedValue += value.substring(0, 3);
                            if (value.length > 3) {
                                formattedValue += '-' + value.substring(3, 9);
                                if (value.length > 9) {
                                    formattedValue += '-' + value.substring(9, 13);
                                    if (value.length > 13) {
                                        const lastChar = value.substring(13, 14);
                                        if (/[A-Z]/.test(lastChar)) {
                                            formattedValue += lastChar;
                                        }
                                    }
                                }
                            }
                        }
                        if (formattedValue.length > 16) {
                            formattedValue = formattedValue.slice(0, 16);
                        }
                        cedulaInputElement.value = formattedValue;

                        if (!/^\d{3}-\d{6}-\d{4}[A-Z]$/.test(cedulaInputElement.value)) {
                            showError(cedulaInputElement, 'Formato de cédula nicaragüense incorrecto. Debe ser XXX-XXXXXX-XXXXA. Ejemplo: 123-456789-0123A');
                            hasError = true;
                        } else {
                            clearError(cedulaInputElement);
                        }
                    } else if (selectedType === 'Cedula Extranjera') {
                        cedulaInputElement.disabled = false;
                        cedulaInputElement.placeholder = 'DNI o Documento válido';
                        if (cedulaInputElement.value.trim() === '') {
                             clearError(cedulaInputElement); // No hay error si está vacío, se valida al submit si es requerido
                        } else {
                            clearError(cedulaInputElement);
                        }
                    } else {
                        cedulaInputElement.value = '';
                        cedulaInputElement.disabled = true;
                        clearError(cedulaInputElement);
                    }
                    // Si el select cambia y la cédula se deshabilita, asegurarse de limpiar su estado visual
                    if (cedulaInputElement.disabled) {
                        cedulaInputElement.classList.remove('is-invalid', 'is-valid');
                    }
                };

                typeSelectElement.addEventListener('change', validateCedula);
                cedulaInputElement.addEventListener('input', validateCedula);
                cedulaInputElement.addEventListener('blur', validateCedula);
                validateCedula(); // Llamada inicial
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
                    if (this.value.trim() === '') {
                        clearError(this);
                    } else if (isNaN(value) || value <= 0) {
                        showError(this, `El campo ${fieldName} debe ser un número positivo mayor que 0.`);
                    } else {
                        clearError(this);
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
                updatePaisNacimiento();
            }

            // Aplicar validación de solo letras al input de país de nacimiento
            applyLettersOnlyValidation(paisNacimientoInput, 'País de Nacimiento');
        }

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
                    defaultGradoOption.textContent = 'Seleccione un grado';
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
                    gradoSelect.value = ''; // Reset grado selection
                    clearError(gradoSelect); // Clear error for grado

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
                filterOptions(); // Initial call to set up grades based on default nivelEducativo
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
                updateAcademicLocation(); // Initial call
            }
        }

        // Manejo de visibilidad y obligatoriedad de Tipo de Discapacidad (ajustado para SELECT)
        const discapacidadSelect = document.getElementById('discapacidad');
        const tipoDiscapacidadInput = document.getElementById('tipoDiscapacidad');

        if (discapacidadSelect && tipoDiscapacidadInput) {
            const toggleTipoDiscapacidad = () => {
                const selectedDiscapacidad = discapacidadSelect.value;
                if (selectedDiscapacidad !== '' && selectedDiscapacidad !== 'Ninguna') { // Habilitar si se selecciona una discapacidad real
                    tipoDiscapacidadInput.disabled = false;
                    tipoDiscapacidadInput.placeholder = 'Describa el tipo de discapacidad';
                } else {
                    tipoDiscapacidadInput.value = '';
                    tipoDiscapacidadInput.disabled = true;
                    tipoDiscapacidadInput.placeholder = '';
                    clearError(tipoDiscapacidadInput); // Limpiar errores si se deshabilita
                    tipoDiscapacidadInput.classList.remove('is-valid', 'is-invalid');
                }
            };

            discapacidadSelect.addEventListener('change', toggleTipoDiscapacidad);
            toggleTipoDiscapacidad(); // Llamada inicial al cargar
            applyLettersOnlyValidation(tipoDiscapacidadInput, 'Tipo de Discapacidad'); // Aplica la validación de letras
        }


        // Aplicar todas las validaciones a los campos relevantes
        applyLettersOnlyValidation(document.getElementById('primerNombre'), 'Primer Nombre');
        applyLettersOnlyValidation(document.getElementById('segundoNombre'), 'Segundo Nombre');
        applyLettersOnlyValidation(document.getElementById('primerApellido'), 'Primer Apellido');
        applyLettersOnlyValidation(document.getElementById('segundoApellido'), 'Segundo Apellido');
        applyPhoneValidation(document.getElementById('telefono'), 8, '88887777');
        applyPositiveNumberValidation(document.getElementById('peso'), 'peso');
        applyPositiveNumberValidation(document.getElementById('talla'), 'talla');
        // No aplico validación de letras a los select de territorio/habita indígena directamente, ya que son selects.
        // Si fueran inputs de texto para "otro", sí.

        // Configurar campos dependientes y valores iniciales
        setupNationalityDependentFields();
        setupGradeAndModalityFiltering();
        synchronizeLocationFields();
        setFechaMatriculaToday();


        matriculaForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value.trim();
            }

            // Capturar valores de radio buttons explícitamente (solo para 'turno' y 'repitente')
            data.turno = document.querySelector('input[name="turno"]:checked')?.value || '';
            data.repitente = document.querySelector('input[name="repitente"]:checked')?.value || '';
            // Los campos 'genero' y 'discapacidad' ya se capturan del select directamente por formData.entries()


            let formIsValid = true;

            // Limpiar errores y estados de validación previos
            document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
            document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
            document.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));


            // Volver a ejecutar los eventos 'blur' para inputs/selects/textareas para refrescar validación visual
            this.querySelectorAll('input:not([type="radio"]), select, textarea').forEach(input => {
                if (!input.readOnly && !input.disabled) {
                    const event = new Event('blur');
                    input.dispatchEvent(event);
                    // Para selects, también dispara 'change'
                    if (input.tagName === 'SELECT') {
                        const changeEvent = new Event('change');
                        input.dispatchEvent(changeEvent);
                    }
                }
            });

            // --- VALIDACIONES DE CAMPOS OBLIGATORIOS Y ESPECÍFICOS ---

            // Validación de radio button groups ('turno', 'repitente')
            const radioGroupsToValidate = ['turno', 'repitente'];
            radioGroupsToValidate.forEach(groupName => {
                const radios = this.querySelectorAll(`input[name="${groupName}"]`);
                const isChecked = Array.from(radios).some(radio => radio.checked);
                const container = radios[0]?.closest('.form-check-inline-group'); // Asegurarse de que el contenedor exista

                if (!isChecked) {
                    if (container) {
                        let errorSpan = container.querySelector('.error-message');
                        if (!errorSpan) {
                            errorSpan = document.createElement('span');
                            errorSpan.classList.add('error-message');
                            container.appendChild(errorSpan);
                        }
                        errorSpan.textContent = 'Este campo es obligatorio.';
                        formIsValid = false;
                        radios.forEach(radio => radio.classList.add('is-invalid')); // Marcar radios como inválidos
                    }
                } else {
                    if (container) {
                        const errorSpan = container.querySelector('.error-message');
                        if (errorSpan) errorSpan.remove();
                        radios.forEach(radio => radio.classList.remove('is-invalid')); // Limpiar si ya está válido
                    }
                }
            });


            // Si 'discapacidad' es algo distinto de "Ninguna" y vacío, entonces 'tipoDiscapacidad' es obligatorio
            if (data.discapacidad !== '' && data.discapacidad !== 'Ninguna' && data.tipoDiscapacidad === '') {
                const tipoDiscapacidadInput = document.getElementById('tipoDiscapacidad');
                showError(tipoDiscapacidadInput, 'Debe especificar el tipo de discapacidad.');
                formIsValid = false;
            } else if (data.discapacidad === 'Ninguna' || data.discapacidad === '') {
                // Si seleccionó "Ninguna" o nada, el campo tipoDiscapacidad debe estar vacío y deshabilitado
                const tipoDiscapacidadInput = document.getElementById('tipoDiscapacidad');
                if (tipoDiscapacidadInput.value.trim() !== '') {
                    tipoDiscapacidadInput.value = ''; // Limpiar si tiene algo
                }
                clearError(tipoDiscapacidadInput); // Asegurar que no haya error
            }


            // Validación de campos obligatorios generales (inputs, selects, textareas)
            // Excluir 'tipoDiscapacidad' de esta lista porque su obligatoriedad es condicional
            const generalRequiredFields = [
                'telefono', 'direccion', 'primerNombre', 'primerApellido', 'fechaNacimiento',
                'peso', 'talla', 'nacionalidad', 'paisNacimiento',
                'residenciaDepartamento', 'residenciaMunicipio', 'lenguaMaterna',
                'discapacidad', // Discapacidad es obligatorio, pero su valor puede ser 'Ninguna'
                'fechaMatricula', 'departamentoacad', 'municipioAcad', 'codigoUnico',
                'codigoCentro', 'nombreCentro', 'nivelEducativo', 'modalidad', 'grado', 'seccion',
                'genero' // Género es un select ahora
            ];

            for (const fieldName of generalRequiredFields) {
                const inputElement = this.querySelector(`[name="${fieldName}"]`);
                if (inputElement && !inputElement.readOnly && !inputElement.disabled) {
                    if (data[fieldName] === '' || data[fieldName] === null) { // También verifica null para selects
                        // Si es el campo 'discapacidad' y su valor es 'Ninguna', no es un error de campo vacío
                        if (fieldName === 'discapacidad' && data[fieldName] === 'Ninguna') {
                            clearError(inputElement);
                            inputElement.classList.add('is-valid');
                            continue; // Saltar a la siguiente iteración
                        }
                        
                        showError(inputElement, 'Este campo es obligatorio.');
                        formIsValid = false;
                    } else {
                        clearError(inputElement);
                        inputElement.classList.add('is-valid');
                    }
                }
            }


            // Validación de datos de padres/tutores
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
                // Si algún rol está parcialmente lleno, validar sus campos obligatorios
                if (isMadreComplete && !validateParentOrTutorFields('Madre')) formIsValid = false;
                if (isPadreComplete && !validateParentOrTutorFields('Padre')) formIsValid = false;
                if (isTutorComplete && !validateParentOrTutorFields('Tutor')) formIsValid = false;
            }


            // Verificación final de si hay algún campo marcado como inválido
            if (document.querySelectorAll('.is-invalid').length > 0) {
                formIsValid = false;
                console.log('Detectados campos inválidos en la revisión final.');
            }


            if (!formIsValid) {
                console.log('❌ Formulario no válido. Revise los campos.');
                // Mueve el foco al primer campo con error
                const firstInvalidField = document.querySelector('.is-invalid');
                if (firstInvalidField) {
                    firstInvalidField.focus();
                    // Opcional: desplazar la ventana a la vista del campo
                    firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                if (errorMessageElement) {
                    errorMessageElement.style.display = 'block';
                    errorMessageElement.textContent = errorMessageElement.textContent || "Por favor, corrija los errores en el formulario.";
                }
                matriculaForm.style.display = 'block';
                return;
            }

            // Ocultar el formulario y mostrar mensaje de carga
            matriculaForm.style.display = 'none';
            const loadingMessage = document.getElementById('loadingIndicator'); // ID corregido
            if (loadingMessage) loadingMessage.style.display = 'block';

            try {
                let matriculaId; // Variable para almacenar el ID generado

                // 1. Guardar Datos Académicos (para obtener el matriculaId)
                const academicData = {
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
                };

                console.log('Enviando datos académicos:', academicData);
                const academicResponse = await fetch(`${BACKEND_URL}/api/academic`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(academicData)
                });

                if (!academicResponse.ok) {
                    const errorText = await academicResponse.text();
                    throw new Error(`Error al guardar datos académicos: ${errorText}`);
                }
                const academicResult = await academicResponse.json();
                matriculaId = academicResult.id; // ¡Aquí capturamos el ID generado por la BD!
                console.log('✅ Datos académicos guardados. ID de Matrícula (académico):', matriculaId);


                // 2. Guardar Datos del Estudiante (usando el matriculaId obtenido)
                const studentData = {
                    matriculaId: matriculaId, // Vincula al ID académico
                    primerNombre: data.primerNombre,
                    segundoNombre: data.segundoNombre,
                    primerApellido: data.primerApellido,
                    segundoApellido: data.segundoApellido,
                    fechaNacimiento: data.fechaNacimiento,
                    // Calcular edad aquí si no hay un campo de edad explícito, o si es derivado
                    // Por ahora, si no hay 'edad' en el formulario, se omitiría o se calcularía
                    // Si tienes un campo de edad, asegúrate de que sea numérico y válido
                    // edad: parseInt(data.edad), // Si existe un input 'edad'
                    genero: data.genero,
                    telefono: data.telefono,
                    direccion: data.direccion,
                    peso: parseFloat(data.peso),
                    talla: parseFloat(data.talla),
                    nacionalidad: data.nacionalidad,
                    paisNacimiento: data.paisNacimiento,
                    residenciaDepartamento: data.residenciaDepartamento,
                    residenciaMunicipio: data.residenciaMunicipio,
                    lenguaMaterna: data.lenguaMaterna,
                    discapacidad: data.discapacidad,
                    tipoDiscapacidad: (data.discapacidad !== '' && data.discapacidad !== 'Ninguna') ? data.tipoDiscapacidad : null, // Solo guarda si hay discapacidad
                    territorioIndigena: data.territorioIndigenaEstudiante,
                    habitaIndigena: data.habitaIndigenaEstudiante
                };

                console.log('Enviando datos del estudiante:', studentData);
                const studentResponse = await fetch(`${BACKEND_URL}/api/student`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(studentData)
                });

                if (!studentResponse.ok) {
                    const errorText = await studentResponse.text();
                    throw new Error(`Error al guardar datos del estudiante: ${errorText}`);
                }
                console.log('✅ Datos del estudiante guardados.');


                // 3. Guardar Datos de Padres/Tutor (condicionalmente, usando el matriculaId)
                const parentRoles = ['Madre', 'Padre', 'Tutor'];
                const allParentDataForPdf = {}; // Objeto único para recolectar todos los datos de padres para el PDF

                for (const role of parentRoles) {
                    // Solo intentar guardar si al menos el primer nombre o algun otro campo significativo está presente para ese rol
                    const isRoleDataPresent = data[`primerNombre${role}`] || data[`primerApellido${role}`] || data[`telefono${role}`] || data[`cedula${role}`] || data[`tipoIdentificacion${role}`];

                    if (isRoleDataPresent) {
                        const currentParentData = {
                            matriculaId: matriculaId, // Vincula al ID académico
                            tipoFamiliar: role, // Esto se usará para determinar qué tabla de padres es en tu backend
                            primerNombre: data[`primerNombre${role}`] || null,
                            segundoNombre: data[`segundoNombre${role}`] || null,
                            primerApellido: data[`primerApellido${role}`] || null,
                            segundoApellido: data[`segundoApellido${role}`] || null,
                            tipoIdentificacion: data[`tipoIdentificacion${role}`] || null,
                            cedula: data[`cedula${role}`] || null,
                            telefono: data[`telefono${role}`] || null
                        };

                        // Recopila los datos para el PDF también
                        // Asegúrate de que las claves aquí coincidan con lo que tu PDF espera
                        allParentDataForPdf[`primerNombre${role}`] = currentParentData.primerNombre;
                        allParentDataForPdf[`segundoNombre${role}`] = currentParentData.segundoNombre;
                        allParentDataForPdf[`primerApellido${role}`] = currentParentData.primerApellido;
                        allParentDataForPdf[`segundoApellido${role}`] = currentParentData.segundoApellido;
                        allParentDataForPdf[`tipoIdentificacion${role}`] = currentParentData.tipoIdentificacion;
                        allParentDataForPdf[`cedula${role}`] = currentParentData.cedula;
                        allParentDataForPdf[`telefono${role}`] = currentParentData.telefono;
                        // Si tu PDF espera una estructura diferente, ajusta allParentDataForPdf aquí

                        console.log(`Enviando datos de ${role} a la base de datos:`, currentParentData);
                        const parentResponse = await fetch(`${BACKEND_URL}/api/parent`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(currentParentData)
                        });

                        if (!parentResponse.ok) {
                            const errorText = await parentResponse.text();
                            throw new Error(`Error al guardar datos de ${role}: ${errorText}`);
                        }
                        console.log(`✅ Datos de ${role} guardados.`);
                    }
                }

                // 4. Generar PDF (después de guardar TODOS los datos)
                console.log('Generando PDF...');

                const pdfPayload = {
                    studentData: studentData,
                    academicData: academicData,
                    parentData: allParentDataForPdf // Pasa el objeto unificado de datos de padres
                };

                const pdfResponse = await fetch(`${BACKEND_URL}/api/generate-pdf`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(pdfPayload),
                });

                if (!pdfResponse.ok) {
                    const errorText = await pdfResponse.text();
                    throw new Error(`Error al generar el PDF: ${errorText}`);
                }

                const pdfBlob = await pdfResponse.blob();
                const url = window.URL.createObjectURL(pdfBlob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `Matricula_${matriculaId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);

                console.log(' ✅  Todos los datos han sido guardados exitosamente y PDF generado.');

                // Mostrar mensaje de éxito flotante
                const alertDiv = document.createElement('div');
                alertDiv.className = 'alert-float';
                alertDiv.innerHTML = '<span class="emoji"> 🎉 </span> <span>¡Matrícula Exitosa!</span>';
                document.body.appendChild(alertDiv);
                void alertDiv.offsetWidth;
                alertDiv.classList.add('success-visible');

                // Ocultar mensaje y limpiar formulario
                setTimeout(() => {
                    alertDiv.classList.remove('success-visible');
                    setTimeout(() => {
                        alertDiv.remove();
                        clearForm();
                    }, 500);
                }, 3000);

            } catch (error) {
                console.error('  ❌  Error en el proceso de matrícula:', error);
                const errorMessageElement = document.getElementById('error-message'); // Mensaje de error general
                if (errorMessageElement) {
                    errorMessageElement.style.display = 'block';
                    errorMessageElement.textContent = `Error al procesar la matrícula: ${error.message}`;
                }
            } finally {
                if (loadingMessage) loadingMessage.style.display = 'none';
                matriculaForm.style.display = 'block'; // Mostrar formulario de nuevo si hubo un error
            }
        });
    }
});