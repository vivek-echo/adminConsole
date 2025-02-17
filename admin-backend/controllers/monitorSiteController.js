const fs = require('fs');
const path = require('path');
const { methodResponse, exceptionHandler } = require('../controllers/indexController');

exports.viewErrorLogs = async (req, res) => {
    try {
        const logDirectory = `${process.env.FILE_PATH}/logs/`;
        const { logType, date = "2025-01-15", pageSize = 10, page = 1 } = req.body;

        // Validate required inputs
        if (!logType || !date) {
            return methodResponse(res, "Log type and date are required!", 400, "ERROR", false, null);
        }

        const logFiles = fs.readdirSync(logDirectory).filter(file => file.endsWith('.log'));
        const logs = [];

        logFiles.forEach(file => {
            if (file.includes(logType + "_" + date)) {
                const filePath = path.join(logDirectory, file);
                const fileContent = fs.readFileSync(filePath, 'utf-8');

                const allRows = fileContent
                    .split('\n')
                    .filter(line => line.trim() !== '') // Remove empty lines
                    .map((line, index) => {
                        const [timestamp, level, message] = line.split(' - '); // Adjust this based on your log format
                        return { id: index + 1, timestamp, level, message };
                    });

                // Apply pagination
                const totalRows = allRows.length;
                const startIndex = (page - 1) * pageSize; // Corrected start index
                const endIndex = startIndex + pageSize;
                const paginatedRows = allRows.slice(startIndex, endIndex);

                logs.push({
                    file,
                    rows: paginatedRows,
                    totalRows, // Total rows for frontend pagination
                });
            }
        });

        if (logs.length === 0) {
            return methodResponse(res, "No logs found for the specified filter!", 404, "NOT_FOUND", false, null);
        }

        return methodResponse(res, "Logs fetched successfully!", 200, "SUCCESS", true, logs);

    } catch (error) {
        return exceptionHandler(res, error, "menuLinkController", "viewErrorLogs");
    }
};


