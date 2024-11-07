let schemaData = [];

function updateSchemaOutput() {
    // Reorder parameters to match form layout
    reorderParameters();

    // Update JSON output in the text area
    document.getElementById("schemaOutput").value = JSON.stringify(schemaData, null, 4);

    // Update function names in the functionList text area
    updateFunctionList();
}

function reorderParameters() {
    schemaData.forEach(schema => {
        const properties = {};
        const required = [];
        const optional = [];

        const paramGroups = document.querySelectorAll(".parameter-group");
        
        paramGroups.forEach(group => {
            const paramName = group.querySelector(".param-name-input").value.trim();
            const paramType = group.querySelector(".param-type-input").value.trim();
            const paramDescription = group.querySelector(".param-description-input").value.trim();
            const isRequired = group.querySelector(".required-checkbox").checked;

            if (paramName) {
                properties[paramName] = { type: paramType, description: paramDescription };

                if (isRequired) {
                    required.push(paramName);
                } else {
                    optional.push(paramName);
                }
            }
        });

        schema.parameters.properties = properties;
        schema.parameters.required = required;
        schema.parameters.optional = optional;
    });
}

function updateFunctionList() {
    // Collect function names from schemaData
    const functionNames = schemaData.map(schema => schema.name).filter(name => name);

    // Update the functionList text area with a comma-separated list
    document.getElementById("functionList").value = functionNames.join(",");
}


