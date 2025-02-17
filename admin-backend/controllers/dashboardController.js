const { methodResponse } = require('../controllers/indexController');

exports.getDashbaoardData = async (req, res) => {
    try {
        const responseData = "dskjvnvhds";
        return methodResponse(res, "Get dashboard data works!", 200, "SUCCESS", true, responseData);
    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        return methodResponse(res, error.message, 400, "ERROR", false, null);
    }
};