document.addEventListener('DOMContentLoaded', function() {
    const matriculaForm = document.getElementById('matriculaForm');
    if (matriculaForm) {
        // Estilos para el alert-float
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
                padding: 15px 30px;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.5s ease-in-out, visibility 0.5s ease-in-out;
                z-index: 1050; /* Por encima de otros elementos */
                font-family: 'Pacifico', cursive; /* Aplica la fuente */
                font-size: 1.8em; /* Tamaño de fuente más grande */
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .alert-float.success-visible {
                opacity: 1;
                visibility: visible;
            }
            .alert-float .emoji {
                font-size: 1.5em; /* Tamaño más grande para el emoji */
                line-height: 1;
            }
            .form-group.has-error .error-message {
                display: block;
                color: #dc3545; /* Rojo de error */
                font-size: 0.85em;
                margin-top: 5px;
            }
            .error-message {
                display: none;
            }
            .is-invalid {
                border-color: #dc3545 !important;
            }
        `;
        document.head.appendChild(style);

        // Funciones de utilidad
        function displayErrorMessage(elementId, message) {
            const element = document.getElementById(elementId);
            if (element) {
                element.classList.add('is-invalid');
                let errorDiv = element.nextElementSibling;
                if (!errorDiv || !errorDiv.classList.contains('error-message')) {
                    errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    element.parentNode.insertBefore(errorDiv, element.nextSibling);
                }
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
            }
        }

        function clearErrorMessage(elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.classList.remove('is-invalid');
                const errorDiv = element.nextElementSibling;
                if (errorDiv && errorDiv.classList.contains('error-message')) {
                    errorDiv.textContent = '';
                    errorDiv.style.display = 'none';
                }
            }
        }

        function clearForm() {
            matriculaForm.reset(); // Limpia todos los campos del formulario
            const errorMessages = document.querySelectorAll('.error-message');
            errorMessages.forEach(msg => {
                msg.textContent = '';
                msg.style.display = 'none';
            });
            const invalidFields = document.querySelectorAll('.is-invalid');
            invalidFields.forEach(field => {
                field.classList.remove('is-invalid');
            });
            // Restablecer campos calculados/dependientes si es necesario
            setEnrollmentDate(); // Vuelve a establecer la fecha actual
            // Disparar eventos change para resetear validaciones de selects
            document.querySelectorAll('select').forEach(select => {
                const event = new Event('change');
                select.dispatchEvent(event);
            });
            // Re-evaluar dependencias como las de nacionalidad y nivel académico
            document.getElementById('nacionalidadEstudiante').dispatchEvent(new Event('change'));
            document.getElementById('nivelAcademico').dispatchEvent(new Event('change'));
            document.getElementById('departamentoResidenciaEstudiante').dispatchEvent(new Event('change'));
        }

        // --- Validaciones Genéricas ---
        function validateLettersOnly(inputElement, errorMessageId, fieldName) {
            const value = inputElement.value.trim();
            const errorElement = document.getElementById(errorMessageId);
            if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value) && value !== '') {
                displayErrorMessage(inputElement.id, `${fieldName} solo debe contener letras.`);
                return false;
            } else {
                clearErrorMessage(inputElement.id);
                return true;
            }
        }

        function validatePhoneNumber(inputElement, errorMessageId, fieldName) {
            const value = inputElement.value.trim();
            if (value === '') {
                clearErrorMessage(inputElement.id);
                return true; // No es obligatorio si está vacío, se valida en el submit si es requerido
            }
            if (!/^\d{8}$/.test(value)) {
                displayErrorMessage(inputElement.id, `${fieldName} debe contener 8 dígitos numéricos.`);
                return false;
            } else {
                clearErrorMessage(inputElement.id);
                return true;
            }
        }

        function validateCedulaNicaraguense(inputElement, errorMessageId) {
            const value = inputElement.value.trim();
            if (value === '') {
                clearErrorMessage(inputElement.id);
                return true; // No es obligatorio si está vacío
            }
            // Formato: 000-000000-0000A
            if (!/^\d{3}-\d{6}-\d{4}[A-Z]$/.test(value)) {
                displayErrorMessage(inputElement.id, 'Formato Cédula Nicaragüense: 000-000000-0000A');
                return false;
            } else {
                clearErrorMessage(inputElement.id);
                return true;
            }
        }

        function validateCedulaExtranjera(inputElement, errorMessageId) {
            const value = inputElement.value.trim();
            if (value === '') {
                clearErrorMessage(inputElement.id);
                return true; // No es obligatorio si está vacío
            }
            // Puede ser alfanumérico, pero con al menos 5 caracteres
            if (!/^[a-zA-Z0-9]{5,}$/.test(value)) {
                displayErrorMessage(inputElement.id, 'Cédula Extranjera debe ser alfanumérica (mínimo 5 caracteres).');
                return false;
            } else {
                clearErrorMessage(inputElement.id);
                return true;
            }
        }

        function validatePositiveNumber(inputElement, errorMessageId, fieldName) {
            const value = inputElement.value.trim();
            if (value === '') {
                clearErrorMessage(inputElement.id);
                return true;
            }
            const number = parseFloat(value);
            if (isNaN(number) || number <= 0) {
                displayErrorMessage(inputElement.id, `${fieldName} debe ser un número positivo.`);
                return false;
            } else {
                clearErrorMessage(inputElement.id);
                return true;
            }
        }

        function validateEmail(inputElement, errorMessageId) {
            const value = inputElement.value.trim();
            if (value === '') {
                clearErrorMessage(inputElement.id);
                return true;
            }
            // Expresión regular para validar formato de correo electrónico
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                displayErrorMessage(inputElement.id, 'Formato de correo electrónico inválido.');
                return false;
            } else {
                clearErrorMessage(inputElement.id);
                return true;
            }
        }
        
        // --- Manejo de la fecha de matrícula ---
        function setEnrollmentDate() {
            const fechaMatriculaInput = document.getElementById('fechaMatricula');
            if (fechaMatriculaInput) {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0'); // Meses son 0-index
                const day = String(today.getDate()).padStart(2, '0');
                fechaMatriculaInput.value = `${year}-${month}-${day}`;
            }
        }
        setEnrollmentDate(); // Establecer la fecha al cargar la página

        // --- Lógica de campos condicionales y obligatorios ---

        // PAÍS DE NACIMIENTO ESTUDIANTE (CONDICIONAL A NACIONALIDAD)
        const nacionalidadEstudiante = document.getElementById('nacionalidadEstudiante');
        const paisNacimientoEstudiante = document.getElementById('paisNacimientoEstudiante');
        if (nacionalidadEstudiante && paisNacimientoEstudiante) {
            nacionalidadEstudiante.addEventListener('change', function() {
                if (this.value === 'Nicaragüense') {
                    paisNacimientoEstudiante.value = 'Nicaragua';
                    paisNacimientoEstudiante.readOnly = true;
                    clearErrorMessage(paisNacimientoEstudiante.id); // Asegura que no haya error
                } else if (this.value === 'Extranjero') {
                    paisNacimientoEstudiante.value = '';
                    paisNacimientoEstudiante.readOnly = false;
                    // Añadir listener para validar solo letras
                    paisNacimientoEstudiante.oninput = function() {
                        validateLettersOnly(paisNacimientoEstudiante, 'errorPaisNacimientoEstudiante', 'País de Nacimiento');
                    };
                } else {
                    paisNacimientoEstudiante.value = '';
                    paisNacimientoEstudiante.readOnly = false;
                    paisNacimientoEstudiante.oninput = null; // Eliminar el listener si no es Extranjero
                    clearErrorMessage(paisNacimientoEstudiante.id);
                }
            });
            // Disparar al cargar para establecer el estado inicial
            nacionalidadEstudiante.dispatchEvent(new Event('change'));
        }

        // VALIDACIÓN DE CÉDULA EXTRANJERA Y REMOCIÓN DE MENSAJE EJEMPLO
        const tipoIdentificacionMadre = document.getElementById('tipoIdentificacionMadre');
        const cedulaMadre = document.getElementById('cedulaMadre');
        const cedulaMadreExample = document.getElementById('exampleCedulaMadre'); // Asumiendo que tienes un span con este ID para el ejemplo
        
        if (tipoIdentificacionMadre && cedulaMadre) {
            tipoIdentificacionMadre.addEventListener('change', function() {
                if (this.value === 'Cedula Extranjera') {
                    if (cedulaMadreExample) cedulaMadreExample.style.display = 'none'; // Oculta el mensaje
                    cedulaMadre.placeholder = 'Ingrese cédula extranjera';
                    cedulaMadre.removeEventListener('input', validateCedulaNicaraguenseHandlerMadre);
                    cedulaMadre.addEventListener('input', validateCedulaExtranjeraHandlerMadre);
                } else if (this.value === 'Cedula Nicaraguense') {
                    if (cedulaMadreExample) cedulaMadreExample.style.display = 'block'; // Muestra el mensaje
                    cedulaMadre.placeholder = 'Ej: 001-234567-8910A';
                    cedulaMadre.removeEventListener('input', validateCedulaExtranjeraHandlerMadre);
                    cedulaMadre.addEventListener('input', validateCedulaNicaraguenseHandlerMadre);
                } else {
                    if (cedulaMadreExample) cedulaMadreExample.style.display = 'none';
                    cedulaMadre.placeholder = '';
                    cedulaMadre.removeEventListener('input', validateCedulaExtranjeraHandlerMadre);
                    cedulaMadre.removeEventListener('input', validateCedulaNicaraguenseHandlerMadre);
                    clearErrorMessage(cedulaMadre.id);
                }
                clearErrorMessage(cedulaMadre.id); // Limpia cualquier error anterior al cambiar el tipo
            });
            // Función wrapper para mantener el contexto del evento
            function validateCedulaNicaraguenseHandlerMadre() { validateCedulaNicaraguense(cedulaMadre, 'errorCedulaMadre'); }
            function validateCedulaExtranjeraHandlerMadre() { validateCedulaExtranjera(cedulaMadre, 'errorCedulaMadre'); }
            // Disparar al cargar para establecer el estado inicial
            tipoIdentificacionMadre.dispatchEvent(new Event('change'));
        }

        const tipoIdentificacionPadreTutor = document.getElementById('tipoIdentificacionPadreTutor');
        const cedulaPadreTutor = document.getElementById('cedulaPadreTutor');
        const cedulaPadreTutorExample = document.getElementById('exampleCedulaPadreTutor'); // Asumiendo que tienes un span con este ID para el ejemplo

        if (tipoIdentificacionPadreTutor && cedulaPadreTutor) {
            tipoIdentificacionPadreTutor.addEventListener('change', function() {
                if (this.value === 'Cedula Extranjera') {
                    if (cedulaPadreTutorExample) cedulaPadreTutorExample.style.display = 'none'; // Oculta el mensaje
                    cedulaPadreTutor.placeholder = 'Ingrese cédula extranjera';
                    cedulaPadreTutor.removeEventListener('input', validateCedulaNicaraguenseHandlerPadreTutor);
                    cedulaPadreTutor.addEventListener('input', validateCedulaExtranjeraHandlerPadreTutor);
                } else if (this.value === 'Cedula Nicaraguense') {
                    if (cedulaPadreTutorExample) cedulaPadreTutorExample.style.display = 'block'; // Muestra el mensaje
                    cedulaPadreTutor.placeholder = 'Ej: 001-234567-8910A';
                    cedulaPadreTutor.removeEventListener('input', validateCedulaExtranjeraHandlerPadreTutor);
                    cedulaPadreTutor.addEventListener('input', validateCedulaNicaraguenseHandlerPadreTutor);
                } else {
                    if (cedulaPadreTutorExample) cedulaPadreTutorExample.style.display = 'none';
                    cedulaPadreTutor.placeholder = '';
                    cedulaPadreTutor.removeEventListener('input', validateCedulaExtranjeraHandlerPadreTutor);
                    cedulaPadreTutor.removeEventListener('input', validateCedulaNicaraguenseHandlerPadreTutor);
                    clearErrorMessage(cedulaPadreTutor.id);
                }
                clearErrorMessage(cedulaPadreTutor.id); // Limpia cualquier error anterior al cambiar el tipo
            });
            // Función wrapper para mantener el contexto del evento
            function validateCedulaNicaraguenseHandlerPadreTutor() { validateCedulaNicaraguense(cedulaPadreTutor, 'errorCedulaPadreTutor'); }
            function validateCedulaExtranjeraHandlerPadreTutor() { validateCedulaExtranjera(cedulaPadreTutor, 'errorCedulaPadreTutor'); }
            // Disparar al cargar para establecer el estado inicial
            tipoIdentificacionPadreTutor.dispatchEvent(new Event('change'));
        }

        // CAMPOS OBLIGATORIOS CONDICIONALES PARA MADRE Y PADRE/TUTOR
        const motherFields = [
            document.getElementById('primerNombreMadre'),
            document.getElementById('segundoNombreMadre'),
            document.getElementById('primerApellidoMadre'),
            document.getElementById('segundoApellidoMadre'),
            document.getElementById('ocupacionMadre'),
            document.getElementById('centroTrabajoMadre'),
            document.getElementById('telefonoMadre'),
            document.getElementById('emailMadre'),
            document.getElementById('tipoIdentificacionMadre'),
            document.getElementById('cedulaMadre')
        ].filter(Boolean); // Filtrar elementos nulos si algún ID no existe

        const fatherTutorFields = [
            document.getElementById('parentescoTutor'),
            document.getElementById('primerNombrePadreTutor'),
            document.getElementById('segundoNombrePadreTutor'),
            document.getElementById('primerApellidoPadreTutor'),
            document.getElementById('segundoApellidoPadreTutor'),
            document.getElementById('ocupacionPadreTutor'),
            document.getElementById('centroTrabajoPadreTutor'),
            document.getElementById('telefonoPadreTutor'),
            document.getElementById('emailPadreTutor'),
            document.getElementById('tipoIdentificacionPadreTutor'),
            document.getElementById('cedulaPadreTutor')
        ].filter(Boolean); // Filtrar elementos nulos

        function setupConditionalRequired(fields) {
            let initialValues = fields.map(field => field ? field.value.trim() : '');

            fields.forEach(field => {
                if (field) {
                    field.addEventListener('input', () => {
                        const anyFieldFilled = fields.some(f => f && f.value.trim() !== '' && f.value.trim() !== 'No tiene' && f.value.trim() !== 'N/A');
                        fields.forEach(f => {
                            if (f && f.id !== field.id) { // No modificamos la obligatoriedad del campo que se está editando
                                if (anyFieldFilled) {
                                    // Si algún campo se ha rellenado, haz los demás obligatorios
                                    f.setAttribute('data-conditionally-required', 'true');
                                    if (f.placeholder === '') { // Evita sobreescribir placeholders importantes
                                        f.placeholder = 'Requerido si se rellena la sección';
                                    }
                                    if (f.tagName === 'SELECT' && f.value === '') {
                                        displayErrorMessage(f.id, 'Este campo es obligatorio.');
                                    }
                                } else {
                                    // Si todos los campos están vacíos (o "No tiene"), quita la obligatoriedad condicional
                                    f.removeAttribute('data-conditionally-required');
                                    if (f.placeholder === 'Requerido si se rellena la sección') {
                                        f.placeholder = '';
                                    }
                                    clearErrorMessage(f.id); // Limpia el mensaje si ya no es obligatorio
                                }
                            }
                        });
                    });
                    // También reaccionar a cambios en select
                    if (field.tagName === 'SELECT') {
                         field.addEventListener('change', () => {
                            const anyFieldFilled = fields.some(f => f && f.value.trim() !== '' && f.value.trim() !== 'No tiene' && f.value.trim() !== 'N/A');
                            fields.forEach(f => {
                                if (f && f.id !== field.id) {
                                    if (anyFieldFilled) {
                                        f.setAttribute('data-conditionally-required', 'true');
                                        if (f.placeholder === '') {
                                            f.placeholder = 'Requerido si se rellena la sección';
                                        }
                                        if (f.tagName === 'SELECT' && f.value === '') {
                                            displayErrorMessage(f.id, 'Este campo es obligatorio.');
                                        }
                                    } else {
                                        f.removeAttribute('data-conditionally-required');
                                        if (f.placeholder === 'Requerido si se rellena la sección') {
                                            f.placeholder = '';
                                        }
                                        clearErrorMessage(f.id);
                                    }
                                }
                            });
                        });
                    }

                    // Sugerir "No tiene" si el campo es de texto y se vacía o se enfoca sin valor
                    if (field.type === 'text' || field.type === 'email' || field.type === 'tel') {
                        field.addEventListener('blur', function() {
                            if (this.value.trim() === '' && this.getAttribute('data-conditionally-required') === 'true') {
                                this.value = 'No tiene';
                                clearErrorMessage(this.id);
                            }
                        });
                        field.addEventListener('focus', function() {
                            if (this.value.trim() === 'No tiene' || this.value.trim() === 'N/A') {
                                this.value = '';
                                clearErrorMessage(this.id);
                            }
                        });
                    }
                }
            });
        }

        setupConditionalRequired(motherFields);
        setupConditionalRequired(fatherTutorFields);

        // FILTRADO DE GRADO Y MODALIDAD
        const nivelAcademicoSelect = document.getElementById('nivelAcademico');
        const gradoAcademicoSelect = document.getElementById('gradoAcademico');
        const modalidadEstudioSelect = document.getElementById('modalidadEstudio');

        // Mapeo de grados por nivel académico (ejemplo)
        const gradosPorNivel = {
            'Preescolar': ['Primer Nivel', 'Segundo Nivel', 'Tercer Nivel'],
            'Primaria': ['Primer Grado', 'Segundo Grado', 'Tercer Grado', 'Cuarto Grado', 'Quinto Grado', 'Sexto Grado'],
            'Secundaria': ['Séptimo Grado', 'Octavo Grado', 'Noveno Grado', 'Décimo Grado', 'Undécimo Grado'],
            'Universitario': ['Primer Año', 'Segundo Año', 'Tercer Año', 'Cuarto Año', 'Quinto Año', 'Sexto Año'],
            'Posgrado': ['Maestría', 'Doctorado']
        };

        // Mapeo de modalidades por nivel académico
        const modalidadesPorNivel = {
            'Preescolar': ['Presencial'],
            'Primaria': ['Presencial', 'Sabatino'],
            'Secundaria': ['Presencial', 'Sabatino', 'Nocturno'],
            'Universitario': ['Presencial', 'En línea', 'Fin de semana'],
            'Posgrado': ['En línea', 'Presencial (flexible)']
        };

        function populateSelect(selectElement, optionsArray, defaultOptionText) {
            selectElement.innerHTML = `<option value="">${defaultOptionText}</option>`;
            optionsArray.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option;
                opt.textContent = option;
                selectElement.appendChild(opt);
            });
            clearErrorMessage(selectElement.id); // Limpiar mensaje al poblar
        }

        if (nivelAcademicoSelect && gradoAcademicoSelect && modalidadEstudioSelect) {
            nivelAcademicoSelect.addEventListener('change', function() {
                const selectedNivel = this.value;
                populateSelect(gradoAcademicoSelect, gradosPorNivel[selectedNivel] || [], 'Seleccione Grado');
                populateSelect(modalidadEstudioSelect, modalidadesPorNivel[selectedNivel] || [], 'Seleccione Modalidad');
            });
            // Disparar al cargar para establecer las opciones iniciales
            nivelAcademicoSelect.dispatchEvent(new Event('change'));
        }

        // SINCRONIZACIÓN DE DEPARTAMENTO Y MUNICIPIO
        const departamentoResidenciaEstudiante = document.getElementById('departamentoResidenciaEstudiante');
        const municipioResidenciaEstudiante = document.getElementById('municipioResidenciaEstudiante');
        const departamentoAcademico = document.getElementById('departamentoAcademico');
        const municipioAcademico = document.getElementById('municipioAcademico');

        // Datos de ejemplo para municipios por departamento
        const municipiosPorDepartamento = {
            'Managua': ['Managua', 'Ciudad Sandino', 'Tipitapa', 'San Rafael del Sur', 'Ticuantepe', 'El Crucero', 'Mateare', 'Villa El Carmen'],
            'Masaya': ['Masaya', 'Nindirí', 'Masatepe', 'La Concepción', 'San Juan de Oriente', 'Niquinohomo', 'Catarina', 'Tisma', 'Nandasmo'],
            'Granada': ['Granada', 'Diriá', 'Diriomo', 'Nandaime'],
            'León': ['León', 'Quezalguaque', 'Telica', 'Larreynaga', 'Malpaisillo', 'La Paz Centro', 'Nagarote', 'El Jicaral', 'Santa Rosa del Peñón', 'Achuapa']
            // ... agregar más departamentos y municipios
        };

        if (departamentoResidenciaEstudiante && municipioResidenciaEstudiante && departamentoAcademico && municipioAcademico) {
            departamentoResidenciaEstudiante.addEventListener('change', function() {
                const selectedDepartamento = this.value;
                populateSelect(municipioResidenciaEstudiante, municipiosPorDepartamento[selectedDepartamento] || [], 'Seleccione Municipio');
                // Sincronizar también con el departamento académico
                departamentoAcademico.value = selectedDepartamento;
                // Disparar cambio en departamentoAcademico para actualizar sus municipios
                departamentoAcademico.dispatchEvent(new Event('change'));
            });

            departamentoAcademico.addEventListener('change', function() {
                const selectedDepartamento = this.value;
                populateSelect(municipioAcademico, municipiosPorDepartamento[selectedDepartamento] || [], 'Seleccione Municipio');
            });

            // Disparar al cargar para establecer el estado inicial
            departamentoResidenciaEstudiante.dispatchEvent(new Event('change'));
            departamentoAcademico.dispatchEvent(new Event('change'));
        }

        // --- Manejo de eventos de input para validaciones en tiempo real ---
        // Aquí debes agregar event listeners para cada campo que quieras validar mientras el usuario escribe.
        // Ejemplo:
        const primerNombreEstudiante = document.getElementById('primerNombreEstudiante');
        if (primerNombreEstudiante) {
            primerNombreEstudiante.addEventListener('input', () => validateLettersOnly(primerNombreEstudiante, 'errorPrimerNombreEstudiante', 'Primer Nombre'));
        }
        const segundoNombreEstudiante = document.getElementById('segundoNombreEstudiante');
        if (segundoNombreEstudiante) {
            segundoNombreEstudiante.addEventListener('input', () => validateLettersOnly(segundoNombreEstudiante, 'errorSegundoNombreEstudiante', 'Segundo Nombre'));
        }
        const primerApellidoEstudiante = document.getElementById('primerApellidoEstudiante');
        if (primerApellidoEstudiante) {
            primerApellidoEstudiante.addEventListener('input', () => validateLettersOnly(primerApellidoEstudiante, 'errorPrimerApellidoEstudiante', 'Primer Apellido'));
        }
        const segundoApellidoEstudiante = document.getElementById('segundoApellidoEstudiante');
        if (segundoApellidoEstudiante) {
            segundoApellidoEstudiante.addEventListener('input', () => validateLettersOnly(segundoApellidoEstudiante, 'errorSegundoApellidoEstudiante', 'Segundo Apellido'));
        }
        const telefonoEstudiante = document.getElementById('telefonoEstudiante');
        if (telefonoEstudiante) {
            telefonoEstudiante.addEventListener('input', () => validatePhoneNumber(telefonoEstudiante, 'errorTelefonoEstudiante', 'Teléfono'));
        }
        const pesoEstudiante = document.getElementById('pesoEstudiante');
        if (pesoEstudiante) {
            pesoEstudiante.addEventListener('input', () => validatePositiveNumber(pesoEstudiante, 'errorPesoEstudiante', 'Peso'));
        }
        const tallaEstudiante = document.getElementById('tallaEstudiante');
        if (tallaEstudiante) {
            tallaEstudiante.addEventListener('input', () => validatePositiveNumber(tallaEstudiante, 'errorTallaEstudiante', 'Talla'));
        }
        const cedulaEstudiante = document.getElementById('cedulaEstudiante');
        if (cedulaEstudiante) {
             const tipoIdentificacionEstudiante = document.getElementById('tipoIdentificacionEstudiante');
             if (tipoIdentificacionEstudiante) {
                 tipoIdentificacionEstudiante.addEventListener('change', function() {
                     if (this.value === 'Cedula Nicaraguense') {
                         cedulaEstudiante.removeEventListener('input', validateCedulaExtranjeraHandlerEstudiante);
                         cedulaEstudiante.addEventListener('input', validateCedulaNicaraguenseHandlerEstudiante);
                     } else if (this.value === 'Cedula Extranjera') {
                         cedulaEstudiante.removeEventListener('input', validateCedulaNicaraguenseHandlerEstudiante);
                         cedulaEstudiante.addEventListener('input', validateCedulaExtranjeraHandlerEstudiante);
                     } else {
                         cedulaEstudiante.removeEventListener('input', validateCedulaNicaraguenseHandlerEstudiante);
                         cedulaEstudiante.removeEventListener('input', validateCedulaExtranjeraHandlerEstudiante);
                         clearErrorMessage(cedulaEstudiante.id);
                     }
                     clearErrorMessage(cedulaEstudiante.id); // Limpia cualquier error anterior
                 });
                 // Disparar al cargar
                 tipoIdentificacionEstudiante.dispatchEvent(new Event('change'));
             }
            function validateCedulaNicaraguenseHandlerEstudiante() { validateCedulaNicaraguense(cedulaEstudiante, 'errorCedulaEstudiante'); }
            function validateCedulaExtranjeraHandlerEstudiante() { validateCedulaExtranjera(cedulaEstudiante, 'errorCedulaEstudiante'); }
        }

        // Validación en tiempo real para selects: ocultar mensaje si se selecciona una opción
        document.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', function() {
                if (this.value !== '') {
                    clearErrorMessage(this.id);
                } else {
                    // Si el select vuelve a estar vacío, pero es condicionalmente requerido
                    // o requerido por la validación final, el mensaje aparecerá en el submit
                    // o si la lógica condicional lo fuerza.
                    // Para evitar que se muestre inmediatamente si el usuario solo está navegando,
                    // solo lo mostraremos en el submit, a menos que la lógica condicional de padre/tutor lo exija.
                }
            });
        });

        // Event listener para el botón de limpiar
        const clearButton = document.getElementById('clearFormButton');
        if (clearButton) {
            clearButton.addEventListener('click', clearForm);
        }

        // --- VALIDACIÓN GENERAL DEL FORMULARIO AL ENVIAR ---
        matriculaForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Evita el envío por defecto del formulario

            let isValid = true;
            // Limpiar todos los mensajes de error antes de revalidar
            document.querySelectorAll('.error-message').forEach(msg => {
                msg.textContent = '';
                msg.style.display = 'none';
            });
            document.querySelectorAll('.is-invalid').forEach(field => {
                field.classList.remove('is-invalid');
            });

            // Campos de texto y numéricos
            // Estudiante
            if (!validateLettersOnly(primerNombreEstudiante, 'errorPrimerNombreEstudiante', 'Primer Nombre') && primerNombreEstudiante.value.trim() === '') isValid = false;
            else if (primerNombreEstudiante.value.trim() === '') { displayErrorMessage('primerNombreEstudiante', 'El primer nombre del estudiante es obligatorio.'); isValid = false; }
            if (segundoNombreEstudiante.value.trim() !== '' && !validateLettersOnly(segundoNombreEstudiante, 'errorSegundoNombreEstudiante', 'Segundo Nombre')) isValid = false;
            if (!validateLettersOnly(primerApellidoEstudiante, 'errorPrimerApellidoEstudiante', 'Primer Apellido') && primerApellidoEstudiante.value.trim() === '') isValid = false;
            else if (primerApellidoEstudiante.value.trim() === '') { displayErrorMessage('primerApellidoEstudiante', 'El primer apellido del estudiante es obligatorio.'); isValid = false; }
            if (segundoApellidoEstudiante.value.trim() !== '' && !validateLettersOnly(segundoApellidoEstudiante, 'errorSegundoApellidoEstudiante', 'Segundo Apellido')) isValid = false;

            // Fecha de Nacimiento
            const fechaNacimientoEstudiante = document.getElementById('fechaNacimientoEstudiante');
            if (fechaNacimientoEstudiante && fechaNacimientoEstudiante.value.trim() === '') {
                displayErrorMessage('fechaNacimientoEstudiante', 'La fecha de nacimiento es obligatoria.');
                isValid = false;
            } else {
                clearErrorMessage('fechaNacimientoEstudiante');
            }

            // Nacionalidad y País de Nacimiento
            if (nacionalidadEstudiante && nacionalidadEstudiante.value === '') {
                displayErrorMessage('nacionalidadEstudiante', 'La nacionalidad es obligatoria.');
                isValid = false;
            } else {
                clearErrorMessage('nacionalidadEstudiante');
                // Validar país de nacimiento solo si nacionalidad es Extranjero
                if (nacionalidadEstudiante.value === 'Extranjero' && !validateLettersOnly(paisNacimientoEstudiante, 'errorPaisNacimientoEstudiante', 'País de Nacimiento')) {
                    isValid = false;
                } else if (nacionalidadEstudiante.value === 'Extranjero' && paisNacimientoEstudiante.value.trim() === '') {
                    displayErrorMessage('paisNacimientoEstudiante', 'El país de nacimiento es obligatorio para extranjeros.');
                    isValid = false;
                }
            }


            // Cédula Estudiante (condicional)
            const tipoIdentificacionEstudiante = document.getElementById('tipoIdentificacionEstudiante');
            if (tipoIdentificacionEstudiante && tipoIdentificacionEstudiante.value === '') {
                displayErrorMessage('tipoIdentificacionEstudiante', 'El tipo de identificación es obligatorio.');
                isValid = false;
            } else if (tipoIdentificacionEstudiante.value === 'Cedula Nicaraguense') {
                if (!validateCedulaNicaraguense(cedulaEstudiante, 'errorCedulaEstudiante') || cedulaEstudiante.value.trim() === '') {
                    displayErrorMessage('cedulaEstudiante', 'La cédula nicaragüense es obligatoria y debe seguir el formato 000-000000-0000A.');
                    isValid = false;
                }
            } else if (tipoIdentificacionEstudiante.value === 'Cedula Extranjera') {
                if (!validateCedulaExtranjera(cedulaEstudiante, 'errorCedulaEstudiante') || cedulaEstudiante.value.trim() === '') {
                    displayErrorMessage('cedulaEstudiante', 'La cédula extranjera es obligatoria y debe ser alfanumérica (mínimo 5 caracteres).');
                    isValid = false;
                }
            } else {
                clearErrorMessage('tipoIdentificacionEstudiante');
                clearErrorMessage('cedulaEstudiante');
            }

            if (telefonoEstudiante.value.trim() !== '' && !validatePhoneNumber(telefonoEstudiante, 'errorTelefonoEstudiante', 'Teléfono')) isValid = false;
            if (pesoEstudiante.value.trim() !== '' && !validatePositiveNumber(pesoEstudiante, 'errorPesoEstudiante', 'Peso')) isValid = false;
            if (tallaEstudiante.value.trim() !== '' && !validatePositiveNumber(tallaEstudiante, 'errorTallaEstudiante', 'Talla')) isValid = false;

            // Departamento y Municipio de Residencia Estudiante
            if (departamentoResidenciaEstudiante && departamentoResidenciaEstudiante.value === '') {
                displayErrorMessage('departamentoResidenciaEstudiante', 'El departamento de residencia es obligatorio.');
                isValid = false;
            } else {
                clearErrorMessage('departamentoResidenciaEstudiante');
            }
            if (municipioResidenciaEstudiante && municipioResidenciaEstudiante.value === '') {
                displayErrorMessage('municipioResidenciaEstudiante', 'El municipio de residencia es obligatorio.');
                isValid = false;
            } else {
                clearErrorMessage('municipioResidenciaEstudiante');
            }

            // Nivel, Grado, Modalidad
            if (nivelAcademicoSelect && nivelAcademicoSelect.value === '') {
                displayErrorMessage('nivelAcademico', 'El nivel académico es obligatorio.');
                isValid = false;
            } else {
                clearErrorMessage('nivelAcademico');
            }
            if (gradoAcademicoSelect && gradoAcademicoSelect.value === '') {
                displayErrorMessage('gradoAcademico', 'El grado académico es obligatorio.');
                isValid = false;
            } else {
                clearErrorMessage('gradoAcademico');
            }
            if (modalidadEstudioSelect && modalidadEstudioSelect.value === '') {
                displayErrorMessage('modalidadEstudio', 'La modalidad de estudio es obligatoria.');
                isValid = false;
            } else {
                clearErrorMessage('modalidadEstudio');
            }
            // Departamento y Municipio Académico
            if (departamentoAcademico && departamentoAcademico.value === '') {
                displayErrorMessage('departamentoAcademico', 'El departamento académico es obligatorio.');
                isValid = false;
            } else {
                clearErrorMessage('departamentoAcademico');
            }
            if (municipioAcademico && municipioAcademico.value === '') {
                displayErrorMessage('municipioAcademico', 'El municipio académico es obligatorio.');
                isValid = false;
            } else {
                clearErrorMessage('municipioAcademico');
            }

            // Validación de campos condicionales de Madre
            const anyMotherFieldFilled = motherFields.some(f => f && f.value.trim() !== '' && f.value.trim() !== 'No tiene' && f.value.trim() !== 'N/A');
            if (anyMotherFieldFilled) {
                motherFields.forEach(field => {
                    if (field) {
                        if (field.value.trim() === '' || field.value.trim() === 'No tiene' || field.value.trim() === 'N/A') {
                            if (field.type === 'text' || field.type === 'tel' || field.type === 'email') {
                                field.value = 'No tiene'; // Auto-fill 'No tiene' if empty when others are filled
                                clearErrorMessage(field.id);
                            } else if (field.tagName === 'SELECT') {
                                displayErrorMessage(field.id, 'Este campo es obligatorio si se está llenando la sección de la Madre.');
                                isValid = false;
                            } else {
                                displayErrorMessage(field.id, 'Este campo es obligatorio si se está llenando la sección de la Madre.');
                                isValid = false;
                            }
                        } else {
                            clearErrorMessage(field.id); // Clear error if filled
                            // Validaciones específicas para la madre
                            if (field.id === 'telefonoMadre' && !validatePhoneNumber(field, 'errorTelefonoMadre', 'Teléfono de la Madre')) isValid = false;
                            if (field.id === 'emailMadre' && !validateEmail(field, 'errorEmailMadre')) isValid = false;
                            if (field.id === 'primerNombreMadre' && !validateLettersOnly(field, 'errorPrimerNombreMadre', 'Primer Nombre de la Madre')) isValid = false;
                            if (field.id === 'segundoNombreMadre' && !validateLettersOnly(field, 'errorSegundoNombreMadre', 'Segundo Nombre de la Madre') && field.value.trim() !== 'No tiene') isValid = false;
                            if (field.id === 'primerApellidoMadre' && !validateLettersOnly(field, 'errorPrimerApellidoMadre', 'Primer Apellido de la Madre')) isValid = false;
                            if (field.id === 'segundoApellidoMadre' && !validateLettersOnly(field, 'errorSegundoApellidoMadre', 'Segundo Apellido de la Madre') && field.value.trim() !== 'No tiene') isValid = false;
                            if (field.id === 'cedulaMadre') {
                                if (tipoIdentificacionMadre && tipoIdentificacionMadre.value === 'Cedula Nicaraguense') {
                                    if (!validateCedulaNicaraguense(field, 'errorCedulaMadre')) isValid = false;
                                } else if (tipoIdentificacionMadre && tipoIdentificacionMadre.value === 'Cedula Extranjera') {
                                    if (!validateCedulaExtranjera(field, 'errorCedulaMadre')) isValid = false;
                                }
                            }
                        }
                    }
                });
            }


            // Validación de campos condicionales de Padre/Tutor
            const anyFatherTutorFieldFilled = fatherTutorFields.some(f => f && f.value.trim() !== '' && f.value.trim() !== 'No tiene' && f.value.trim() !== 'N/A');
            if (anyFatherTutorFieldFilled) {
                fatherTutorFields.forEach(field => {
                    if (field) {
                        if (field.value.trim() === '' || field.value.trim() === 'No tiene' || field.value.trim() === 'N/A') {
                            if (field.type === 'text' || field.type === 'tel' || field.type === 'email') {
                                field.value = 'No tiene'; // Auto-fill 'No tiene' if empty when others are filled
                                clearErrorMessage(field.id);
                            } else if (field.tagName === 'SELECT') {
                                displayErrorMessage(field.id, 'Este campo es obligatorio si se está llenando la sección del Padre/Tutor.');
                                isValid = false;
                            } else {
                                displayErrorMessage(field.id, 'Este campo es obligatorio si se está llenando la sección del Padre/Tutor.');
                                isValid = false;
                            }
                        } else {
                            clearErrorMessage(field.id); // Clear error if filled
                            // Validaciones específicas para el padre/tutor
                            if (field.id === 'telefonoPadreTutor' && !validatePhoneNumber(field, 'errorTelefonoPadreTutor', 'Teléfono del Padre/Tutor')) isValid = false;
                            if (field.id === 'emailPadreTutor' && !validateEmail(field, 'errorEmailPadreTutor')) isValid = false;
                            if (field.id === 'primerNombrePadreTutor' && !validateLettersOnly(field, 'errorPrimerNombrePadreTutor', 'Primer Nombre del Padre/Tutor')) isValid = false;
                            if (field.id === 'segundoNombrePadreTutor' && !validateLettersOnly(field, 'errorSegundoNombrePadreTutor', 'Segundo Nombre del Padre/Tutor') && field.value.trim() !== 'No tiene') isValid = false;
                            if (field.id === 'primerApellidoPadreTutor' && !validateLettersOnly(field, 'errorPrimerApellidoPadreTutor', 'Primer Apellido del Padre/Tutor')) isValid = false;
                            if (field.id === 'segundoApellidoPadreTutor' && !validateLettersOnly(field, 'errorSegundoApellidoPadreTutor', 'Segundo Apellido del Padre/Tutor') && field.value.trim() !== 'No tiene') isValid = false;
                            if (field.id === 'cedulaPadreTutor') {
                                if (tipoIdentificacionPadreTutor && tipoIdentificacionPadreTutor.value === 'Cedula Nicaraguense') {
                                    if (!validateCedulaNicaraguense(field, 'errorCedulaPadreTutor')) isValid = false;
                                } else if (tipoIdentificacionPadreTutor && tipoIdentificacionPadreTutor.value === 'Cedula Extranjera') {
                                    if (!validateCedulaExtranjera(field, 'errorCedulaPadreTutor')) isValid = false;
                                }
                            }
                        }
                    }
                });
            }

            if (!isValid) {
                console.log(' ❌ Hay errores en el formulario. Por favor, corríjalos.');
                // Desplazarse al primer campo con error
                const firstInvalidField = document.querySelector('.is-invalid');
                if (firstInvalidField) {
                    firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return; // Detiene el envío del formulario si hay errores
            }

            // Si todas las validaciones pasan, recopila los datos del formulario
            const formData = new FormData(matriculaForm);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }

            console.log('✅ Todos los datos son válidos. Enviando datos...');
            console.log(data); // Para depuración

            // Deshabilitar el botón de envío y mostrar un spinner (si tienes uno)
            const submitButton = document.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Enviando...'; // O cambia a un spinner
            }
            const loadingSpinner = document.getElementById('loadingSpinner'); // Asume un elemento spinner
            if (loadingSpinner) {
                loadingSpinner.style.display = 'block';
            }

            try {
                const response = await fetch('https://corporate-marketa-odvin123-2e265ec9.koyeb.app/api/academic', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                }

                const result = await response.json();
                console.log(' ✅  Todos los datos han sido guardados exitosamente.');
                console.log('Respuesta del servidor:', result);

                // Mostrar alerta flotante de éxito
                const alertDiv = document.createElement('div');
                alertDiv.className = 'alert-float';
                alertDiv.innerHTML = '<span class="emoji"> 🎉 </span> <span>¡Matrícula Exitosa!</span>';
                document.body.appendChild(alertDiv);
                // Forzar reflow para que la transición funcione
                void alertDiv.offsetWidth;
                alertDiv.classList.add('success-visible');

                // Ocultar la alerta después de unos segundos
                setTimeout(() => {
                    alertDiv.classList.remove('success-visible');
                    // Eliminar la alerta del DOM después de la transición
                    alertDiv.addEventListener('transitionend', () => alertDiv.remove());
                }, 3000); // Muestra por 3 segundos

                // Opcional: Limpiar el formulario después de un envío exitoso
                clearForm();

            } catch (error) {
                console.error(' ❌ Error al enviar el formulario:', error);
                alert('Hubo un error al procesar la matrícula. Por favor, inténtelo de nuevo.');
                // Aquí podrías mostrar un mensaje de error al usuario en la UI
            } finally {
                // Re-habilitar el botón de envío y ocultar el spinner
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Matricular';
                }
                if (loadingSpinner) {
                    loadingSpinner.style.display = 'none';
                }
            }
        });
    } else {
        console.error('El formulario con ID "matriculaForm" no fue encontrado.');
    }
});