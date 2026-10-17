
document.addEventListener("DOMContentLoaded", () => {
    (function () {
        // Store data in browser cache
        const STORAGE_KEY = "greeny_records_v1";

        // DOM Element Variables
        const entryModal = document.getElementById('log-entry-modal');
        const entryForm = document.getElementById('log-form')
        const openEntryModalButton = document.getElementById('new-log-button');
        const cancelEntryModalButton = document.getElementById('cancel-log-button');
        const clearLogs = document.getElementById('clear-logs-button');
        const logCount = document.getElementById('bar-value');
        const logEntryList = document.getElementById('log-entry-list');
        // DOM html form elements
        const inputBayId = document.getElementById("bay-id");
        const inputPh = document.getElementById("ph-input");
        const inputTemp = document.getElementById("temp-input");
        const inputEc = document.getElementById("ec-input");
        const inputRh = document.getElementById("rh-input");

        let records = loadRecords();

        // Modal Operations
        function openModal() {
            console.log("'New Log' button clicked");
            entryModal.classList.add("active")
        };
        function closeModal() {
            entryModal.classList.remove("active");
            if (entryForm) entryForm.reset();
        };

        // Call render function to render log entries
        render()

        // Event listeners
        openEntryModalButton.addEventListener("click", openModal);
        cancelEntryModalButton.addEventListener("click", closeModal);
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

            // const validationErrors = validateInput(formData);

            // if (validationErrors.length > 0) {
            // displayError(validationErrors.join(" "));
            // return;
            // }

            // hideError();

            // classify risk level
            // formData.risk = evaluateRisk(
            // formData.systolic,
            // formData.diastolic,
            // formData.hr,
            // formData.spo2,
            // );

            // add this to our records array that is keeping track of all user input for patients
            records.unshift(formData);

            // commit this to the memory
            saveRecords();

            // reset the user form after data is committed to data store
            entryForm.reset();
            closeModal();

            // bring the input focus to the first input field - such that user can enter a new patient
            inputBayId.focus();
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

            // create a virtual DOM.
            // minimizes browser reloads
            const fragment = document.createDocumentFragment();

            // for each item in the records create the patient cards
            records.forEach(function (rec) {
            const li = document.createElement("li");
            // li.className = "patient-card status-" + rec.risk.level;

            // create our dynamic card <img src=x onerror='query to retrieve data'>
            //
            li.innerHTML = `<div class="card-top">
                    <div class="bay-stat-header">
                        <span class="bay-id-text">Bay ${escapeHtml(rec.bayid)} </span>
                        <span class="timestamp">Logged at ${rec.timestamp} </span> 
                        <span><button class="btn btn-secondary" data-id="${rec.id}">Delete Log</button></span>
                    </div>
                    <div class="bay-stats">
                        <div class="stat-item"><span>PH Level</span>${rec.ph}</div>
                        <div class="stat-item"><span>Air Temp</span>${rec.temp} F</div>
                        <div class="stat-item"><span>EC</span>${rec.ec} mS/cm</div>
                        <div class="stat-item"><span>Humidity</span>${rec.rh}%</div> 
                    </div>        
                </div>`;

            // add the above html to the vritual dom
            fragment.appendChild(li);
            });

            // reset the UI
            logEntryList.innerHTML = "";
            // add the docu fragment to the REaL dom
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
        

    })();
});