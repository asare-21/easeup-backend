
//**MODELS/
//**USER MODEL */
/**
 * @swagger
 * components:
 *   schemas:
 *     Users:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - finished
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         email:
 *           type: string
 *           description: The email of your user
 *         token:
 *           type: string
 *           description: The token of the user
 *         profile_name:
 *           type: string
 *           description: The profile name of the user
 *         phone:
 *           type: string
 *           description: The phone number of the user
 *         code:
 *           type: string
 *           description: The verification code for user
 *         email_verified:
 *           type: boolean
 *           description: Is user having a verified email?
 *         address:
 *           $ref: '#/components/schemas/Address'
 *         date_joined:
 *           type: string
 *           description: The date the user joined
 *         last_login:
 *           type: string
 *           format: date
 *           description: The last login date of the user
 *         profile_picture:
 *           type: string
 *           description: The profile picture of the user
 *         dob:
 *           type: string
 *           format: date
 *           description: The phone number of the user
 *         gender:
 *           type: string
 *           format: date
 *           description: The date of birth of the user
 *         rooms:
 *           type: array
 *           description: The rooms for the user
 *         ghc_number:
 *           type: string
 *           description: The ghana card number of the user
 *         ghc_exp:
 *           type: string
 *           description: The ghana card expiry of the user
 *         ghc_image:
 *           type: string
 *           description: The ghana card image of the user
 *         googleId:
 *           type: string
 *           description: The googleId for the user
 *         facebookUserId:
 *           type: string
 *           description: The facebookId for the user
 *         twitterId:
 *           type: string
 *           description: The twitterId for the user
 *         displayName:
 *           type: string
 *           description: The display name of the user
 *       example:
 *         id: d5fE_asz
 *         email: The New Turing Omnibus
 *         token: jdhjhdkdkhkhd
 *         profile_name: Rafique Adam
 *         phone: +233544413229
 *         code: ""
 *         email_verified: True
 *         date_joined: 20th March 2023
 *         last_login: 30 July 2023
 *         profile_picture: https://image.jpeg
 *         dob: 20th March 1991
 *         gender: male
 *         rooms: ""
 *         ghc_number: ""
 *         ghc_verified: True
 *         ghc_expiry: ""
 *         ghc_image: ""
 *         googleId: ""
 *         facebookId: ""
 *         twitterId: ""
 *         display_name: ""
 * 
 */
//**BOOKMARKS MODEL */
/**
 * @swagger
 * components:
 *   schemas:
 *     Bookmarks:
 *       type: object
 *       required:
 *         - user
 *         - worker_profile
 *         - created_at
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the bookmark
 *         user:
 *           type: string
 *           description: The user id
 *         worker_profile:
 *           type: string
 *           description: The worker profile
 *         created_at:
 *           type: string
 *           description: The date the bookmark was created
 *       example:
 *         id: d5fE_asz
 *         user: 6666tuhh
 *         worker_profile: jdhjhdkdkhkhd
 *         created_at: 20th March 2023.
 * 
 */
//**NOTIFICATIONS MODEL */
/**
 * @swagger
 * components:
 *   schemas:
 *     Notifications:
 *       type: object
 *       required:
 *         - user
 *         - title
 *         - message
 *         - type
 *         - date
 *         - read
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the notification
 *         user:
 *           type: string
 *           description: The user id
 *         title:
 *           type: string
 *           description: The title of the notification
 *         message:
 *           type: string
 *           description: The message of the notification
 *         type:
 *           type: string
 *           description: The type of notification
 *         date:
 *           type: string
 *           description: The date of the notification
 *         read:
 *           type: boolean
 *           description: TIf notification has been read
 *       example:
 *         id: d5fE_asz
 *         user: 6666tuhh
 *         title: Welcome
 *         message: Hello this is a message
 *         type: text
 *         date: 20th March 2023.
 *         read: True
 * 
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       properties:
 *         address:
 *           type: string
 *           description: The address of the user
 *         latlng:
 *           type: string
 *           description: The latitude and longitude of the user
 */



//**USER
//** Create User Request Body
/**
 * @swagger
 * components:
 *   schemas:
 *     CreateUser:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The email of the user
 *           required: true
 *         profile_name:
 *           type: string
 *           description: The profile name for the user
 * 
 *         last_login:
 *           type: string
 *           format: date
 *           description: Last login for the user
 *         token:
 *           type: string
 *           description: Token for the user
 */

//** Update User Image Request Body
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUserImage:
 *       type: object
 *       properties:
 *         profile_picture:
 *           type: string
 *           description: The profile picture of the user
 *           required: true
 */
//** Update User Address Request Body
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUserAddress:
 *       type: object
 *       properties:
 *         address:
 *           type: string
 *           description: The address of the user
 *           required: true
 *         latlng:
 *           type: string
 *           description: The latitude and longitude of the user
 *           required: true
 */
//** Update User Gender Request Body
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUserGender:
 *       type: object
 *       properties:
 *         gender:
 *           type: string
 *           description: The gender of the user
 *           required: true
 */
