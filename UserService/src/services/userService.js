const { saveUserPreferences, softDeleteUser, getUser, updateProfileImagePath, updateCoverImagePath, getBadge,getBillingHistory,getTrainingSession,getSubscriptionDetails } = require('../controllers/userController')
const HttpStatus = require('../enums/httpStatus')
const { fireBaseStorage } = require('../../config/firebase')
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage")

exports.updateUser = async (req, res) => {
    
    const payload = req?.body
    const id = req?.params?.id
    
    const response = await saveUserPreferences(id, payload)

    res.status(response.status).json(response.body)
}

exports.deleteUser = async (req, res) => {
    const id = req?.body?.userId

    const response = await softDeleteUser(id)

    res.status(response.status).json(response.body)
}

exports.getUserById = async (req, res) => {
    const userId = req?.params?.id

    const response = await getUser(userId)

    res.status(response.status).json(response.body)
}

exports.getUserAllDetails = async (req, res) => {
    const userId = req?.params?.id;

    const response = await getUser(userId);

    if (response?.status === 200) {

        let retrievedUser = response?.body.toObject();
        let myBadgesArray = [];
        const subId = retrievedUser?.MyPlanId;

        if (retrievedUser?.MyBadges.length > 0) {
            const myBadgesIdList = retrievedUser?.MyBadges.map(badge => badge.badgeId);

            //Get user badges
            const badgeRes = await getBadge(myBadgesIdList);

            if (badgeRes?.status === 200) {
                myBadgesArray = badgeRes?.body;

                // Add badgeDate to the badge objects in myBadgesArray
                myBadgesArray = myBadgesArray.map(badge => {
                    const userBadge = retrievedUser?.MyBadges.find(b => b?.badgeId === badge?.badgeId);
                    return { ...badge, badgeDate: userBadge?.badgeDate };
                });
            }
        }

        retrievedUser["MyBadges"] = myBadgesArray;

        //Get user session records
        let sessionRecordsArray = [];
        const sessionRes = await getTrainingSession(userId);

        if (sessionRes?.status === 200) {
            sessionRecordsArray = sessionRes?.body;
        }
        retrievedUser["TrainingSessions"] = sessionRecordsArray;

        //Get user subscription details
        const subRes = await getSubscriptionDetails(subId);

        retrievedUser["subscription"] = subRes?.body || null;

        //Get user billing history details
        let billingHistoryArray = [];
        const billingRes = await getBillingHistory(userId);

        if (billingRes?.status === 200) {
            billingHistoryArray = billingRes?.body;
        }
        retrievedUser["BillingHistory"] = billingHistoryArray;
        
        res.status(HttpStatus.OK).json(retrievedUser);
    }
    else {
        res.status(HttpStatus.NOT_FOUND).json(response.body);
    }
}

exports.handleProfileImageUpload = async (req, res) => {

    const userId = req?.params?.id;
    let file = req?.file;

    if (!file) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'No file uploaded' });
    }


    const fileExtension = file?.originalname.split('.').pop();
    const fileName = `${userId}_proPic.${fileExtension}`;
    const storageRef = ref(fireBaseStorage, `uploads/${fileName}`);

    try {
        const metadata = {
            contentType: file.mimetype,
        };
        const snapshot = await uploadBytes(storageRef, file.buffer, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const response = await updateProfileImagePath(userId, downloadURL);
        res.status(response.status).json(response.body);

    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
};


exports.handleCoverImageUpload = async (req, res) => {

    const userId = req?.params?.id;
    let file = req?.file;

    if (!file) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'No file uploaded' });
    }


    const fileExtension = file?.originalname.split('.').pop();
    const fileName = `${userId}_coverPic.${fileExtension}`;
    const storageRef = ref(fireBaseStorage, `uploads/${fileName}`);

    try {
        const metadata = {
            contentType: file.mimetype,
        };
        const snapshot = await uploadBytes(storageRef, file.buffer, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const response = await updateCoverImagePath(userId, downloadURL);
        res.status(response.status).json(response.body);

    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
};