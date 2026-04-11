const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Razorpay = require('razorpay');

admin.initializeApp();

const instance = new Razorpay({
    key_id: 'rzp_test_dummykey',
    key_secret: 'rzp_test_dummysecret',
});

exports.transferPayment = functions.firestore
    .document('requests/{requestId}')
    .onUpdate(async (change, context) => {
        const newValue = change.after.data();
        const previousValue = change.before.data();

        if (newValue.status === 'approved' && previousValue.status !== 'approved') {
            const amount = newValue.amount || 50000; // Default 500 INR in paise

            // For now, we mock transferring 80% to a standard account
            const ownerId = newValue.ownerId;
            let targetAccountId = 'acc_DummyOwnerId123'; // Fallback
            
            try {
                // Fetch user to get real account if it exists
                if (ownerId) {
                    const userDoc = await admin.firestore().collection('users').doc(ownerId).get();
                    if (userDoc.exists && userDoc.data().razorpayAccountId) {
                        targetAccountId = userDoc.data().razorpayAccountId;
                    }
                }

                await instance.transfers.create({
                    account: targetAccountId,
                    amount: Math.floor(amount * 0.8),
                    currency: "INR"
                });
                console.log(`Successfully transferred ${amount * 0.8} paise to ${targetAccountId}`);
            } catch (error) {
                console.error("Error creating transfer", error);
            }
        }
        return null;
    });

exports.generateSignedUrl = functions.https.onCall(async (data, context) => {
    const { filePath, requestId } = data;
    
    const bucket = admin.storage().bucket();
    const expiresAt = Date.now() + 48 * 60 * 60 * 1000;
    
    const [url] = await bucket.file(filePath).getSignedUrl({
        action: 'read',
        expires: expiresAt
    });

    await admin.firestore().collection('requests').doc(requestId).update({
        signedUrl: url,
        expiresAt: expiresAt
    });

    return { signedUrl: url, expiresAt: expiresAt };
});
