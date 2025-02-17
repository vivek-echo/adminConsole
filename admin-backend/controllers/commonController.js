const db = require('../db/knexfile');
const { methodResponse ,exceptionHandler} = require('../controllers/indexController');

exports.getParentlinkData = async (req, res) => {
    try {
        const requestData = req.body;
        let queryData = null;
        const linkTypeName = ["GL", "PL", "TAB", "BUTTON"];

        if (requestData.linkTypeId == 2 || requestData.linkTypeId == 3 || requestData.linkTypeId == 4) {
            // Perform a join to fetch parent link names in one query
            queryData = await db('menuLinkMaster as child')
                .leftJoin('menuLinkMaster as parent', 'child.parentLinkId', 'parent.linkId')
                .select(
                    'child.linkName',
                    'child.linkUrl',
                    'child.linkId',
                    'child.parentLinkId',
                    db.raw(`
                        CASE 
                            WHEN child.linkTypeId = 1 THEN "GL" 
                            WHEN child.linkTypeId = 2 THEN "PL" 
                            WHEN child.linkTypeId = 3 THEN "TAB" 
                            WHEN child.linkTypeId = 4 THEN "BUTTON" 
                            ELSE "" 
                        END as linkTypeName
                    `),
                    'parent.linkName as parentName',
                    // 'parent.linkTypeId as parentTypeId',
                    'parent.linkUrl as parentUrl',
                    db.raw(`
                        CASE 
                            WHEN parent.linkTypeId = 1 THEN "GL" 
                            WHEN parent.linkTypeId = 2 THEN "PL" 
                            WHEN parent.linkTypeId = 3 THEN "TAB" 
                            WHEN parent.linkTypeId = 4 THEN "BUTTON" 
                            ELSE "" 
                        END as parentLinkTypeName
                    `),
                )
                .where({
                    'child.adminConsoleId': requestData.adminConsoleId,
                    'child.deletedFlag': 0,
                    'child.linkTypeId': requestData.linkTypeId - 1,
                }).orderBy('child.parentLinkId', 'asc');

        }

        return methodResponse(res, "Get Parent Link Data works!", 200, "SUCCESS", true, queryData);
    } catch (error) {
        return exceptionHandler(res, error, "commomController", "getParentlinkData");
    }
};

exports.getUserRoles = async (req, res) => {
    try {
        const { adminConsoleId } = req.body;
        // Execute the query
        const queryData = await db('role_master')
            .select('roleId', 'roleName')
            .where({ adminConsoleId, deletedFlag: 0 });

        return methodResponse(res, "User roles fetched successfully!", 200, "SUCCESS", true, queryData);
    } catch (error) {
        return exceptionHandler(res, error, "commomController", "getUserRoles");
    }
};