//** Update User Token Request Body
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUserToken:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: The token of the user
 *           required: true
 */
//** Update User Phone Request Body
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUserPhone:
 *       type: object
 *       properties:
 *         phone:
 *           type: string
 *           description: The phone number of the user
 *           required: true
 */
//** Update User Ghana Card Request Body
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUserGhanaCard:
 *       type: object
 *       properties:
 *         profile_picture:
 *           type: string
 *           description: The profile picture of the user
 *           required: true
 */
//** Update User Info Request Body
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUserInfo:
 *       type: object
 *       properties:
 *         gender:
 *           type: string
 *           description: The gender of the user
 *           required: true
 *         dob:
 *           type: string
 *           description: The dob of the user
 *           required: true
 *         phone:
 *           type: string
 *           description: The phone of the user
 *           required: true
 *         address:
 *           type: string
 *           description: The address of the user
 *           required: true
 */

//** Update User Phone Send Code Request Body
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUserPhoneSendCode:
 *       type: object
 *       properties:
 *         phone:
 *           type: string
 *           description: The phone number of the user
 *           required: true
 */
//** Update User Phone Verify Code Request Body
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUserPhoneVerifyCode:
 *       type: object
 *       properties:
 *         phone:
 *           type: string
 *           description: The phone number of the user
 *           required: true
 *         code:
 *           type: string
 *           description: The code of the user
 *           required: true
 */ 
//** Update User Notifications Request Body
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUserNotification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The id  of the user
 *           required: true
 */ 

/**
 * 
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The users managing API
 * /users/create:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       200:
 *         description: The created user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Users'
 *       500:
 *         description: Some server error
 * /users/:user:
 *   delete:
 *     summary: Deletes a  user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: user Profile Deleted 
 *         content:
 *           application/json:
 *             schema:
 *       500:
 *         description: Some server error
 * /users/profile/:user_id:
 *   get:
 *     summary: Retrieves a user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User Found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Users'
 *       500:
 *         description: Some server error
 * /users/update/image:
 *   post:
 *     summary: Updates a users image
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserImage'
 *     responses:
 *       200:
 *         description: Profile updated.
 *         content:
 *           application/json:
 *             schema:
 *       500:
 *         description: Some server error
 * /users/update/address:
 *   post:
 *     summary: Updates a users address 
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserAddress'
 *     responses:
 *       200:
 *         description: Profile updated.
 *         content:
 *           application/json:
 *             schema:
 *       500:
 *         description: Some server error
 * /users/update/gender:
 *   post:
 *     summary: Updates a users gender
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserGender'
 *     responses:
 *       200:
 *         description: Profile updated.
 *         content:
 *           application/json:
 *             schema:
 *       500:
 *         description: Some server error
 * /users/update/token:
 *   post:
 *     summary: Updates token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserToken' 
 *     responses:
 *       200:
 *         description: Profile updated.
 *         content:
 *           application/json:
 *             schema:
 *       500:
 *         description: Some server error
 * /users/update/phone:
 *   post:
 *     summary: Updates phone
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserPhone'
 *     responses:
 *       200:
 *         description: Profile updated.
 *         content:
 *           application/json:
 *             schema:
 *       500:
 *         description: Some server error
 * /users/update/ghc:
 *   post:
 *     summary: Updates ghana card
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserGhanaCard'
 *     responses:
 *       200:
 *         description: Profile updated.
 *         content:
 *           application/json:
 *             schema:
 *       500:
 *         description: Some server error
 * /users/update:
 *   post:
 *     summary: Updates user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserInfo'
 *     responses:
 *       200:
 *         description: Profile updated.
 *         content:
 *           application/json:
 *             schema:
 *       500:
 *         description: Some server error
 * /users/update/phone/send-code:
 *   post:
 *     summary: Updates phone send code
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserPhone'
 *     responses:
 *       200:
 *         description: Verification code has been sent to phone.
 *         content:
 *           application/json:
 *             schema:
 *       500:
 *         description: Some server error
 * /users/update/phone/verify-code:
 *   post:
 *     summary: verify phone code
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserPhoneVerifyCode'
 *     responses:
 *       200:
 *         description: Code has been verified successfully.
 *         content:
 *           application/json:
 *             schema:
 *       500:
 *         description: Some server error
 * /users/nofications/update/:user_id:
 *   post:
 *     summary: Notification updated
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserNotification'
 *     responses:
 *       200:
 *         description: Notification updated
 *         content:
 *           application/json:
 *             schema:
 *       500:
 *         description: Some server error
 * /users/nofications/:user_id:
 *   get:
 *     summary: Retrieves notifications
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Notifications Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notifications'
 *       500:
 *         description: Some server error
 * /users/bookmarks:
 *   get:
 *     summary: Retrieves a bookmark
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Bookmarks Found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bookmarks'
 *       500:
 *         description: Some server error
 * /users/bookmarks/delete:
 *   delete:
 *     summary: deletes a bookmark
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Bookmark Deleted.
 *         content:
 *           application/json:
 *             schema:
 *       500:
 *         description: Some server error
 */



