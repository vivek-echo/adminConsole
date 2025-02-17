const Joi = require('joi');
const logger = require('../helper/logger');


const methodResponse = (res, message = "", statusCode = 200, status = "SUCCESS", success = true, data = null) => {
    // if (statusCode != 200) {
    //     logger.error(`[${new Date().toISOString()}] ${message}`);
    // }
    return res.status(statusCode).json({
        msg: message,
        statusCode: statusCode,
        status: status,
        success: success,
        data: data
    });
};

const exceptionHandler = (res, error, controller, method) => {

    const errorMessage = {
        // Error: error?.stack,
        Error: error?.message || 'An unknown error occurred',
        Line: "",
    };

    const logMessage = `Error in ${controller}::${method}, Error: ${JSON.stringify(errorMessage)}`;

    logger.error(logMessage);

    return res.status(400).json({
        msg: errorMessage,
        statusCode: 400,
        status: "ERROR",
        success: false,
        data: null
    });
}

const validationRequestMethod = (res, req, rules) => {
    const schema = Joi.object(rules);
    const { error } = schema.validate(req.body, { abortEarly: false });
    return error;

}

module.exports = { methodResponse, validationRequestMethod, exceptionHandler };

