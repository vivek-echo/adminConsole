const db = require('../db/knexfile');
const Joi = require('joi');
const { methodResponse, exceptionHandler } = require('../controllers/indexController');


exports.addMenuLink = async (req, res) => {
    try {
        const getData = req.body;

        // Define Joi schema
        const schema = Joi.object({
            adminConsoleId: Joi.number().greater(0).required().label('Admin Console ID').messages({
                'number.base': '{#label} must be a number.',
                'number.greater': '{#label} must be greater than 0.',
                'any.required': '{#label} is a required field.',
            }),
            iconClass: Joi.string().required().label('Icon Class').messages({
                'string.base': '{#label} must be a string.',
                'any.required': '{#label} is a required field.',
            }),
            linkName: Joi.string().required().label('Link Name').messages({
                'string.base': '{#label} must be a string.',
                'any.required': '{#label} is a required field.',
            }),
            linkTypeId: Joi.number().greater(0).required().label('Link Type ID').messages({
                'number.base': '{#label} must be a number.',
                'number.greater': '{#label} must be greater than 0.',
                'any.required': '{#label} is a required field.',
            }),
            linkUrl: Joi.string().required().label('Link URL').messages({
                'string.base': '{#label} must be a string.',
                'any.required': '{#label} is a required field.',
            }),
            linkUrl1: Joi.string().required().label('Link URL 1').messages({
                'string.base': '{#label} must be a string.',
                'any.required': '{#label} is a required field.',
            }),
            parentLinkId: Joi.number().greater(0).required().label('Parent Link ID').messages({
                'number.base': '{#label} must be a number.',
                'number.greater': '{#label} must be greater than 0.',
                'any.required': '{#label} is a required field.',
            }),
        });

        // Validate the request body
        const { error } = schema.validate(getData, { abortEarly: false });
        if (error) {
            const errorMessages = error.details.map((item) => item.message);
            return methodResponse(res, errorMessages, 422, "VALIDATION_ERROR", false, null);
        }

        // Safe URL concatenation
        const linkUrl = `${getData.linkUrl1.replace(/\/$/, '')}/${getData.linkUrl.replace(/^\//, '')}`;

        const insertData = {
            adminConsoleId: getData.adminConsoleId,
            linkTypeId: getData.linkTypeId,
            parentLinkId: getData.parentLinkId,
            linkName: getData.linkName,
            linkUrl: linkUrl,
            iconClass: getData.iconClass,
        };

        // Await the DB insert operation
        await db('menuLinkMaster').insert(insertData);

        return methodResponse(res, "Menu Link added successfully!", 200, "SUCCESS", true, null);

    } catch (error) {
        return exceptionHandler(res, error, "menuLinkController", "addMenuLink");
    }
};

