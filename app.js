
document.addEventListener("DOMContentLoaded", () => {
    (function () {
        // Store data in browser cache
        const STORAGE_KEY = "greeny_records_v1";

        // DOM Element Variables
        // Log entry Modal
        const entryModal = document.getElementById('log-entry-modal');
        const errorModalButton = document.getElementById('error-message-close');
        const openEntryModalButton = document.getElementById('new-log-button');
        const cancelEntryModalButton = document.getElementById('cancel-log-button');
        const entryForm = document.getElementById('log-form')
        // Error Modal
        const errorModal = document.getElementById('error-message-modal');
        const errorText = document.getElementById('error-message-text');
        // Log entry list grid
        const logEntryList = document.getElementById('log-entry-list');
        const clearLogs = document.getElementById('clear-logs-button');
        // DOM html form elements
        const inputBayId = document.getElementById("bay-id");
        const inputPh = document.getElementById("ph-input");
        const inputTemp = document.getElementById("temp-input");
        const inputEc = document.getElementById("ec-input");
        const inputRh = document.getElementById("rh-input");
        // Misc
        const emptyState = document.getElementById('empty-state');
        const logCount = document.getElementById('bar-value');

        let records = loadRecords();
        entryModal.classList.add("hidden");
        errorModal.classList.add("hidden");

        // Modal Operations
        function openModal() {
            console.log("'New Log' button clicked");
            entryModal.classList.remove("hidden");
        };
        function closeModal() {
            entryModal.classList.add("hidden");
            if (entryForm) entryForm.reset();
        };

        function closeErrorModal() {
            errorText.textContent = "";
            errorModal.classList.add("hidden");
        }

        // Call render function to render log entries
        render()

        // Event listeners
        openEntryModalButton.addEventListener("click", openModal);
        cancelEntryModalButton.addEventListener("click", closeModal);
        errorModalButton.addEventListener("click", closeErrorModal);
        entryForm.addEventListener("submit", (event) => {
            event.preventDefault(); // relevent to web forms s.t. they don't reload on submission

            const formData = {
            id: crypto.randomUUID(),
            bayid: inputBayId.value,
            ph: parseInt(inputPh.value, 10),
            temp: parseInt(inputTemp.value, 10),
            ec: parseInt(inputEc.value, 10),
            rh: parseInt(inputRh.value, 10),
            timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            };

            const validationErrors = validateInput(formData);
            formData["severity"] = getSeverity(formData);

            if (validationErrors.length > 0) {
                displayError(validationErrors.join("\n"));
                return;
            }

            hideError();

            // add entry to records array
            records.unshift(formData);

            // commit this to the memory
            saveRecords();

            // reset the user form after data is committed to data store
            entryForm.reset();
            closeModal();
            render();
            // bring the input focus to the first input field - such that user can enter a new log
            inputBayId.focus();
        });
        // delete all log events
        clearLogs.addEventListener("click", (event) => {
            if (records.length === 0) return;
            if (confirm("Are you sure you want to delete all patient records?")) {
            records = [];
            saveRecords();
            render();
            }
        });
        logEntryList.addEventListener("click", (event) => {
            // identify which patient card's delete btn was clicked
            const target = event.target;
                if (target.classList.contains("btn-remove")) {
                    const recordId = target.dataset.id;
                    records = records.filter(function (record) {
                    return record.id !== recordId;
                });
                saveRecords();
                render();
            }
        });

        // Storage operations
        function loadRecords() {
            try {
            // establish connection with your data store
            const stored = localStorage.getItem(STORAGE_KEY);
            // check if anything was returned or if store is empty
            return stored ? JSON.parse(stored) : [];
            } catch (error) {
            console.error("Failed to load records from your data store", error);
            return [];
            }
        }

        function saveRecords() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
            } catch (error) {
                console.error("Failed to write to your data store", error);
            }
        }

        // Render log entry list content
        function render() {
            logCount.textContent = records.length;

            // 1 == 1; "1" === 1
            if (records.length === 0) {
                emptyState.classList.add("hidden");
                logEntryList.innerHTML = "";
                return;
            }

            // if not emppty
            emptyState.classList.add("hidden");
            logEntryList.classList.remove("hidden");

            // create a virtual DOM.
            // minimizes browser reloads
            const fragment = document.createDocumentFragment();

            // for each item in the events
            records.forEach(function (rec) {
            const li = document.createElement("li");

            // create our dynamic card <img src=x onerror='query to retrieve data'>
            li.innerHTML = `<div class="card-top">
                    <div class="bay-stat-header">
                        <span class="bay-id-text header-item">Bay ${escapeHtml(rec.bayid)} </span>
                        <span class="timestamp header-item">Logged at ${rec.timestamp} </span> 
                        <span>
                            <span class="bay-stat-indicator ${rec.severity}" id="bay-stat-indicator">${rec.severity}</span>
                            <button class="btn btn-secondary header-item btn-remove" data-id="${rec.id}">Delete Log</button>
                        </span>
                    </div>
                    <div class="bay-stats">
                        <div class="stat-item"><span>PH Level</span>${rec.ph}</div>
                        <div class="stat-item"><span>Air Temp</span>${rec.temp} F</div>
                        <div class="stat-item"><span>EC</span>${rec.ec} mS/cm</div>
                        <div class="stat-item"><span>Humidity</span>${rec.rh}%</div> 
                    </div>        
                </div>`;

            // add the above html to the vritual DOM
            fragment.appendChild(li);
            });

            // reset the UI
            logEntryList.innerHTML = "";
            // add the document fragment to the reload DOM
            logEntryList.appendChild(fragment);
        }

        // escape html function - this is to sanitize your user
        // input such that they are unable to inject malicious code
        function escapeHtml(str) {
            // replace & < > :- do this globally across all codes
            return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        }
        
        // Input form validation:
        function validateInput(data) {
            const errors = [];

            if (!data.bayid) {
                errors.push("Bay ID is a required Field");
            }
            if (isNaN(data.ph) || data.ph < 0 || data.ph > 14) {
                errors.push("PH must be between 0 and 14\n");
            }
            if (isNaN(data.temp) || data.temp < 32 || data.temp > 212) {
                errors.push("Temp must be between 32 and 212\n");
            }
            if (isNaN(data.ec) || data.ec < -10 || data.ec > 10) {
                errors.push("EC must be between -10 and 10\n");
            }
            if (isNaN(data.rh) || data.rh < 0 || data.rh > 100) {
                errors.push("Humidity must be between 0 and 100.\n");
            }

            return errors;
        }

        function getSeverity(data) {
            severityValue = "";
            if ((data.ph < 5 || data.ph > 7.5) && (data.temp < 55 || data.temp > 55) && (data.ec < 0.2 || data.ec > 4.5) && (data.rh < 30 || data.rh > 90)) {
                severityValue = "critical";
            }
            if ((data.ph <= 5.5 || data.ph >= 6.5) && (data.temp <= 64.4 || data.temp >= 71.6) && (data.ec < 1.0 || data.ec > 2.0) && (data.rh <= 50 || data.rh >= 70)) {
                severityValue = "optimal";
            }
            if (severityValue != "critical" || severityValue != "optimal") {
                severityValue = "warning";
            }

            return severityValue;
        }

        // dynamically show error modal
        function displayError(message) {
            errorText.textContent = message;
            errorModal.classList.remove("hidden");
        }

        // dynamically hide the error modal on correct input
        function hideError() {
            errorText.textContent = "";
            errorModal.classList.add("hidden");
        }

    })();
});