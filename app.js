
(function () {
    "use strict()";

    // Store data in browser cache
    const STORAGE_KEY = "greeny_records_v1";

    // DOM Element Variables
    const entryModal = document.getElementById('log-entry-modal');
    const openEntryModal = document.getElementById('new-log-button');
    const cancelEntryModal = document.getElementById('cancel-log-button');
    const submitEntryModal = document.getElementById('submit-log-button');
    const clearLogs = document.getElementById('clear-logs-button');
    const logCount = document.getElementById('bar-value')
    const logEntryGrid = document.getElementById('log-entry-grid')

    let records = loadRecords();

    renderLogEntries();

    function loadRecords() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            //check if any logs exist, return if true
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error("Failed to load records from data store", error);
            return [];
        }
    }

    function saveRecords() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        } catch (error) {
            console.error("Failed to write to data store.", error);
        }
    }

    function renderLogEntries() {
        logCount.textContent = records.length;

        logEntryGrid.innerHTML

        // 1 == 1; "1" === 1
        if (records.length === 0) {
            emptyState.classList.remove("hidden");
            recordsList.innerHTML = "";
            return;
        }

        records.forEach(record => {
            
        });
    }

    function renderLogEntryModal() {

    }
})