exports.getMenuLinks = async (req, res) => {
    try {
        const getData = req.body;
        // Validate input
        const schema = Joi.object({
            adminConsoleId: Joi.number().greater(0).required().label('Admin Console ID').messages({
                'number.base': '{#label} must be a number.',
                'number.greater': '{#label} must be greater than 0.',
                'any.required': '{#label} is a required field.',
            }),
            userRoleId: Joi.number().greater(0).required().label('Role ID').messages({
                'number.base': '{#label} must be a number.',
                'number.greater': '{#label} must be greater than 0.',
                'any.required': '{#label} is a required field.',
            }),

        });

        // Validate the request body
        const { error } = schema.validate(getData, { abortEarly: false });
        if (error) {
            const errorMessages = error.details.map((item) => item.message);
            return methodResponse(res, errorMessages, 422, "VALIDATION_ERROR", false, null);
        }


        // Fetch menu data
        const menuData = await db('menuLinkMaster')
            .where({ adminConsoleId: getData.adminConsoleId, deletedFlag: 0 });

        // Fetch permissions
        const menuPermission = await db('permissionMaster')
            .where({ adminConsoleId: getData.adminConsoleId, roleId: getData.userRoleId, deletedFlag: 0 })
            .first();

        let permission = {};
        let permissionVal = [];

        if (menuPermission && menuPermission.permissionValue) {
            permission = JSON.parse(menuPermission.permissionValue);
            permissionVal = Object.keys(permission);
        }

        const roleMenus = [];
        const parentLinks = menuData.filter(link => link.linkTypeId === 1);
        const childLinks = menuData.filter(link => link.linkTypeId === 2);
        const tabLinks = menuData.filter(link => link.linkTypeId === 3);
        const buttonLinks = menuData.filter(link => link.linkTypeId === 4);

        parentLinks.forEach(glMenu => {
            const glChecked = permissionVal.includes(glMenu.linkId.toString()) ? 'checked' : '';
            const glRadio = glChecked === 'checked' ? permission[glMenu.linkId] : '4';

            const plLinks = childLinks
                .filter(plMenu => plMenu.parentLinkId === glMenu.linkId)
                .map(plMenu => {
                    const plChecked = permissionVal.includes(plMenu.linkId.toString()) ? 'checked' : '';
                    const plRadio = plChecked === 'checked' ? permission[plMenu.linkId] : '4';

                    const plTabs = tabLinks
                        .filter(tabMenu => tabMenu.parentLinkId === plMenu.linkId)
                        .map(tabMenu => {
                            const tabChecked = permissionVal.includes(tabMenu.linkId.toString()) ? 'checked' : '';
                            const tabRadio = tabChecked === 'checked' ? permission[tabMenu.linkId] : '4';

                            const tabButtons = buttonLinks
                                .filter(btnMenu => btnMenu.parentLinkId === tabMenu.linkId)
                                .map(btnMenu => {
                                    const btnChecked = permissionVal.includes(btnMenu.linkId.toString()) ? 'checked' : '';
                                    const btnRadio = btnChecked === 'checked' ? permission[btnMenu.linkId] : '4';

                                    return {
                                        btn_id: btnMenu.linkId,
                                        btn_name: btnMenu.linkName,
                                        btn_path: btnMenu.linkUrl,
                                        btn_class: btnMenu.iconClass,
                                        btn_checked: btnChecked,
                                        btn_radio: btnRadio,
                                    };
                                });

                            return {
                                tab_id: tabMenu.linkId,
                                tab_name: tabMenu.linkName,
                                tab_path: tabMenu.linkUrl,
                                tab_class: tabMenu.iconClass,
                                tab_checked: tabChecked,
                                tab_radio: tabRadio,
                                tab_button: tabButtons,
                            };
                        });

                    return {
                        pl_id: plMenu.linkId,
                        pl_name: plMenu.linkName,
                        pl_path: plMenu.linkUrl,
                        pl_class: plMenu.iconClass,
                        pl_checked: plChecked,
                        pl_radio: plRadio,
                        pl_tab: plTabs,
                    };
                });

            roleMenus.push({
                gl_id: glMenu.linkId,
                gl_name: glMenu.linkName,
                gl_path: glMenu.linkUrl,
                gl_class: glMenu.iconClass,
                gl_checked: glChecked,
                gl_radio: glRadio,
                pl_links: plLinks,
            });
        });

        return methodResponse(res, "Menu Link works successfully!", 200, "SUCCESS", true, roleMenus);
    } catch (error) {
        return exceptionHandler(res, error, "menuLinkController", "getMenuLinks");
    }
};