function createSchemaCard() {
    const newSchema = {
        name: "",
        description: "",
        parameters: {
            type: "object",
            properties: {},
            required: [],
            optional: []
        }
    };

    schemaData.push(newSchema);

    const schemaRow = document.getElementById("schemaRow");

    const newCard = document.createElement("div");
    newCard.className = "col-6 card-container";
    newCard.innerHTML = `
        <div class="card bg-light">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <h5>Function Schema</h5>
                    <button type="button" class="btn btn-outline-danger btn-sm delete-schema" aria-label="Delete">Delete Schema</button>
                </div>
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" class="form-control name-input" placeholder="Enter function name">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea class="form-control description-input" rows="2" placeholder="Enter function description"></textarea>
                </div>
                <div class="parameters-section">
                    <h6>Parameters</h6>
                    <div class="parameter-group-container">
                        <div class="parameter-group">
                            <div class="form-group">
                                <label>Parameter Name</label>
                                <div class="d-flex align-items-center">
                                    <input type="text" class="form-control param-name-input" value="param1" placeholder="Enter parameter name">
                                </div>
                                <div class="d-flex mt-2">
                                    <input type="checkbox" class="ml-0 form-check-input required-checkbox" title="Required" id="required">
                                    <label class="ml-3" for="required">Required</label>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Type</label>
                                <input type="text" class="form-control param-type-input" placeholder="Enter parameter type">
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea class="form-control param-description-input" rows="2" placeholder="Enter parameter description"></textarea>
                            </div>
                            <div class="d-flex justify-content-center mt-2">
                                <button type="button" class="btn btn-outline-danger btn-sm delete-param">Delete Parameter</button>
                            </div>
                        </div>
                        <div class="add-parameter-group add-param">
                            <button type="button" class="btn btn-outline-success btn-sm">Add Parameter</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    schemaRow.insertBefore(newCard, document.getElementById("addCardContainer"));

    newCard.querySelector(".name-input").addEventListener("input", function() {
        newSchema.name = this.value;
        updateSchemaOutput();
    });

    newCard.querySelector(".description-input").addEventListener("input", function() {
        newSchema.description = this.value;
        updateSchemaOutput();
    });

    newCard.querySelector(".delete-schema").addEventListener("click", function() {
        const confirmDelete = confirm("Are you sure you want to delete this schema?");
        if (confirmDelete) {
            schemaRow.removeChild(newCard);
            schemaData = schemaData.filter(schema => schema !== newSchema);
            updateSchemaOutput();
        }
    });

    let currentParamKey = "param1";
    const param1 = { type: "", description: "" };
    newSchema.parameters.properties[currentParamKey] = param1;
    newSchema.parameters.optional.push(currentParamKey);

    const paramNameInput = newCard.querySelector(".param-name-input");
    paramNameInput.addEventListener("input", function() {
        const newKey = this.value.trim();
        if (newKey && newKey !== currentParamKey) {
            // Update properties object
            delete newSchema.parameters.properties[currentParamKey];
            newSchema.parameters.properties[newKey] = param1;

            // Update required list if currentParamKey is in it
            const requiredIndex = newSchema.parameters.required.indexOf(currentParamKey);
            if (requiredIndex !== -1) {
                newSchema.parameters.required[requiredIndex] = newKey;
            }

            // Update optional list if currentParamKey is in it
            const optionalIndex = newSchema.parameters.optional.indexOf(currentParamKey);
            if (optionalIndex !== -1) {
                newSchema.parameters.optional[optionalIndex] = newKey;
            }

            currentParamKey = newKey; // Update current parameter key to the new name
            updateSchemaOutput();
        }
    });

    newCard.querySelector(".param-type-input").addEventListener("input", function() {
        param1.type = this.value;
        updateSchemaOutput();
    });

    newCard.querySelector(".param-description-input").addEventListener("input", function() {
        param1.description = this.value;
        updateSchemaOutput();
    });

    newCard.querySelector(".required-checkbox").addEventListener("change", function() {
        if (this.checked) {
            newSchema.parameters.required.push(currentParamKey);
            newSchema.parameters.optional = newSchema.parameters.optional.filter(param => param !== currentParamKey);
        } else {
            newSchema.parameters.optional.push(currentParamKey);
            newSchema.parameters.required = newSchema.parameters.required.filter(param => param !== currentParamKey);
        }
        updateSchemaOutput();
    });

    newCard.querySelector(".add-param").addEventListener("click", function() {
        const paramGroupContainer = newCard.querySelector(".parameter-group-container");
        const paramGroup = document.createElement("div");
        paramGroup.className = "parameter-group";

        const newParam = { type: "", description: "" };
        const paramKey = `param${Object.keys(newSchema.parameters.properties).length + 1}`;

        paramGroup.innerHTML = `
            <div class="form-group">
                <label>Parameter Name</label>
                <div class="d-flex align-items-center">
                    <input type="text" class="form-control param-name-input" value="${paramKey}" placeholder="Enter parameter name">
                </div>
                <div class="d-flex mt-2">
                    <input type="checkbox" class="ml-0 form-check-input required-checkbox" title="Required" id="required">
                    <label class="ml-3" for="required">Required</label>
                </div>
            </div>
            <div class="form-group">
                <label>Type</label>
                <input type="text" class="form-control param-type-input" placeholder="Enter parameter type">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-control param-description-input" rows="2" placeholder="Enter parameter description"></textarea>
            </div>
            <div class="d-flex justify-content-center mt-2">
                <button type="button" class="btn btn-outline-danger btn-sm delete-param">Delete Parameter</button>
            </div>
        `;

        paramGroupContainer.insertBefore(paramGroup, newCard.querySelector(".add-parameter-group"));
        newSchema.parameters.properties[paramKey] = newParam;
        newSchema.parameters.optional.push(paramKey); // Add new parameter to optional list

        let currentParamGroupKey = paramKey;

        paramGroup.querySelector(".param-name-input").addEventListener("input", function() {
            const newKey = this.value.trim();
            if (newKey && newKey !== currentParamGroupKey) {
                delete newSchema.parameters.properties[currentParamGroupKey];
                newSchema.parameters.properties[newKey] = newParam;

                // Update required and optional lists
                const requiredIdx = newSchema.parameters.required.indexOf(currentParamGroupKey);
                if (requiredIdx !== -1) {
                    newSchema.parameters.required[requiredIdx] = newKey;
                }
                const optionalIdx = newSchema.parameters.optional.indexOf(currentParamGroupKey);
                if (optionalIdx !== -1) {
                    newSchema.parameters.optional[optionalIdx] = newKey;
                }

                currentParamGroupKey = newKey;
                updateSchemaOutput();
            }
        });

        paramGroup.querySelector(".param-type-input").addEventListener("input", function() {
            newParam.type = this.value;
            updateSchemaOutput();
        });

        paramGroup.querySelector(".param-description-input").addEventListener("input", function() {
            newParam.description = this.value;
            updateSchemaOutput();
        });

        paramGroup.querySelector(".required-checkbox").addEventListener("change", function() {
            if (this.checked) {
                newSchema.parameters.required.push(currentParamGroupKey);
                newSchema.parameters.optional = newSchema.parameters.optional.filter(param => param !== currentParamGroupKey);
            } else {
                newSchema.parameters.optional.push(currentParamGroupKey);
                newSchema.parameters.required = newSchema.parameters.required.filter(param => param !== currentParamGroupKey);
            }
            updateSchemaOutput();
        });

        paramGroup.querySelector(".delete-param").addEventListener("click", function() {
            const confirmDeleteParam = confirm("Are you sure you want to delete this parameter?");
            if (confirmDeleteParam) {
                paramGroupContainer.removeChild(paramGroup);
                delete newSchema.parameters.properties[paramKey];
                newSchema.parameters.required = newSchema.parameters.required.filter(param => param !== paramKey);
                newSchema.parameters.optional = newSchema.parameters.optional.filter(param => param !== paramKey);
                updateSchemaOutput();
            }
        });

        updateSchemaOutput(); // Update the JSON output after adding a new parameter
    });

    updateSchemaOutput();
}

document.addEventListener("DOMContentLoaded", function() {
    createSchemaCard();

    const addCard = document.getElementById("addCard");
    if (addCard) {
        addCard.addEventListener("click", createSchemaCard);
    }
});
