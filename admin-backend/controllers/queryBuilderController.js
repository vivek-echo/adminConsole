const db = require('../db/knexfile');
const Joi = require('joi');
const { Parser } = require('json2csv');
const { methodResponse, exceptionHandler } = require('../controllers/indexController');


exports.getDataQueryBuilder = async (req, res) => {

    try {
        // Validation schema for query parameters
        const schema = Joi.object({
            queryText: Joi.string()
                .required()
                .regex(/^SELECT/i)
                .messages({
                    "string.empty": "Query text is required.",
                    "string.pattern.base": "Query text must start with SELECT.",
                }),
            page: Joi.number().integer().min(1).default(1).messages({
                "number.base": "Page must be a number.",
                "number.min": "Page must be at least 1.",
            }),
            pageSize: Joi.number().integer().min(1).default(10).messages({
                "number.base": "Page size must be a number.",
                "number.min": "Page size must be at least 1.",
            }),
            reportType: Joi.boolean()
        });

        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessages = error.details.map((item) => item.message);
            return methodResponse(res, errorMessages, 422, "VALIDATION_ERROR", false, null);
        }

        let { queryText, page, pageSize, reportTypeCsv } = value;

        // Sanitize query by removing semicolons
        const sanitizedQuery = queryText.replace(/;/g, "");

        let rows;
        if (reportTypeCsv) {
            // Full data fetch for CSV (no pagination)
            [rows] = await db.raw(sanitizedQuery);
            return rows;
        } else {
            // Apply pagination for normal requests
            const offset = (page - 1) * pageSize;
            const paginatedQuery = `${sanitizedQuery} LIMIT ? OFFSET ?`;

            [rows] = await db.raw(paginatedQuery, [pageSize, offset]);

            const countQuery = `SELECT COUNT(*) AS total FROM (${sanitizedQuery}) AS temp`;
            const [totalResult] = await db.raw(countQuery);
            const total = totalResult[0]?.total || 0;
            console.log(rows);
            return methodResponse(res, "Query executed successfully!", 200, "SUCCESS", true, { rows, total });
        }
    } catch (queryError) {
        console.error("Query Error:", queryError.message);
        return methodResponse(res, queryError.message, 423, "QUERY_EXECUTION_ERROR", false, null);
    }
};


exports.getQueryBuilderReport = async (req, res) => {
    try {
        const dataQuery = await db('queryBuilderReport').select('id', 'queryLbl', 'queryTxt').where('deletedFlag', 0);
        return methodResponse(res, "Query Builder Reports updated successfully!", 200, "SUCCESS", true, dataQuery);
    } catch (error) {
        return exceptionHandler(res, error, "queryBuilderController", "getQueryBuilderReport");
    }
};

exports.deleteSavedQueryReport = async (req, res) => {
    try {
        const { savedQueryId } = req.body;
        const dataQuery = await db('queryBuilderReport').where('id', savedQueryId).update({
            'deletedFlag': 1
        });
        return methodResponse(res, "Query Builder Reports deleted successfully!", 200, "SUCCESS", true, dataQuery);
    } catch (error) {
        return exceptionHandler(res, error, "queryBuilderController", "getQueryBuilderReport");
    }
}

exports.addNewQueryReport = async (req, res) => {

    try {
        const getData = req.body
        await db.raw(getData.queryTextModal);
        await db('queryBuilderReport').insert({
            queryLbl: getData.queryLableModal,
            queryTxt: getData.queryTextModal
        })
        return methodResponse(res, "Query Builder Reports Added successfully!", 200, "SUCCESS", true, null);
    } catch (error) {
        return methodResponse(res, error.message, 423, "QUERY_EXECUTION_ERROR", false, null);
    }
}



exports.downloadQueryReport = async (req, res) => {
    try {
        // Corrected the function call
        const data = await exports.getDataQueryBuilder(req, res);

        // Handle empty data
        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'No data found for CSV export.' });
        }

        // Convert data to CSV
        const fields = Object.keys(data[0]);
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(data);

        // Set headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=query_report.csv');
        res.status(200).end(csv);

    } catch (error) {
        return exceptionHandler(res, error, "queryBuilderController", "downloadQueryReport");
    }
};