exports.updateMenuPermissions = async (req, res) => {
    const getData = req.body;

    // Top-level schema to validate the request payload
    const schema = Joi.object({
        permissionVal: Joi.array().required().label('Permission value').messages({
            'any.required': '{#label} is a required field.',
        }),
        permissionRawValue: Joi.object({
            adminConsoleId: Joi.number().greater(0).required().label('Admin Console ID').messages({
                'number.base': '{#label} must be a number.',
                'number.greater': '{#label} must be greater than 0.',
                'any.required': '{#label} is a required field.',
            }),
            userRoleId: Joi.number().greater(0).required().label('Role ID').messages({
                'number.base': '{#label} must be a number.',
                'number.greater': '{#label} must be greater than 0.',
                'any.required': '{#label} is a required field.',
            }),
        }).required().label('Admin console & Role').messages({
            'any.required': '{#label} is a required field.',
        }),
    });

    // Validate the incoming data
    const { error } = schema.validate(getData, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map((item) => item.message);
        return methodResponse(res, errorMessages, 422, 'VALIDATION_ERROR', false, null);
    }

    const permissions = {};

    const collectPermissions = (nodes = [], parentKey = "") => {
        nodes.forEach((node) => {
            if (node.checked && node[parentKey] && node[parentKey] > 0) {
                const numKey = parseInt(node[parentKey]);
                permissions[numKey] = parseInt(node.gl_radio || node.pl_radio || node.tab_radio || node.btn_radio);
            }

            // Check for child nodes recursively
            if (node.pl_links) collectPermissions(node.pl_links, 'pl_id');
            if (node.pl_tab) collectPermissions(node.pl_tab, 'tab_id');
            if (node.tab_button) collectPermissions(node.tab_button, 'btn_id');
        });
    };

    // Start collecting permissions from the root
    collectPermissions(getData.permissionVal, 'gl_id');

    // Convert to JSON object
    const getDataPermissionVal = permissions;
    const getDataPermissionRawValue = getData.permissionRawValue;
    try {
        const getPermisionVal = await db('permissionMaster')
            .where({
                adminConsoleId: getDataPermissionRawValue.adminConsoleId,
                roleId: getDataPermissionRawValue.userRoleId,
                deletedFlag: 0,
            })
            .select('pId')
            .first();

        if (getPermisionVal) {
            // Update existing record
            await db('permissionMaster').where('pId', getPermisionVal.pId).update({
                permissionValue: JSON.stringify(getDataPermissionVal), // Store directly as JSON
                permissionArr: JSON.stringify(Object.keys(getDataPermissionVal)), // Store keys as a JSON array
            });
        } else {
            // Insert new permission
            await db('permissionMaster').insert({
                adminConsoleId: getDataPermissionRawValue.adminConsoleId,
                roleId: getDataPermissionRawValue.userRoleId,
                permissionValue: getDataPermissionVal, // Store directly as JSON
                permissionArr: JSON.stringify(Object.keys(getDataPermissionVal)), // Store keys as a JSON array
            });
        }

        // Respond with success
        return methodResponse(res, "Menu permission updated successfully!", 200, "SUCCESS", true, null);
    } catch (error) {
        return exceptionHandler(res, error, "menuLinkController", "updateMenuPermissions");
    }
};

