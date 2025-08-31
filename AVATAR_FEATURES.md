# Avatar Features

This project now includes comprehensive avatar management capabilities for users.

## Features

### 1. Avatar Selection During Signup
- Users can choose from 6 predefined avatar options when creating an account
- Each avatar has a unique name and visual style
- Default avatar is automatically selected if none is chosen

### 2. Avatar Management
- Users can change their avatar at any time through the Profile page
- Access profile page via navigation menu
- Choose from predefined avatars or upload custom images

### 3. Custom Avatar Upload
- Support for JPG, PNG, and GIF formats
- Maximum file size: 5MB
- Real-time preview before upload
- Automatic validation and error handling

### 4. Avatar Display
- Avatars are displayed in:
  - Mobile navigation header
  - Sidebar user info
  - Profile page
  - All user-related components

## Technical Implementation

### Components Created
- `AvatarSelector`: Dropdown selector for predefined avatars
- `AvatarUploader`: File upload component for custom avatars
- `Profile`: Main profile management page

### Database Updates
- User documents now include an `avatar` field
- Existing users automatically get a default avatar
- Avatar updates are persisted to the database

### API Functions
- `createAccount`: Now accepts avatar parameter
- `updateUserAvatar`: New function to update user avatars
- `getCurrentUser`: Returns user data including avatar

## Usage

### For New Users
1. Go to signup page
2. Fill in name and email
3. Choose an avatar from the dropdown
4. Complete signup process

### For Existing Users
1. Navigate to Profile page
2. Click on current avatar to open selector
3. Choose new predefined avatar or upload custom image
4. Save changes

### Avatar Options
- Cool Person (default)
- Smart Person
- Stylish Person
- Bearded Person
- Curly Hair Person
- Long Hair Person

## File Structure
```
components/
├── AvatarSelector.tsx      # Avatar selection dropdown
├── AvatarUploader.tsx      # Custom avatar upload
├── Profile.tsx            # Profile management page
└── ...

app/(root)/
└── profile/
    └── page.tsx           # Profile page route

lib/actions/
└── user.actions.ts        # Updated user management functions

constants/
└── index.ts               # Avatar options and configuration
```

## Future Enhancements
- Integration with cloud storage for custom avatars
- Avatar cropping and editing tools
- More avatar customization options
- Avatar themes and categories
