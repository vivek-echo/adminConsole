const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');
const commonController = require('../controllers/commonController')
const menuLinkController = require('../controllers/menuLinkController')
const queryBuilderController = require('../controllers/queryBuilderController')
const monitorSiteController = require('../controllers/monitorSiteController')

router.post('/login', authController.login);
router.post('/getParentlinkData',authMiddleware,commonController.getParentlinkData)
router.post('/getUserRoles',authMiddleware,commonController.getUserRoles)
router.post('/getDashbaoardData', authMiddleware, dashboardController.getDashbaoardData);
router.post('/addMenuLink', authMiddleware, menuLinkController.addMenuLink);
router.post('/getMenuLinks', authMiddleware, menuLinkController.getMenuLinks);
router.post('/updateMenuPermissions', authMiddleware, menuLinkController.updateMenuPermissions);
router.post('/getSerializeMenuLinks', authMiddleware, menuLinkController.getSerializeMenuLinks);
router.post('/updateMenuSerialization', authMiddleware, menuLinkController.updateMenuSerialization);
router.post('/getDataQueryBuilder', authMiddleware, queryBuilderController.getDataQueryBuilder);
router.post('/getQueryBuilderReport', authMiddleware, queryBuilderController.getQueryBuilderReport);
router.post('/deleteSavedQueryReport', authMiddleware, queryBuilderController.deleteSavedQueryReport);
router.post('/addNewQueryReport', authMiddleware, queryBuilderController.addNewQueryReport);
router.post('/downloadQueryReport', authMiddleware, queryBuilderController.downloadQueryReport);
router.post('/viewErrorLogs', authMiddleware, monitorSiteController.viewErrorLogs);

module.exports = router; // Export the router
