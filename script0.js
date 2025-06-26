document.addEventListener('DOMContentLoaded', function() {
    const matriculaForm = document.getElementById('matriculaForm');
    if (matriculaForm) {
        // Función para mostrar mensajes de error debajo de los campos
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

        // Función para limpiar mensajes de error
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

        // Función para aplicar validación de solo letras
        function applyLettersOnlyValidation(inputElement, fieldName) {
            if (inputElement) {
                inputElement.addEventListener('input', function(event) {
                    const inputValue = event.target.value;
                    const sanitizedValue = inputValue.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
                    event.target.value = sanitizedValue;
                    if (inputValue !== sanitizedValue) {
                        showError(this, `Solo se permiten letras y espacios para ${fieldName}. Ejemplo: ABCD`);
                    } else {
                        clearError(this);
                    }
                });

                inputElement.addEventListener('blur', function() {
                    if (this.value.trim() === '') {
                        clearError(this);
                    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(this.value)) {
                        showError(this, `Solo se permiten letras y espacios para ${fieldName}. Ejemplo: ABCD`);
                    } else {
                        clearError(this);
                        this.classList.add('is-valid');
                    }
                });
            }
        }

        // Función para aplicar validación de teléfono (solo números y longitud exacta)
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

        // Función para aplicar validación y formato de cédula nicaragüense
        function applyCedulaValidation(inputElement) {
            if (inputElement) {
                inputElement.addEventListener('input', function() {
                    let value = this.value.toUpperCase().replace(/[^0-9A-Z]/g, '');
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
                    this.value = formattedValue;

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

        // Función para aplicar validación de números flotantes (peso/talla)
        function applyFloatValidation(inputElement, fieldName) {
            if (inputElement) {
                inputElement.addEventListener('input', function() {
                    const inputValue = this.value;
                    const sanitizedValue = inputValue.replace(/[^0-9.]/g, '');
                    this.value = sanitizedValue;

                    if (inputValue !== sanitizedValue) {
                        showError(this, `Solo se permiten números y decimales para ${fieldName}. Ejemplo: 60.5`);
                    } else if (sanitizedValue.split('.').length > 2) {
                        showError(this, `Formato incorrecto para ${fieldName}. Solo un punto decimal permitido. Ejemplo: 60.5`);
                    } else {
                        clearError(this);
                    }
                });

                inputElement.addEventListener('blur', function() {
                    if (this.value.trim() === '') {
                        clearError(this);
                    } else if (isNaN(parseFloat(this.value)) || !/^\d+(\.\d+)?$/.test(this.value)) {
                        showError(this, `Formato incorrecto para ${fieldName}. Solo se permiten números y decimales. Ejemplo: 60.5`);
                    } else {
                        clearError(this);
                        this.classList.add('is-valid');
                    }
                });
            }
        }

        // --- FUNCIÓN PRINCIPAL para manejar el filtrado de grados/niveles (CORREGIDA) ---
        function setupGradeFiltering() {
            const nivelEducativoSelect = document.getElementById('nivelEducativo');
            const gradoSelect = document.getElementById('grado');

            if (nivelEducativoSelect && gradoSelect) {
                // Guarda todas las opciones originales del select de grado.
                // Es importante hacer esto UNA SOLA VEZ al inicio.
                const initialOptions = Array.from(gradoSelect.options);

                const filterGrades = () => {
                    const selectedNivel = nivelEducativoSelect.value;
                    gradoSelect.innerHTML = ''; // Limpia las opciones actuales del select de grado

                    // Siempre añade la opción "Seleccione..." al principio
                    const defaultOption = document.createElement('option');
                    defaultOption.value = '';
                    defaultOption.textContent = 'Seleccione una opción'; // Cambiado para mayor claridad
                    gradoSelect.appendChild(defaultOption);

                    let filteredOptions = [];

                    // Los valores en las condiciones 'if' deben coincidir EXACTAMENTE con los 'value' de tu HTML.
                    // Los textos en 'includes' deben coincidir EXACTAMENTE con los textContent de tus opciones de grado en HTML.
                    if (selectedNivel === 'Educación Inicial') {
                        filteredOptions = initialOptions.filter(option =>
                            ['Primer Nivel', 'Segundo Nivel', 'Tercer Nivel'].includes(option.textContent)
                        );
                    } else if (selectedNivel === 'Educación Primaria') {
                        filteredOptions = initialOptions.filter(option =>
                            ['Primer grado', 'Segundo grado', 'Tercer grado', 'Cuarto grado', 'Quinto grado', 'Sexto grado'].includes(option.textContent)
                        );
                    } else if (selectedNivel === 'Educación Secundaria') {
                        filteredOptions = initialOptions.filter(option =>
                            ['Séptimo grado/Primer año', 'Octavo grado/Segundo año', 'Noveno grado/Tercer año', 'Décimo grado/Cuarto año', 'Undécimo grado/Quinto año'].includes(option.textContent)
                        );
                    } else {
                        // Si no se selecciona un nivel específico, simplemente no se añaden más opciones
                        // (solo queda la de "Seleccione una opción").
                        return;
                    }

                    // Añade las opciones filtradas de nuevo al select de grado
                    filteredOptions.forEach(option => gradoSelect.appendChild(option.cloneNode(true)));
                    gradoSelect.value = ''; // Restablece la selección del grado cuando cambia el nivel
                };

                // Escucha cambios en el select de Nivel Educativo
                nivelEducativoSelect.addEventListener('change', filterGrades);

                // Llama a la función de filtrado al cargar la página para establecer el estado inicial
                filterGrades();
            }
        }


        // --- Aplicar todas las validaciones relevantes a los campos ---

        // Datos Personales del Estudiante
        applyLettersOnlyValidation(document.getElementById('nombre'), 'Primer Nombre');
        applyLettersOnlyValidation(document.getElementById('segundoNombre'), 'Segundo Nombre');
        applyLettersOnlyValidation(document.getElementById('apellido1'), 'Primer Apellido');
        applyLettersOnlyValidation(document.getElementById('apellido2'), 'Segundo Apellido');
        applyPhoneValidation(document.getElementById('telefono'), 8, '88887777');
        applyFloatValidation(document.getElementById('peso'), 'peso');
        applyFloatValidation(document.getElementById('talla'), 'talla');
        applyLettersOnlyValidation(document.getElementById('nacionalidad'), 'Nacionalidad');
        applyLettersOnlyValidation(document.getElementById('paisNacimiento'), 'País de Nacimiento');
        applyLettersOnlyValidation(document.getElementById('territorioIndigena'), 'Territorio Indígena');
        applyLettersOnlyValidation(document.getElementById('habitaIndigena'), 'Habita Indígena');

        // Datos de Contacto de Padres/Tutor
        applyLettersOnlyValidation(document.getElementById('nombreMadre'), 'Nombres y Apellidos de la madre');
        applyCedulaValidation(document.getElementById('cedulaMadre'));
        applyPhoneValidation(document.getElementById('telefonoMadre'), 8, '88887777');

        applyLettersOnlyValidation(document.getElementById('nombrePadre'), 'Nombres y Apellidos del padre');
        applyCedulaValidation(document.getElementById('cedulaPadre'));
        applyPhoneValidation(document.getElementById('telefonoPadre'), 8, '88887777');

        applyLettersOnlyValidation(document.getElementById('nombreTutor'), 'Nombres y Apellidos del tutor');
        applyCedulaValidation(document.getElementById('cedulaTutor'));
        applyPhoneValidation(document.getElementById('telefonoTutor'), 8, '88887777');

        // Llama a la función para configurar el filtrado de grados
        setupGradeFiltering();


        // --- Manejo del Submit del Formulario ---
        matriculaForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value.trim();
            }
            // Asegura que los valores de radio buttons se obtengan correctamente
            data.turno = document.querySelector('input[name="turno"]:checked')?.value || '';
            data.repitente = document.querySelector('input[name="repitente"]:checked')?.value || '';

            let formIsValid = true;

            // Disparar blur en todos los campos para mostrar errores antes del submit final
            this.querySelectorAll('input:not([type="radio"]), select, textarea').forEach(input => {
                if (!input.readOnly) {
                    input.dispatchEvent(new Event('blur'));
                }
            });

            // --- Validación de campos obligatorios de Datos Personales del Estudiante ---
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

            // --- Validación de al menos un conjunto de datos de contacto (madre, padre o tutor) ---
            const isMadreComplete = data.nombreMadre || data.cedulaMadre || data.telefonoMadre;
            const isPadreComplete = data.nombrePadre || data.cedulaPadre || data.telefonoPadre;
            const isTutorComplete = data.nombreTutor || data.cedulaTutor || data.telefonoTutor;

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

            // --- Validación de campos obligatorios de Datos ACADÉMICOS ---
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
                } else if (inputElement && data[fieldName] === '') {
                    showError(inputElement, 'Este campo es obligatorio.');
                    formIsValid = false;
                }
            }

            // --- Verificar si hay algún campo con errores '.is-invalid' después de todas las validaciones ---
            const invalidInputs = this.querySelectorAll('.is-invalid');
            if (invalidInputs.length > 0) {
                formIsValid = false;
                // Hace scroll al primer campo inválido para que el usuario lo vea
                invalidInputs[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // Si el formulario no es válido, detener el envío
            if (!formIsValid) {
                alert("Por favor, corrige todos los campos marcados con errores antes de enviar.");
                return;
            }

            // --- Si todas las validaciones del frontend pasan, procede con el envío a la API ---
            try {
                // 1. Enviar Datos Académicos
                const academicResponse = await fetch('http://localhost:3000/api/academic', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
                const studentResponse = await fetch('http://localhost:3000/api/student', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        matriculaId: matriculaId,
                        telefono: data.telefono,
                        direccion: data.direccion,
                        primerNombre: data.nombre,
                        segundoNombre: data.segundoNombre,
                        primerApellido: data.apellido1,
                        segundoApellido: data.apellido2,
                        fechaNacimiento: data.fechaNacimiento,
                        genero: data.genero,
                        peso: parseFloat(data.peso),
                        talla: parseFloat(data.talla),
                        nacionalidad: data.nacionalidad,
                        paisNacimiento: data.paisNacimiento,
                        residenciaDepartamento: data.departamento,
                        residenciaMunicipio: data.municipio,
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
                const parentResponse = await fetch('http://localhost:3000/api/parent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        matriculaId: matriculaId,
                        nombreMadre: data.nombreMadre,
                        cedulaMadre: data.cedulaMadre,
                        telefonoMadre: data.telefonoMadre,
                        nombrePadre: data.nombrePadre,
                        cedulaPadre: data.cedulaPadre,
                        telefonoPadre: data.telefonoPadre,
                        nombreTutor: data.nombreTutor,
                        cedulaTutor: data.cedulaTutor,
                        telefonoTutor: data.telefonoTutor
                    })
                });

                if (!parentResponse.ok) {
                    const errorBody = await parentResponse.text();
                    throw new Error(`Error en el envío de datos de padres/tutor: ${parentResponse.status} - ${errorBody}`);
                }
                console.log('✅ Datos de padres/tutor guardados.');

                // Intento de generación de PDF
                try {
                    const pdfResponse = await fetch('http://localhost:3000/api/generate-pdf', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });

                    if (pdfResponse.ok) {
                        const blob = await pdfResponse.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = url;

                        const fileName = `ficha_matricula_${data.nombre || 'estudiante'}_${data.apellido1 || ''}.pdf`;
                        a.download = fileName;
                        document.body.appendChild(a);
                        a.click();

                        window.URL.revokeObjectURL(url);
                        alert('✅ ¡Registro de matrícula completado y PDF generado con éxito!');
                    } else {
                        const errorText = await pdfResponse.text();
                        console.error('❌ Error al generar el PDF:', errorText);
                        alert(`Registro completado, pero hubo un error al generar el PDF: ${errorText}.`);
                    }
                } catch (pdfErr) {
                    console.error('❌ Error de red o en la solicitud al generar PDF:', pdfErr);
                    alert('Registro completado, pero ocurrió un error al intentar generar el PDF.');
                }

                // Reiniciar el formulario y redirigir
                this.reset();
                // Limpiar las clases de validación después de resetear
                this.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
                    el.classList.remove('is-valid', 'is-invalid');
                });
                // Asegúrate de que el select de grado se reinicie a su estado original/por defecto
                setupGradeFiltering(); // Volver a llamar para restablecer las opciones del grado

                window.location.href = '../index.html'; // Redirige a la página principal
            } catch (err) {
                console.error("❌ Error general al guardar la matrícula:", err.message);
                alert(`Hubo un error al guardar los datos de matrícula: ${err.message}. Por favor, revise la consola para más detalles.`);
            }
        });
    }
});