exports.getSerializeMenuLinks = async (req, res) => {
    try {
        const getData = req.body;
        // Fetch permission data
        const permissionData = await db('permissionMaster')
            .where('adminConsoleId', getData.adminConsoleId)
            .andWhere('roleId', getData.userRoleId)
            .andWhere('deletedFlag', 0)
            .first();
        const roleMenus = [];
        if (permissionData) {
            const permission = JSON.parse(permissionData.permissionValue);
            const permissionVal = Object.keys(permission);

            // Get menu data based on permissions
            const menuData = await db('menuLinkMaster')
                .where('adminConsoleId', getData.adminConsoleId)
                .whereIn('linkId', permissionVal)
                .where('deletedFlag', 0)
                .orderByRaw('FIELD(linkId, ?)', [permissionVal]);

            const parentLink = menuData.filter(item => item.linkTypeId === 1);
            const childLink = menuData.filter(item => item.linkTypeId === 2);
            const tabLink = menuData.filter(item => item.linkTypeId === 3);

            parentLink.forEach((glMenu, glCount) => {
                const glMenuObj = {
                    gl_id: glMenu.linkId,
                    gl_name: glMenu.linkName,
                    gl_path: glMenu.linkUrl,
                    gl_class: glMenu.iconClass,
                    gl_radio: permission[glMenu.linkId],
                    pl_links: [],
                };

                const allPlMenu = childLink.filter(item => item.parentLinkId === glMenu.linkId);
                allPlMenu.forEach((plMenu, plCount) => {
                    const plMenuObj = {
                        pl_id: plMenu.linkId,
                        pl_name: plMenu.linkName,
                        pl_path: plMenu.linkUrl,
                        pl_class: plMenu.iconClass,
                        pl_radio: permission[plMenu.linkId],
                        pl_tab: [],
                    };

                    const allTabMenu = tabLink.filter(item => item.parentLinkId === plMenu.linkId);
                    allTabMenu.forEach((tabMenu, tabCount) => {
                        plMenuObj.pl_tab.push({
                            tab_id: tabMenu.linkId,
                            tab_name: tabMenu.linkName,
                            tab_path: tabMenu.linkUrl,
                            tab_class: tabMenu.iconClass,
                            tab_radio: permission[tabMenu.linkId],
                        });
                    });

                    glMenuObj.pl_links.push(plMenuObj);
                });

                roleMenus.push(glMenuObj);
            });

        }
        // Respond with success
        return methodResponse(res, "Menu Link works successfully!", 200, "SUCCESS", true, roleMenus);
    } catch (error) {
        return exceptionHandler(res, error, "menuLinkController", "getSerializeMenuLinks");
    }
}

exports.updateMenuSerialization = async (req, res) => {
    const getData = req.body;

    // Top-level schema to validate the request payload
    const schema = Joi.object({
        permissionVal: Joi.object().required().label('Permission value').messages({
            'any.required': '{#label} is a required field.',
        }),
        permissionRawValue: Joi.object({
            adminConsoleId: Joi.number().greater(0).required().label('Admin Console ID').messages({
                'number.base': '{#label} must be a number.',
                'number.greater': '{#label} must be greater than 0.',
                'any.required': '{#label} is a required field.',
            }),
            userRoleId: Joi.number().greater(0).required().label('Role ID').messages({
                'number.base': '{#label} must be a number.',
                'number.greater': '{#label} must be greater than 0.',
                'any.required': '{#label} is a required field.',
            }),
        }).required().label('Admin console & Role').messages({
            'any.required': '{#label} is a required field.',
        }),
    });

    // Validate the incoming data
    const { error } = schema.validate(getData, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map((item) => item.message);
        return methodResponse(res, errorMessages, 422, 'VALIDATION_ERROR', false, null);
    }

    const getDataPermissionVal = getData.permissionVal;
    const getDataPermissionRawValue = getData.permissionRawValue;

    // Business logic: Save data to DB or process further
    try {

        const getPermisionVal = await db('permissionMaster').where({
            adminConsoleId: getDataPermissionRawValue.adminConsoleId,
            roleId: getDataPermissionRawValue.userRoleId,
            deletedFlag: 0
        }).select('pId').first();;

        if (getPermisionVal) {
            // Update existing permission
            await db('permissionMaster').where('pId', getPermisionVal.pId).update({
                permissionValue: JSON.stringify(getDataPermissionVal), // Save the full object as a JSON string
                permissionArr: JSON.stringify(Object.keys(getDataPermissionVal)) // Save the keys as a JSON array
            });
        } else {
            // Insert new permission
            await db('permissionMaster').insert({
                adminConsoleId: getDataPermissionRawValue.adminConsoleId,
                roleId: getDataPermissionRawValue.userRoleId,
                permissionValue: JSON.stringify(getDataPermissionVal), // Save the full object as a JSON string
                permissionArr: JSON.stringify(Object.keys(getDataPermissionVal)) // Save the keys as a JSON array
            });
        }

        // Respond with success
        return methodResponse(res, "Menu Serialization updated successfully!", 200, "SUCCESS", true, null);
    } catch (error) {
        return exceptionHandler(res, error, "menuLinkController", "updateMenuSerialization");
    }
}


