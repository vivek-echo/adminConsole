const db = require('../db/knexfile');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { methodResponse } = require('../controllers/indexController');
const { decryptCryptoJsString } = require('../helper/cryptoEncrption');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, username: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY }
  );
};

const validatePassword = async (plainPassword, hashedPassword) => {
  // Fix bcrypt version compatibility if necessary
  return await bcrypt.compare(plainPassword, hashedPassword.replace('$2y$', '$2a$'));
};

exports.login = async (req, res) => {
  try {
    const encryptedData = req.body;
    const decryptedData = await decryptCryptoJsString(encryptedData);

    const { email, password } = decryptedData;
    // Retrieve user from the database
    const user = await db('users')
      .select('users.id', 'users.email', 'users.password', 'users.name', 'users.userType', 'users.roleId', 'role_master.roleName') // Add required columns
      .leftJoin('role_master', 'users.roleId', 'role_master.roleId') // Join condition
      .where('users.email', email) // Filter condition
      .first(); // To get the first record


    if (!user) {
      return methodResponse(res, "Invalid UserId. Please provide valid credentials!", 200, "ERROR", false, null);
    }

    // Validate password
    const isPasswordValid = await validatePassword(password, user.password);
    if (!isPasswordValid) {
      return methodResponse(res, "Incorrect Password. Please provide valid credentials!", 200, "ERROR", false, null);
    }

    // Generate JWT token
    const token = generateToken(user);

    const { password: _, ...userData } = user;
    const responseData = {
      userData: userData,
      token: token,
      userMenu: await exports.handleUserMenuData(1, userData.roleId)
    };

    return methodResponse(res, "Login successful", 200, "SUCCESS", true, responseData);

  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    return methodResponse(res, "An error occurred during login. Please try again later.", 400, "ERROR", false, null);
  }

};

exports.handleUserMenuData = async (adminType, roleId) => {
  try {
    let roleMenus = [];

    // Fetch menu permissions
    const menuPermission = await db('permissionMaster')
      .where({
        adminConsoleId: adminType,
        roleId: roleId,
        deletedFlag: 0,
      })
      .first();

    if (menuPermission) {
      const permission = JSON.parse(menuPermission.permissionValue);
      const permissionKeys = Object.keys(permission);

      // Fetch menu data
      const menuData = await db('menuLinkMaster')
        .where({
          adminConsoleId: adminType,
          deletedFlag: 0,
        })
        .whereIn('linkId', permissionKeys)
        .orderByRaw(`FIELD(linkId, ${permissionKeys.join(',')})`);

      // Format menu data
      const parentLinks = menuData.filter((item) => item.linkTypeId === 1);
      const childLinks = menuData.filter((item) => item.linkTypeId === 2);
      const tabLinks = menuData.filter((item) => item.linkTypeId === 3);
      const buttonLinks = menuData.filter((item) => item.linkTypeId === 4); // Assuming linkTypeId 4 is for buttons

      roleMenus = parentLinks.map((parent) => {
        const plLinks = childLinks
          .filter((child) => child.parentLinkId === parent.linkId)
          .map((child) => {
            const plTabs = tabLinks
              .filter((tab) => tab.parentLinkId === child.linkId)
              .map((tab) => {
                const tabButtons = buttonLinks
                  .filter((btn) => btn.parentLinkId === tab.linkId)
                  .map((btn) => ({
                    btn_id: btn.linkId,
                    btn_name: btn.linkName,
                    btn_path: btn.linkUrl,
                    btn_class: btn.iconClass,
                    btn_radio: permission[btn.linkId],
                  }));

                return {
                  tab_id: tab.linkId,
                  tab_name: tab.linkName,
                  tab_path: tab.linkUrl,
                  tab_class: tab.iconClass,
                  tab_radio: permission[tab.linkId],
                  tab_buttons: tabButtons, // Add buttons under tabs
                };
              });

            return {
              pl_id: child.linkId,
              pl_name: child.linkName,
              pl_path: child.linkUrl,
              pl_class: child.iconClass,
              pl_radio: permission[child.linkId],
              pl_tab: plTabs,
            };
          });

        return {
          gl_id: parent.linkId,
          gl_name: parent.linkName,
          gl_path: parent.linkUrl,
          gl_class: parent.iconClass,
          gl_radio: permission[parent.linkId],
          pl_links: plLinks,
        };
      });
    }

    // Cache in Redis
    // if (roleMenus.length > 0) {
    //   const redisKey = getAccessRoleRedisKey(adminType, roleId);
    //   await redis.set(redisKey, JSON.stringify(roleMenus));
    // }

    return roleMenus;
  } catch (error) {
    console.error('Error fetching navigation data:', error.message);
    return [];
  }
};

