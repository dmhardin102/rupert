document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById('accidentForm');
    const reportList = document.getElementById('reportList');

    let db;

    // Initialize SQLite
    async function initDb() {
        try {
            const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.5.0/${file}` });
            db = new SQL.Database();
            createTable();
            loadReports();
        } catch (error) {
            console.error("Failed to initialize SQLite:", error);
        }
    }

    function createTable() {
        db.run(`CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            date TEXT, 
            location TEXT, 
            driverName TEXT, 
            vehicleInfo TEXT, 
            insuranceInfo TEXT
        );`);
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        
        const dateOfAccident = document.getElementById('dateOfAccident').value;
        const location = document.getElementById('location').value;
        const driverName = document.getElementById('driverName').value;
        const vehicleInfo = document.getElementById('vehicleInfo').value;
        const insuranceInfo = document.getElementById('insuranceInfo').value;
        
        console.log('Submitting:', { dateOfAccident, location, driverName, vehicleInfo, insuranceInfo });

        try {
            db.run("INSERT INTO reports (date, location, driverName, vehicleInfo, insuranceInfo) VALUES (?, ?, ?, ?, ?)", 
                   [dateOfAccident, location, driverName, vehicleInfo, insuranceInfo]);

            console.log("Report successfully inserted.");
            loadReports(); // Refresh the list after insertion
            form.reset();  // Clear the form
        } catch (err) {
            console.error("Error inserting report:", err);
        }
    });

    function loadReports() {
        reportList.innerHTML = ''; // Clear existing reports in the list
        const stmt = db.prepare("SELECT * FROM reports");

        let reports = [];
        while (stmt.step()) {
            const report = stmt.getAsObject();
            reports.push(report);
            console.log('Loaded Report:', report);
        }
        stmt.free();

        if (reports.length === 0) {
            reportList.innerHTML = '<li>No reports found.</li>';
        } else {
            reports.forEach(report => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <strong>Date:</strong> ${report.date} <br>
                    <strong>Location:</strong> ${report.location} <br>
                    <strong>Driver's Name:</strong> ${report.driverName} <br>
                    <strong>Vehicle Info:</strong> ${report.vehicleInfo} <br>
                    <strong>Insurance Info:</strong> ${report.insuranceInfo} <br>
                    <button onclick="deleteReport(${report.id})">Delete</button>
                `;
                reportList.appendChild(li);
            });
        }
    }

    window.deleteReport = function (id) {
        try {
            db.run("DELETE FROM reports WHERE id = ?", [id]);
            console.log(`Report with ID ${id} deleted.`);
            loadReports(); // Refresh the list after deletion
        } catch (err) {
            console.error(`Error deleting report with ID ${id}:`, err);
        }
    };

    // Initialize the database
    initDb();
});
