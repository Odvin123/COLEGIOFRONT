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
                // If all fields for a role are empty, clear all errors for that role
                ([...requiredFields, ...optionalFields]).forEach(field => {
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
                const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
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

            // Reset nationality and country of birth
            const paisNacimientoInput = document.getElementById('paisNacimiento');
            const nacionalidadSelect = document.getElementById('nacionalidad');
            if (nacionalidadSelect && paisNacimientoInput) {
                nacionalidadSelect.value = ''; // Reset to default "Seleccione una opción"
                // Manually trigger change to update paisNacimientoInput
                const event = new Event('change');
                nacionalidadSelect.dispatchEvent(event);
            }

            // Reset educational level and related fields
            const nivelEducativoSelect = document.getElementById('nivelEducativo');
            if (nivelEducativoSelect) {
                nivelEducativoSelect.value = '';
                const event = new Event('change');
                nivelEducativoSelect.dispatchEvent(event);
            }

            // Reset identification type and cedula for parents/tutors
            ['Madre', 'Padre', 'Tutor'].forEach(role => {
                const typeSelect = document.getElementById(`tipoIdentificacion${role}`);
                const cedulaInput = document.getElementById(`cedula${role}`);
                if (typeSelect) {
                    typeSelect.value = '';
                    if (cedulaInput) {
                        cedulaInput.disabled = true; // Disable cedula
                        cedulaInput.value = ''; // Clear cedula value
                        clearError(cedulaInput); // Clear any cedula errors
                    }
                }
            });

            // Clear the general error message
            const errorMessageElement = document.getElementById('error-message');
            if (errorMessageElement) {
                errorMessageElement.style.display = 'none';
                errorMessageElement.textContent = '';
            }

            // Uncheck all radio buttons
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
                        event.target.value = sanitizedValue.slice(0, exactLength); // Truncate to exactLength
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
                        let value = cedulaInputElement.value.toUpperCase().replace(/[^0-9A-Z]/g, ''); // Allow only numbers and letters
                        let formattedValue = '';
                        if (value.length > 0) {
                            formattedValue += value.substring(0, 3);
                            if (value.length > 3) {
                                formattedValue += '-' + value.substring(3, 9);
                                if (value.length > 9) {
                                    formattedValue += '-' + value.substring(9, 13);
                                    if (value.length > 13) {
                                        formattedValue += value.substring(13, 14); // Last letter
                                    }
                                }
                            }
                        }
                        if (formattedValue.length > 16) { // Max length including hyphens for XXX-XXXXXX-XXXXA
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
                        clearError(cedulaInputElement); // Clear any previous errors
                        cedulaInputElement.classList.remove('is-invalid', 'is-valid'); // Remove validation classes
                    } else {
                        // If no identification type is selected, disable and clear cedula
                        cedulaInputElement.value = '';
                        cedulaInputElement.disabled = true;
                        clearError(cedulaInputElement);
                        cedulaInputElement.classList.remove('is-invalid', 'is-valid');
                    }
                };

                // Event listeners to detect changes
                typeSelectElement.addEventListener('change', validateCedula);
                cedulaInputElement.addEventListener('input', validateCedula);
                cedulaInputElement.addEventListener('blur', validateCedula);

                validateCedula(); // Execute once on load to set initial state
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

            // Apply letters only validation to paisNacimientoInput after it's potentially set to readOnly
            applyLettersOnlyValidation(paisNacimientoInput, 'País de Nacimiento');

            // Re-apply event listener and call on load to ensure proper behavior
            if (nacionalidadSelect && paisNacimientoInput) {
                nacionalidadSelect.addEventListener('change', updatePaisNacimiento);
                applyLettersOnlyValidation(paisNacimientoInput, 'País de Nacimiento'); // Ensure validation is always active
                updatePaisNacimiento(); // Call on load to set initial state
            }
        }

        function setupGradeAndModalityFiltering() {
            const nivelEducativoSelect = document.getElementById('nivelEducativo');
            const gradoSelect = document.getElementById('grado');
            const modalidadInput = document.getElementById('modalidad');

            if (nivelEducativoSelect && gradoSelect && modalidadInput) {
                // Store initial options to restore them
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
                    gradoSelect.value = ''; // Reset selected grade
                    clearError(gradoSelect); // Clear any error on grade select

                    // Set modality based on nivelEducativo
                    if (selectedNivel === 'Educación Inicial') {
                        modalidadInput.value = 'Preescolar-formal';
                    } else if (selectedNivel === 'Educación Primaria') {
                        modalidadInput.value = 'Primaria';
                    } else if (selectedNivel === 'Educación Secundaria') {
                        modalidadInput.value = 'Secundaria';
                    } else {
                        modalidadInput.value = ''; // Clear if no level selected
                    }
                    clearError(modalidadInput);
                    if (modalidadInput.value !== '') {
                        modalidadInput.classList.add('is-valid');
                    } else {
                        modalidadInput.classList.remove('is-valid');
                    }
                };

                nivelEducativoSelect.addEventListener('change', filterOptions);
                filterOptions(); // Call on load to set initial state
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
                updateAcademicLocation(); // Set initial state
            }
        }

        // Apply validations to specific fields
        applyLettersOnlyValidation(document.getElementById('primerNombre'), 'Primer Nombre');
        applyLettersOnlyValidation(document.getElementById('segundoNombre'), 'Segundo Nombre');
        applyLettersOnlyValidation(document.getElementById('primerApellido'), 'Primer Apellido');
        applyLettersOnlyValidation(document.getElementById('segundoApellido'), 'Segundo Apellido');
        applyPhoneValidation(document.getElementById('telefono'), 8, '88887777');
        applyPositiveNumberValidation(document.getElementById('peso'), 'peso');
        applyPositiveNumberValidation(document.getElementById('talla'), 'talla');
        applyLettersOnlyValidation(document.getElementById('territorioIndigenaEstudiante'), 'Territorio Indígena');
        applyLettersOnlyValidation(document.getElementById('habitaIndigenaEstudiante'), 'Habita Indígena');

        // Mother's fields
        applyLettersOnlyValidation(document.getElementById('primerNombreMadre'), 'Primer Nombre de la Madre');
        applyLettersOnlyValidation(document.getElementById('segundoNombreMadre'), 'Segundo Nombre de la Madre');
        applyLettersOnlyValidation(document.getElementById('primerApellidoMadre'), 'Primer Apellido de la Madre');
        applyLettersOnlyValidation(document.getElementById('segundoApellidoMadre'), 'Segundo Apellido de la Madre');
        applyCedulaValidation(document.getElementById('tipoIdentificacionMadre'), document.getElementById('cedulaMadre'));
        applyPhoneValidation(document.getElementById('telefonoMadre'), 8, '88887777');

        // Father's fields
        applyLettersOnlyValidation(document.getElementById('primerNombrePadre'), 'Primer Nombre del Padre');
        applyLettersOnlyValidation(document.getElementById('segundoNombrePadre'), 'Segundo Nombre del Padre');
        applyLettersOnlyValidation(document.getElementById('primerApellidoPadre'), 'Primer Apellido del Padre');
        applyLettersOnlyValidation(document.getElementById('segundoApellidoPadre'), 'Segundo Apellido del Padre');
        applyCedulaValidation(document.getElementById('tipoIdentificacionPadre'), document.getElementById('cedulaPadre'));
        applyPhoneValidation(document.getElementById('telefonoPadre'), 8, '88887777');

        // Tutor's fields
        applyLettersOnlyValidation(document.getElementById('primerNombreTutor'), 'Primer Nombre del Tutor');
        applyLettersOnlyValidation(document.getElementById('segundoNombreTutor'), 'Segundo Nombre del Tutor');
        applyLettersOnlyValidation(document.getElementById('primerApellidoTutor'), 'Primer Apellido del Tutor');
        applyLettersOnlyValidation(document.getElementById('segundoApellidoTutor'), 'Segundo Apellido del Tutor');
        applyCedulaValidation(document.getElementById('tipoIdentificacionTutor'), document.getElementById('cedulaTutor'));
        applyPhoneValidation(document.getElementById('telefonoTutor'), 8, '88887777');


        // Initial setup calls
        setupNationalityDependentFields();
        setupGradeAndModalityFiltering();
        synchronizeLocationFields();
        setFechaMatriculaToday(); // Set today's date on load


        matriculaForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevent default form submission

            const formData = new FormData(this);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value.trim();
            }

            // Manually get radio button values
            data.turno = document.querySelector('input[name="turno"]:checked')?.value || '';
            data.repitente = document.querySelector('input[name="repitente"]:checked')?.value || '';


            let formIsValid = true;

            // Clear all existing error messages and validation classes
            document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
            document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
            document.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));

            // Re-validate all inputs on submit by dispatching blur event
            this.querySelectorAll('input:not([type="radio"]), select, textarea').forEach(input => {
                // Do not validate readOnly or disabled fields unless explicitly handled
                if (!input.readOnly && !input.disabled) {
                    const event = new Event('blur');
                    input.dispatchEvent(event);
                }
            });

            // Re-validate dynamic fields like cedula which depend on select changes
            ['Madre', 'Padre', 'Tutor'].forEach(role => {
                const typeSelect = document.getElementById(`tipoIdentificacion${role}`);
                const cedulaInput = document.getElementById(`cedula${role}`);
                if (typeSelect && cedulaInput) {
                    applyCedulaValidation(typeSelect, cedulaInput); // Re-run validation logic

                    // Specific check for cedula if type is selected but cedula is empty and not disabled
                    if (typeSelect.value !== '' && cedulaInput.value.trim() === '' && !cedulaInput.disabled) {
                        showError(cedulaInput, 'Este campo es obligatorio cuando se selecciona un tipo de identificación.');
                        formIsValid = false;
                    }
                }
            });


            // Manual validation for required fields
            const studentRequiredFields = ['telefono', 'direccion', 'primerNombre', 'primerApellido', 'fechaNacimiento',
                'genero', 'peso', 'talla', 'nacionalidad', 'paisNacimiento',
                'residenciaDepartamento', 'residenciaMunicipio', 'lenguaMaterna', 'discapacidad'
            ];

            for (const fieldName of studentRequiredFields) {
                const inputElement = this.querySelector(`[name="${fieldName}"]`);
                // Check if inputElement exists, is not readOnly, and its value is empty
                if (inputElement && data[fieldName] === '' && !inputElement.readOnly) {
                    showError(inputElement, 'Este campo es obligatorio.');
                    formIsValid = false;
                }
            }

            // Validate at least one parent/tutor section is filled
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


            const academicRequiredFields = ['fechaMatricula', 'departamentoacad', 'municipioAcad', 'codigoUnico',
                'codigoCentro', 'nombreCentro', 'nivelEducativo', 'modalidad',
                'turno', 'grado', 'seccion', 'repitente'
            ];

            for (const fieldName of academicRequiredFields) {
                const inputElement = this.querySelector(`[name="${fieldName}"]`);
                if (inputElement && inputElement.type === 'radio') {
                    // For radio buttons, check if any in the group is selected
                    const radioGroup = this.querySelectorAll(`input[name="${fieldName}"]`);
                    const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                    if (!isChecked) {
                        // Find the closest common parent div to append the error message
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
                } else if (inputElement && data[fieldName] === '' && !inputElement.readOnly) {
                    showError(inputElement, 'Este campo es obligatorio.');
                    formIsValid = false;
                }
            }


            // Final check for any remaining invalid inputs
            const invalidInputs = this.querySelectorAll('.is-invalid');
            if (invalidInputs.length > 0) {
                formIsValid = false;
            }

            if (formIsValid) {
                console.log('Todos los datos son válidos, enviando al backend...', data);

                // Hide the form and show a success message
                matriculaForm.style.display = 'none';
                try {
                    const studentData = {
                        primerNombre: data.primerNombre,
                        segundoNombre: data.segundoNombre,
                        primerApellido: data.primerApellido,
                        segundoApellido: data.segundoApellido,
                        fechaNacimiento: data.fechaNacimiento,
                        genero: data.genero,
                        edad: parseInt(data.edad),
                        peso: parseFloat(data.peso),
                        talla: parseFloat(data.talla),
                        nacionalidad: data.nacionalidad,
                        paisNacimiento: data.paisNacimiento,
                        departamento: data.residenciaDepartamento,
                        municipio: data.residenciaMunicipio,
                        direccion: data.direccion,
                        telefono: data.telefono,
                        lenguaMaterna: data.lenguaMaterna,
                        discapacidad: data.discapacidad,
                        tipoDiscapacidad: data.tipoDiscapacidad,
                        territorioIndigena: data.territorioIndigenaEstudiante,
                        habitaIndigena: data.habitaIndigenaEstudiante,
                        // Parent/Tutor data (include only if present)
                        madre: isMadreComplete ? {
                            primerNombre: data.primerNombreMadre,
                            segundoNombre: data.segundoNombreMadre,
                            primerApellido: data.primerApellidoMadre,
                            segundoApellido: data.segundoApellidoMadre,
                            tipoIdentificacion: data.tipoIdentificacionMadre,
                            cedula: data.cedulaMadre,
                            telefono: data.telefonoMadre
                        } : undefined,
                        padre: isPadreComplete ? {
                            primerNombre: data.primerNombrePadre,
                            segundoNombre: data.segundoNombrePadre,
                            primerApellido: data.primerApellidoPadre,
                            segundoApellido: data.segundoApellidoPadre,
                            tipoIdentificacion: data.tipoIdentificacionPadre,
                            cedula: data.cedulaPadre,
                            telefono: data.telefonoPadre
                        } : undefined,
                        tutor: isTutorComplete ? {
                            primerNombre: data.primerNombreTutor,
                            segundoNombre: data.segundoNombreTutor,
                            primerApellido: data.primerApellidoTutor,
                            segundoApellido: data.segundoApellidoTutor,
                            tipoIdentificacion: data.tipoIdentificacionTutor,
                            cedula: data.cedulaTutor,
                            telefono: data.telefonoTutor
                        } : undefined,
                    };

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

                    // Send data to the backend for database storage
                    const response = await fetch(`${BACKEND_URL}/submit_form`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ studentData, academicData }),
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(errorText || 'Error al guardar los datos.');
                    }

                    const result = await response.json();
                    console.log('✅ Datos guardados con éxito:', result);

                    // --- PDF Generation Logic ---
                    // Assuming your backend has an endpoint for PDF generation
                    const pdfResponse = await fetch(`${BACKEND_URL}/generate_pdf`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        // Send the data required for PDF generation
                        body: JSON.stringify({ studentData, academicData }),
                    });

                    if (!pdfResponse.ok) {
                        const errorText = await pdfResponse.text();
                        throw new Error(errorText || 'Error al generar el PDF.');
                    }

                    const pdfBlob = await pdfResponse.blob();
                    const pdfUrl = URL.createObjectURL(pdfBlob);

                    // Create a link to download the PDF
                    const a = document.createElement('a');
                    a.href = pdfUrl;
                    a.download = 'ficha_matricula.pdf';
                    document.body.appendChild(a);
                    a.click(); // Programmatically click the link to trigger download
                    document.body.removeChild(a);
                    URL.revokeObjectURL(pdfUrl); // Clean up the URL object

                    // Show success message
                    const successMessageElement = document.getElementById('success-message');
                    if (successMessageElement) {
                        successMessageElement.textContent = '¡Ficha de matrícula generada y guardada con éxito! ✅';
                        successMessageElement.classList.add('success-visible');
                        successMessageElement.style.display = 'flex'; // Use flex to center content
                    }

                    // Clear the form after successful submission and PDF generation
                    clearForm();

                    // Redirect to index.html after a delay
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 3000); // Redirect after 3 seconds
                } catch (error) {
                    console.error(' ❌ Error al conectar con el backend o generar PDF:', error);
                    const errorMessageElement = document.getElementById('error-message');
                    if (errorMessageElement) {
                        const errorText = error.message || 'Error desconocido.';
                        errorMessageElement.style.display = 'block';
                        errorMessageElement.textContent = `Error al generar el PDF: ${errorText}`;
                    }
                    matriculaForm.style.display = 'block'; // Show the form again on error
                }
            }
        });

    }
});