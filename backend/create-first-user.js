const admin = require('firebase-admin');

// Initialize Firebase Admin (assuming ADC is already set up)
admin.initializeApp({
  projectId: 'automore-b9159'
});

const db = admin.firestore();

async function createFirstUser() {
  try {
    console.log('🔧 Creating first user profile...');
    
    const userEmail = 'arnovanheerden77@gmail.com';
    const password = 'Test12345';
    
    // Step 1: Create Firebase Auth user
    console.log('👤 Creating Firebase Auth user...');
    const userRecord = await admin.auth().createUser({
      email: userEmail,
      password: password,
      displayName: 'Arno van Heerden',
      emailVerified: true
    });
    
    console.log('✅ Firebase Auth user created:', userRecord.uid);
    
    // Step 2: Create company first
    console.log('🏢 Creating company...');
    const companyData = {
      name: 'Automore',
      email: userEmail,
      phone: '',
      address: '',
      website: '',
      industry: 'Technology',
      size: 'Small',
      status: 'ACTIVE',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: userRecord.uid,
      settings: {
        timezone: 'Africa/Johannesburg',
        currency: 'ZAR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h'
      }
    };
    
    const companyRef = await db.collection('companies').add(companyData);
    console.log('✅ Company created:', companyRef.id);
    
    // Step 3: Create user profile in Firestore
    console.log('📝 Creating user profile in Firestore...');
    const userProfileData = {
      uid: userRecord.uid,
      email: userEmail,
      firstName: 'Arno',
      lastName: 'van Heerden',
      phoneNumber: '',
      role: 'BUSINESS_ADMIN',
      status: 'ACTIVE',
      companyId: companyRef.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: null,
      emailVerified: true
    };
    
    await db.collection('users').doc(userRecord.uid).set(userProfileData);
    console.log('✅ User profile created in Firestore');
    
    console.log('🎉 Setup complete!');
    console.log('User details:');
    console.log('  Email:', userEmail);
    console.log('  Role:', 'BUSINESS_ADMIN');
    console.log('  Company:', 'Automore');
    console.log('  Company ID:', companyRef.id);
    console.log('  User ID:', userRecord.uid);
    
    console.log('\n🚀 You can now login with:');
    console.log('  Email:', userEmail);
    console.log('  Password:', password);
    
  } catch (error) {
    console.error('❌ Error creating first user:', error);
    
    // If user already exists, we might need to just update the profile
    if (error.code === 'auth/email-already-exists') {
      console.log('🔄 User already exists, trying to update profile...');
      try {
        const existingUser = await admin.auth().getUserByEmail(userEmail);
        console.log('Found existing user:', existingUser.uid);
        
        // Check if user profile exists in Firestore
        const userDoc = await db.collection('users').doc(existingUser.uid).get();
        if (userDoc.exists) {
          console.log('✅ User profile already exists in Firestore');
          const userData = userDoc.data();
          console.log('Current user data:', {
            email: userData.email,
            role: userData.role,
            companyId: userData.companyId || 'NOT SET'
          });
        } else {
          console.log('❌ User profile missing in Firestore - this needs to be fixed manually');
        }
      } catch (updateError) {
        console.error('Error checking existing user:', updateError);
      }
    }
  }
}

createFirstUser().then(() => {
  console.log('Done!');
  process.exit(0);
});