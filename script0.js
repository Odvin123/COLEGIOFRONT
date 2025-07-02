document.addEventListener('DOMContentLoaded', function() {
    const matriculaForm = document.getElementById('matriculaForm');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const formSuccessMessage = document.getElementById('formSuccessMessage');
    const formErrorMessage = document.getElementById('formErrorMessage');
    const errorMessageParent = document.getElementById('error-message'); // Mensaje "Debe completar al menos..."

    // Asignar la fecha actual al campo de fecha de matrícula
    const fechaMatriculaInput = document.getElementById('fechaMatricula');
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months start at 0!
    const dd = String(today.getDate()).padStart(2, '0');
    fechaMatriculaInput.value = `${yyyy}-${mm}-${dd}`;

    // Obtener los IDs de los nuevos selects de territorio indígena
    const territorioIndigenaEstudianteSelect = document.getElementById('territorioIndigenaEstudiante');
    const habitaIndigenaEstudianteSelect = document.getElementById('habitaIndigenaEstudiante');

    // Obtener los campos de peso y talla
    const pesoInput = document.getElementById('peso');
    const tallaInput = document.getElementById('talla');

    // Referencias a los selects e inputs de cédula de padres/tutor
    const tipoIdentificacionMadre = document.getElementById('tipoIdentificacionMadre');
    const cedulaMadreInput = document.getElementById('cedulaMadre');
    const tipoIdentificacionPadre = document.getElementById('tipoIdentificacionPadre');
    const cedulaPadreInput = document.getElementById('cedulaPadre');
    const tipoIdentificacionTutor = document.getElementById('tipoIdentificacionTutor');
    const cedulaTutorInput = document.getElementById('cedulaTutor');

    // Función para mostrar mensajes de alerta
    function showAlert(message, type, duration = 5000) {
        formSuccessMessage.style.display = 'none';
        formErrorMessage.style.display = 'none';

        if (type === 'success') {
            formSuccessMessage.textContent = message;
            formSuccessMessage.style.display = 'block';
        } else {
            formErrorMessage.textContent = message;
            formErrorMessage.style.display = 'block';
        }

        setTimeout(() => {
            formSuccessMessage.style.display = 'none';
            formErrorMessage.style.display = 'none';
        }, duration);
    }

    // Función para mostrar/ocultar indicador de carga
    function showLoading(show) {
        loadingIndicator.style.display = show ? 'block' : 'none';
    }

    // ----------------------------------------------------
    // VALIDACIÓN DE PESO Y TALLA (Bloquear 0 y negativos)
    // ----------------------------------------------------
    function validateMinNumber(inputElement, errorMessageSpanId, minVal, msg) {
        const errorSpan = document.getElementById(errorMessageSpanId);
        if (inputElement.value === '') {
            inputElement.classList.remove('is-invalid');
            inputElement.classList.remove('is-valid');
            errorSpan.textContent = '';
            inputElement.setCustomValidity(''); // Limpiar si está vacío
            return true; // Permitir que el campo vacío sea manejado por el 'required' si lo tiene
        }

        const value = parseFloat(inputElement.value);
        if (isNaN(value) || value < minVal) {
            inputElement.classList.add('is-invalid');
            inputElement.classList.remove('is-valid');
            errorSpan.textContent = msg;
            inputElement.setCustomValidity(msg);
            return false;
        } else {
            inputElement.classList.remove('is-invalid');
            inputElement.classList.add('is-valid');
            errorSpan.textContent = '';
            inputElement.setCustomValidity('');
            return true;
        }
    }

    pesoInput.addEventListener('input', () => validateMinNumber(pesoInput, 'error-peso', 0.01, 'El peso debe ser mayor que 0.'));
    tallaInput.addEventListener('input', () => validateMinNumber(tallaInput, 'error-talla', 0.01, 'La talla debe ser mayor que 0.'));


    // ----------------------------------------------------
    // LÓGICA DE VALIDACIÓN DE CÉDULA DE PADRES/TUTOR
    // ----------------------------------------------------

    // Expresión regular para cédula nicaragüense (DDD-DDMMYY-DDDDX)
    const REGEX_CEDULA_NICA = /^\d{3}-\d{6}-\d{4}[A-Za-z]$/;

    function validateCedulaNicaraguense(cedula) {
        return REGEX_CEDULA_NICA.test(cedula);
    }

    // Función para configurar la lógica de validación de un campo de cédula
    function setupCedulaValidation(typeSelect, cedulaInput, errorSpan) {
        const updateCedulaField = () => {
            const selectedType = typeSelect.value;
            cedulaInput.value = ''; // Limpiar el valor al cambiar el tipo
            cedulaInput.classList.remove('is-invalid', 'is-valid');
            errorSpan.textContent = '';

            if (selectedType === 'Cedula Nicaraguense') {
                cedulaInput.disabled = false;
                cedulaInput.placeholder = "Ejemplo: 001-234567-8910A";
                cedulaInput.setAttribute('maxlength', '16');
                cedulaInput.setAttribute('required', 'true'); // Hacer requerido si es cédula nica
                // Eliminar cualquier patrón previo para dejar la validación a JS
                cedulaInput.removeAttribute('pattern');

                // Añadir validación en tiempo real para cédula nicaragüense
                cedulaInput.oninput = () => {
                    const value = cedulaInput.value.trim();
                    if (value === '') {
                        cedulaInput.classList.remove('is-invalid', 'is-valid');
                        errorSpan.textContent = 'Este campo es requerido.';
                        cedulaInput.setCustomValidity('Este campo es requerido.');
                    } else if (!validateCedulaNicaraguense(value)) {
                        cedulaInput.classList.add('is-invalid');
                        cedulaInput.classList.remove('is-valid');
                        errorSpan.textContent = 'Formato de cédula nicaragüense inválido (ej: 001-010100-0000A).';
                        cedulaInput.setCustomValidity('Formato de cédula nicaragüense inválido.');
                    } else {
                        cedulaInput.classList.remove('is-invalid');
                        cedulaInput.classList.add('is-valid');
                        errorSpan.textContent = '';
                        cedulaInput.setCustomValidity('');
                    }
                };
            } else if (selectedType === 'Cedula Extranjera') {
                cedulaInput.disabled = false;
                cedulaInput.placeholder = "Número de Identificación Extranjera";
                cedulaInput.removeAttribute('maxlength'); // Permitir longitud variable
                cedulaInput.setAttribute('required', 'true'); // También requerida si es extranjera
                cedulaInput.removeAttribute('pattern');
                cedulaInput.oninput = () => { // Solo requerida, sin formato específico
                    const value = cedulaInput.value.trim();
                    if (value === '') {
                        cedulaInput.classList.remove('is-invalid', 'is-valid');
                        errorSpan.textContent = 'Este campo es requerido.';
                        cedulaInput.setCustomValidity('Este campo es requerido.');
                    } else {
                        cedulaInput.classList.remove('is-invalid');
                        cedulaInput.classList.add('is-valid');
                        errorSpan.textContent = '';
                        cedulaInput.setCustomValidity('');
                    }
                };
            } else { // "No Aplica" o "Seleccione" (vacío)
                cedulaInput.disabled = true;
                cedulaInput.value = '';
                cedulaInput.placeholder = "No aplica";
                cedulaInput.removeAttribute('maxlength');
                cedulaInput.removeAttribute('required'); // No requerido
                cedulaInput.removeAttribute('pattern');
                cedulaInput.oninput = null; // Remover el evento oninput
                cedulaInput.setCustomValidity(''); // Limpiar cualquier validación
            }
        };

        typeSelect.addEventListener('change', updateCedulaField);
        // Inicializar el estado al cargar la página
        updateCedulaField();
    }

    // Aplicar la lógica a cada tipo de identificación y campo de cédula
    setupCedulaValidation(tipoIdentificacionMadre, cedulaMadreInput, document.getElementById('error-cedulaMadre'));
    setupCedulaValidation(tipoIdentificacionPadre, cedulaPadreInput, document.getElementById('error-cedulaPadre'));
    setupCedulaValidation(tipoIdentificacionTutor, cedulaTutorInput, document.getElementById('error-cedulaTutor'));

    // ----------------------------------------------------
    // VALIDACIÓN DE AL MENOS UN CONTACTO DE PADRE/TUTOR
    // ----------------------------------------------------
    function validateParentOrTutorContact() {
        const madreDataFilled = (
            document.getElementById('primerNombreMadre').value.trim() !== '' ||
            document.getElementById('segundoNombreMadre').value.trim() !== '' ||
            document.getElementById('primerApellidoMadre').value.trim() !== '' ||
            document.getElementById('segundoApellidoMadre').value.trim() !== '' ||
            tipoIdentificacionMadre.value !== '' || // Considerar tipo de identificación como parte del llenado
            cedulaMadreInput.value.trim() !== '' ||
            document.getElementById('telefonoMadre').value.trim() !== ''
        );

        const padreDataFilled = (
            document.getElementById('primerNombrePadre').value.trim() !== '' ||
            document.getElementById('segundoNombrePadre').value.trim() !== '' ||
            document.getElementById('primerApellidoPadre').value.trim() !== '' ||
            document.getElementById('segundoApellidoPadre').value.trim() !== '' ||
            tipoIdentificacionPadre.value !== '' ||
            cedulaPadreInput.value.trim() !== '' ||
            document.getElementById('telefonoPadre').value.trim() !== ''
        );

        const tutorDataFilled = (
            document.getElementById('primerNombreTutor').value.trim() !== '' ||
            document.getElementById('segundoNombreTutor').value.trim() !== '' ||
            document.getElementById('primerApellidoTutor').value.trim() !== '' ||
            document.getElementById('segundoApellidoTutor').value.trim() !== '' ||
            tipoIdentificacionTutor.value !== '' ||
            cedulaTutorInput.value.trim() !== '' ||
            document.getElementById('telefonoTutor').value.trim() !== ''
        );

        if (!madreDataFilled && !padreDataFilled && !tutorDataFilled) {
            errorMessageParent.style.display = 'block';
            return false;
        } else {
            errorMessageParent.style.display = 'none';
            return true;
        }
    }

    // Añadir listeners para que el mensaje se oculte/muestre al interactuar
    [
        'primerNombreMadre', 'segundoNombreMadre', 'primerApellidoMadre', 'segundoApellidoMadre',
        'telefonoMadre', 'primerNombrePadre', 'segundoNombrePadre', 'primerApellidoPadre',
        'segundoApellidoPadre', 'telefonoPadre', 'primerNombreTutor', 'segundoNombreTutor',
        'primerApellidoTutor', 'segundoApellidoTutor', 'telefonoTutor'
    ].forEach(id => {
        document.getElementById(id).addEventListener('input', validateParentOrTutorContact);
    });

    tipoIdentificacionMadre.addEventListener('change', validateParentOrTutorContact);
    tipoIdentificacionPadre.addEventListener('change', validateParentOrTutorContact);
    tipoIdentificacionTutor.addEventListener('change', validateParentOrTutorContact);
    cedulaMadreInput.addEventListener('input', validateParentOrTutorContact);
    cedulaPadreInput.addEventListener('input', validateParentOrTutorContact);
    cedulaTutorInput.addEventListener('input', validateParentOrTutorContact);

    // ----------------------------------------------------
    // MANEJO DEL SUBMIT DEL FORMULARIO
    // ----------------------------------------------------
    matriculaForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Evitar el envío por defecto del formulario
        showLoading(true);
        formSuccessMessage.style.display = 'none';
        formErrorMessage.style.display = 'none';

        // Realizar todas las validaciones antes de enviar
        let formIsValid = true;

        // Validar campos requeridos y mostrar mensajes de error de Bootstrap (si usas Bootstrap)
        // O usar tu propio sistema de errores con las clases is-invalid/is-valid
        const requiredInputs = matriculaForm.querySelectorAll('[required]');
        requiredInputs.forEach(input => {
            const errorSpan = document.getElementById(`error-${input.id}`);
            if (input.type === 'radio' || input.type === 'checkbox') {
                const radioGroup = document.getElementsByName(input.name);
                let checked = false;
                radioGroup.forEach(radio => {
                    if (radio.checked) checked = true;
                });
                if (!checked) {
                    formIsValid = false;
                    // Aquí podrías añadir una clase o mensaje al div padre de los radios
                    if (errorSpan) errorSpan.textContent = 'Este campo es requerido.';
                } else {
                    if (errorSpan) errorSpan.textContent = '';
                }
            } else if (!input.value.trim()) {
                formIsValid = false;
                input.classList.add('is-invalid');
                input.classList.remove('is-valid');
                if (errorSpan) errorSpan.textContent = 'Este campo es requerido.';
            } else {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
                if (errorSpan) errorSpan.textContent = '';
            }
        });

        // Validaciones específicas de Peso y Talla
        if (!validateMinNumber(pesoInput, 'error-peso', 0.01, 'El peso debe ser mayor que 0.')) {
            formIsValid = false;
        }
        if (!validateMinNumber(tallaInput, 'error-talla', 0.01, 'La talla debe ser mayor que 0.')) {
            formIsValid = false;
        }

        // Validaciones de cédula (se ejecutan al cambiar el select, pero también aquí para el submit)
        // Forzar la validación de los campos de cédula
        const cedulaInputs = [cedulaMadreInput, cedulaPadreInput, cedulaTutorInput];
        cedulaInputs.forEach(input => {
            if (!input.disabled) { // Solo validar si el campo no está deshabilitado
                const event = new Event('input'); // Crear un evento de input
                input.dispatchEvent(event); // Dispararlo para que se ejecute la lógica de validación
                if (input.classList.contains('is-invalid')) {
                    formIsValid = false;
                }
            }
        });

        // Validar que al menos un conjunto de datos de padre/tutor esté completo
        if (!validateParentOrTutorContact()) {
            formIsValid = false;
        }

        // Si alguna validación falla, detener el proceso
        if (!formIsValid) {
            showLoading(false);
            showAlert('Por favor, corrige los errores en el formulario.', 'error');
            return;
        }
        
        // Recopilar datos del formulario
        const formData = new FormData(matriculaForm);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Procesar datos del estudiante
        const studentData = {
            primerNombre: data.primerNombre,
            segundoNombre: data.segundoNombre,
            primerApellido: data.primerApellido,
            segundoApellido: data.segundoApellido,
            telefono: data.telefono,
            direccion: data.direccion,
            fechaNacimiento: data.fechaNacimiento,
            genero: data.genero,
            peso: parseFloat(data.peso),
            talla: parseFloat(data.talla),
            nacionalidad: data.nacionalidad,
            paisNacimiento: data.paisNacimiento,
            residenciaDepartamento: data.residenciaDepartamento,
            residenciaMunicipio: data.residenciaMunicipio,
            lenguaMaterna: data.lenguaMaterna,
            discapacidad: data.discapacidad,
            territorioIndigena: data.territorioIndigenaEstudiante, // Nuevo ID
            habitaIndigena: data.habitaIndigenaEstudiante // Nuevo ID
        };

        // Procesar datos de los padres/tutor
        const parentData = {
            primerNombreMadre: data.primerNombreMadre || null,
            segundoNombreMadre: data.segundoNombreMadre || null,
            primerApellidoMadre: data.primerApellidoMadre || null,
            segundoApellidoMadre: data.segundoApellidoMadre || null,
            tipoIdentificacionMadre: data.tipoIdentificacionMadre || null,
            cedulaMadre: cedulaMadreInput.disabled ? null : data.cedulaMadre || null,
            telefonoMadre: data.telefonoMadre || null,

            primerNombrePadre: data.primerNombrePadre || null,
            segundoNombrePadre: data.segundoNombrePadre || null,
            primerApellidoPadre: data.primerApellidoPadre || null,
            segundoApellidoPadre: data.segundoApellidoPadre || null,
            tipoIdentificacionPadre: data.tipoIdentificacionPadre || null,
            cedulaPadre: cedulaPadreInput.disabled ? null : data.cedulaPadre || null,
            telefonoPadre: data.telefonoPadre || null,

            primerNombreTutor: data.primerNombreTutor || null,
            segundoNombreTutor: data.segundoNombreTutor || null,
            primerApellidoTutor: data.primerApellidoTutor || null,
            segundoApellidoTutor: data.segundoApellidoTutor || null,
            tipoIdentificacionTutor: data.tipoIdentificacionTutor || null,
            cedulaTutor: cedulaTutorInput.disabled ? null : data.cedulaTutor || null,
            telefonoTutor: data.telefonoTutor || null
        };

        // Procesar datos académicos
        const academicData = {
            fechaMatricula: data.fechaMatricula,
            departamento: data.departamentoacad, // Asegúrate que el backend espera 'departamento'
            municipio: data.municipioAcad, // Asegúrate que el backend espera 'municipio'
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

        try {
            const response = await fetch(`${window.BACKEND_API_URL}/api/registros`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    estudiante: studentData,
                    padres: parentData,
                    academico: academicData
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al enviar el formulario.');
            }

            const result = await response.json();
            showAlert('Matrícula registrada con éxito!', 'success');
            console.log('Success:', result);
            matriculaForm.reset(); // Limpiar el formulario
            // Volver a inicializar los campos de cédula y fecha después del reset
            fechaMatriculaInput.value = `${yyyy}-${mm}-${dd}`;
            setupCedulaValidation(tipoIdentificacionMadre, cedulaMadreInput, document.getElementById('error-cedulaMadre'));
            setupCedulaValidation(tipoIdentificacionPadre, cedulaPadreInput, document.getElementById('error-cedulaPadre'));
            setupCedulaValidation(tipoIdentificacionTutor, cedulaTutorInput, document.getElementById('error-cedulaTutor'));


        } catch (error) {
            console.error('Error:', error);
            showAlert(`Error al registrar la matrícula: ${error.message}`, 'error');
        } finally {
            showLoading(false);
        }
    });
});