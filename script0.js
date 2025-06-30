document.addEventListener('DOMContentLoaded', function() {
    const matriculaForm = document.getElementById('matriculaForm');
    if (matriculaForm) {

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
        const BACKEND_URL = window.BACKEND_API_URL || 'https://corporate-marketa-odvin123-2e265ec9.koyeb.app'


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

        function setupGradeAndModalityFiltering() {
            const nivelEducativoSelect = document.getElementById('nivelEducativo');
            const gradoSelect = document.getElementById('grado');
            const modalidadSelect = document.getElementById('modalidad'); 

            if (nivelEducativoSelect && gradoSelect && modalidadSelect) { 
                const initialGradoOptions = Array.from(gradoSelect.options);
                const initialModalidadOptions = Array.from(modalidadSelect.options); 
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


                    modalidadSelect.innerHTML = '';
                    const defaultModalidadOption = document.createElement('option');
                    defaultModalidadOption.value = '';
                    defaultModalidadOption.textContent = 'Seleccione una opción';
                    modalidadSelect.appendChild(defaultModalidadOption);

                    let filteredModalidadOptions = [];

                    if (selectedNivel === 'Educación Inicial') {
                        filteredModalidadOptions = initialModalidadOptions.filter(option =>
                            option.textContent === 'Preescolar-formal'
                        );
                    } else if (selectedNivel === 'Educación Primaria') {
                        filteredModalidadOptions = initialModalidadOptions.filter(option =>
                            option.textContent === 'Primaria'
                        );
                    } else if (selectedNivel === 'Educación Secundaria') {
                        filteredModalidadOptions = initialModalidadOptions.filter(option =>
                            option.textContent === 'Secundaria'
                        );
                    }
                    filteredModalidadOptions.forEach(option => modalidadSelect.appendChild(option.cloneNode(true)));
                    modalidadSelect.value = ''; 
                };

                nivelEducativoSelect.addEventListener('change', filterOptions);

                filterOptions();
            }
        }


        function synchronizeLocationFields() {
            const studentDepartmentSelect = document.getElementById('departamento');
            const studentMunicipioSelect = document.getElementById('municipio');
            const academicDepartmentSelect = document.getElementById('departamentoacad');
            const academicMunicipioSelect = document.getElementById('municipioAcad');

            if (studentDepartmentSelect && academicDepartmentSelect) {
                studentDepartmentSelect.addEventListener('change', function() {
                    academicDepartmentSelect.value = this.value;
                    academicDepartmentSelect.dispatchEvent(new Event('change'));
                    clearError(academicDepartmentSelect);
                });
            }

            if (studentMunicipioSelect && academicMunicipioSelect) {
                studentMunicipioSelect.addEventListener('change', function() {
                    academicMunicipioSelect.value = this.value;
                    clearError(academicMunicipioSelect);
                });
            }

            if (studentDepartmentSelect && academicDepartmentSelect) {
                academicDepartmentSelect.value = studentDepartmentSelect.value;
            }
            if (studentMunicipioSelect && academicMunicipioSelect) {
                academicMunicipioSelect.value = studentMunicipioSelect.value;
            }
        }


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


        applyLettersOnlyValidation(document.getElementById('nombreMadre'), 'Nombres y Apellidos de la madre');
        applyCedulaValidation(document.getElementById('cedulaMadre'));
        applyPhoneValidation(document.getElementById('telefonoMadre'), 8, '88887777');

        applyLettersOnlyValidation(document.getElementById('nombrePadre'), 'Nombres y Apellidos del padre');
        applyCedulaValidation(document.getElementById('cedulaPadre'));
        applyPhoneValidation(document.getElementById('telefonoPadre'), 8, '88887777');

        applyLettersOnlyValidation(document.getElementById('nombreTutor'), 'Nombres y Apellidos del tutor');
        applyCedulaValidation(document.getElementById('cedulaTutor'));
        applyPhoneValidation(document.getElementById('telefonoTutor'), 8, '88887777');


        setupGradeAndModalityFiltering();
        synchronizeLocationFields();


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


            this.querySelectorAll('input:not([type="radio"]), select, textarea').forEach(input => {
                if (!input.readOnly) {
                    input.dispatchEvent(new Event('blur'));
                }
            });


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


            try {

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


                const studentResponse = await fetch(`${BACKEND_URL}/api/student`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
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


                const parentResponse = await fetch(`${BACKEND_URL}/api/parent`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
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


                console.log('✅ Todos los datos han sido guardados exitosamente.');
                alert('¡Registro de matrícula completado con éxito!');
                this.reset();

                this.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
                    el.classList.remove('is-valid', 'is-invalid');
                });

                setupGradeAndModalityFiltering();
                synchronizeLocationFields(); 

                window.location.href = '../index.html';
            } catch (err) {
                console.error("❌ Error general al guardar la matrícula:", err.message);
                alert(`Hubo un error al guardar los datos de matrícula: ${err.message}. Por favor, revise la consola para más detalles.`);
            }
        });
    }
});