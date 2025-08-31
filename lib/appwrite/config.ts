// Validate environment variables
const validateEnvVars = () => {
  const requiredVars = [
    'NEXT_PUBLIC_APPWRITE_ENDPOINT',
    'NEXT_PUBLIC_APPWRITE_PROJECT',
    'NEXT_PUBLIC_APPWRITE_DATABASE',
    'NEXT_PUBLIC_APPWRITE_USERS_COLLECTION',
    'NEXT_PUBLIC_APPWRITE_FILES_COLLECTION',
    'NEXT_PUBLIC_APPWRITE_BUCKET',
    'NEXT_APPWRITE_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    if (typeof window === 'undefined') { // Server-side only
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }
};

// Validate on import
validateEnvVars();

export const appwriteConfig = {
  endpointUrl: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT!,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
  usersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION!,
  filesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_FILES_COLLECTION!,
  bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET!,
  secretKey: process.env.NEXT_APPWRITE_KEY!,
};
