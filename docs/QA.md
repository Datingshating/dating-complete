# Snift Mobile App - QA Checklist

## Overview
This comprehensive QA checklist covers all major features and functionality of the Snift mobile app built with React Native (Expo, TypeScript). Each section includes test cases, expected behaviors, and edge cases to verify.

---

## 1. Registration & Approval Flow

### 1.1 User Registration
**Test Cases:**
- [ ] **Valid Registration**
  - Fill all required fields (name, gender, date of birth, WhatsApp number, Instagram handle, location, bio, relationship status, partner expectations, 6 interests)
  - Verify bio has minimum 25 words
  - Verify partner expectations has minimum 25 words
  - Verify exactly 6 interests are selected
  - Accept terms and conditions
  - Submit registration
  - **Expected:** Success message with approval pending notification

- [ ] **Form Validation**
  - Submit empty form
  - **Expected:** Validation errors for all required fields
  - Test bio with < 25 words
  - **Expected:** "Bio must be at least 25 words" error
  - Test partner expectations with < 25 words
  - **Expected:** "Partner expectations must be at least 25 words" error
  - Select < 6 interests
  - **Expected:** "Please select exactly 6 interests" error
  - Submit without accepting terms
  - **Expected:** "Please accept the Terms and Conditions" error

- [ ] **Field-Specific Validation**
  - Invalid WhatsApp number format
  - Invalid Instagram handle format
  - Future date of birth
  - Custom location when "Others" is selected but field is empty

### 1.2 Admin Approval Process
**Test Cases:**
- [ ] **Admin Login**
  - Login with admin credentials
  - **Expected:** Access to admin panel with pending registrations

- [ ] **View Pending Registrations**
  - Navigate to admin screen
  - **Expected:** List of users with "pending" status
  - Verify user details are displayed correctly

- [ ] **Approve User**
  - Select a pending user
  - Click "Approve" button
  - Confirm approval
  - **Expected:** Success message, user status changes to "approved"
  - **Expected:** Credentials generated and ready for WhatsApp delivery

- [ ] **Reject User** (if implemented)
  - Select a pending user
  - Click "Reject" button
  - **Expected:** User status changes to "rejected"

### 1.3 Post-Approval Login
**Test Cases:**
- [ ] **Login with Generated Credentials**
  - Use unique ID and password received via WhatsApp
  - **Expected:** Successful login, redirect to main app
  - **Expected:** User profile data loaded correctly

- [ ] **Invalid Credentials**
  - Wrong login ID
  - **Expected:** "Invalid credentials" error
  - Wrong password
  - **Expected:** "Invalid credentials" error

---

## 2. Discovery Feed with Filters & Pagination

### 2.1 Discovery Feed Loading
**Test Cases:**
- [ ] **Initial Feed Load**
  - Open Dating tab
  - **Expected:** Profiles load with infinite scroll
  - **Expected:** Loading skeleton while fetching
  - **Expected:** 20 profiles per page initially

- [ ] **Pagination**
  - Scroll to bottom of feed
  - **Expected:** More profiles load automatically
  - **Expected:** Loading indicator at bottom
  - **Expected:** No duplicate profiles

### 2.2 Filter Functionality
**Test Cases:**
- [ ] **Age Range Filter**
  - Set age range (e.g., 25-35)
  - Apply filter
  - **Expected:** Only profiles within age range shown
  - **Expected:** Filter persists across pagination

- [ ] **Gender Filter**
  - Select specific gender
  - Apply filter
  - **Expected:** Only profiles of selected gender shown

- [ ] **Relationship Status Filter**
  - Select relationship status
  - Apply filter
  - **Expected:** Only profiles with matching status shown

- [ ] **Location Filter**
  - Select location
  - Apply filter
  - **Expected:** Only profiles from selected location shown

- [ ] **Multiple Filters**
  - Apply multiple filters simultaneously
  - **Expected:** Results match all applied filters
  - Clear all filters
  - **Expected:** All profiles shown again

### 2.3 Profile Actions
**Test Cases:**
- [ ] **Like Profile**
  - Swipe right or tap like button
  - **Expected:** Profile marked as liked
  - **Expected:** Next profile shown
  - **Expected:** Request sent if mutual interest

- [ ] **Skip Profile**
  - Swipe left or tap skip button
  - **Expected:** Profile marked as skipped
  - **Expected:** Next profile shown
  - **Expected:** Profile won't appear again

- [ ] **View Profile Details**
  - Tap on profile card
  - **Expected:** Full profile details shown
  - **Expected:** All interests displayed
  - **Expected:** Bio and partner expectations visible

---

## 3. Requests Management

### 3.1 Send Request
**Test Cases:**
- [ ] **Send Connection Request**
  - Like a profile that likes you back
  - **Expected:** Request sent successfully
  - **Expected:** Success message displayed
  - **Expected:** Request appears in outgoing requests

- [ ] **Request Limits**
  - Try to send request when at limit
  - **Expected:** Appropriate error message
  - **Expected:** Suggestion to upgrade pack

### 3.2 Incoming Requests
**Test Cases:**
- [ ] **View Incoming Requests**
  - Navigate to Requests tab
  - **Expected:** List of pending requests
  - **Expected:** Requestor details displayed
  - **Expected:** Request message visible

- [ ] **Accept Request**
  - Tap "Accept" on a request
  - **Expected:** Confirmation dialog
  - Confirm acceptance
  - **Expected:** Request accepted, match created
  - **Expected:** Success message
  - **Expected:** Request removed from list
  - **Expected:** Match appears in Matches tab

- [ ] **Decline Request**
  - Tap "Decline" on a request
  - **Expected:** Confirmation dialog
  - Confirm decline
  - **Expected:** Request declined
  - **Expected:** Request removed from list

- [ ] **Request Limits on Acceptance**
  - Try to accept when at matches limit
  - **Expected:** "Matches limit reached" error
  - **Expected:** Option to view packs for upgrade

### 3.3 Outgoing Requests
**Test Cases:**
- [ ] **View Outgoing Requests**
  - Navigate to Requests tab
  - Switch to "Sent" tab
  - **Expected:** List of sent requests
  - **Expected:** Request status displayed

- [ ] **Withdraw Request**
  - Tap "Withdraw" on sent request
  - **Expected:** Confirmation dialog
  - Confirm withdrawal
  - **Expected:** Request withdrawn
  - **Expected:** Request removed from list

---

## 4. Matches Management

### 4.1 View Matches
**Test Cases:**
- [ ] **Matches List**
  - Navigate to Matches tab
  - **Expected:** List of all matches
  - **Expected:** Match details displayed
  - **Expected:** Last activity timestamp

- [ ] **Match Details**
  - Tap on a match
  - **Expected:** Full match profile shown
  - **Expected:** All profile information visible
  - **Expected:** "Start Chat" button available

### 4.2 Start Chat
**Test Cases:**
- [ ] **Open Chat from Match**
  - Tap "Start Chat" on match
  - **Expected:** Chat screen opens
  - **Expected:** Chat history loads (if any)
  - **Expected:** Input field ready for typing

---

## 5. Real-Time Chat

### 5.1 Chat Functionality
**Test Cases:**
- [ ] **Send Message**
  - Type message in chat input
  - Tap send button
  - **Expected:** Message appears in chat
  - **Expected:** Message sent to recipient
  - **Expected:** Timestamp displayed

- [ ] **Receive Message**
  - Have another user send message
  - **Expected:** Message appears in real-time
  - **Expected:** Message appears in correct order
  - **Expected:** Sender name displayed

- [ ] **Message History**
  - Open existing chat
  - **Expected:** Previous messages loaded
  - **Expected:** Messages in chronological order
  - **Expected:** Proper message formatting

### 5.2 Real-Time Features
**Test Cases:**
- [ ] **Typing Indicators**
  - Start typing in chat
  - **Expected:** "User is typing..." indicator shown to recipient
  - Stop typing
  - **Expected:** Typing indicator disappears after timeout

- [ ] **Message Status**
  - Send message
  - **Expected:** Message status updates (sent, delivered, read)
  - **Expected:** Visual indicators for message status

### 5.3 Connection Management
**Test Cases:**
- [ ] **Socket Connection**
  - Open app
  - **Expected:** WebSocket connects successfully
  - **Expected:** Authentication successful
  - **Expected:** Connection status indicator (if visible)

- [ ] **Reconnection**
  - Disconnect internet
  - **Expected:** Connection lost indicator
  - Reconnect internet
  - **Expected:** Automatic reconnection
  - **Expected:** Messages sync properly

- [ ] **Offline Mode**
  - Go offline while in chat
  - Try to send message
  - **Expected:** Message queued for sending
  - Come back online
  - **Expected:** Queued messages sent automatically

### 5.4 Chat List
**Test Cases:**
- [ ] **Chat List View**
  - Navigate to Chat tab
  - **Expected:** List of all active chats
  - **Expected:** Last message preview
  - **Expected:** Unread message count
  - **Expected:** Timestamp of last activity

- [ ] **Chat Navigation**
  - Tap on chat in list
  - **Expected:** Opens specific chat thread
  - **Expected:** Chat history loads

---

## 6. Packs & Payments

### 6.1 View Available Packs
**Test Cases:**
- [ ] **Pack Display**
  - Navigate to Profile > Packs
  - **Expected:** Available packs displayed
  - **Expected:** Pack details (price, matches, requests)
  - **Expected:** Current pack highlighted

- [ ] **Pack Information**
  - View each pack
  - **Expected:** Clear pricing information
  - **Expected:** Feature comparison
  - **Expected:** Popular pack marked

### 6.2 WhatsApp Payment
**Test Cases:**
- [ ] **WhatsApp Payment Link**
  - Select a pack
  - Tap "Purchase"
  - **Expected:** WhatsApp opens with payment link
  - **Expected:** Payment instructions displayed
  - **Expected:** Correct amount shown

- [ ] **WhatsApp Not Installed**
  - Uninstall WhatsApp
  - Try to purchase pack
  - **Expected:** Error message about WhatsApp requirement

### 6.3 QR Code Payment
**Test Cases:**
- [ ] **QR Code Generation**
  - Select pack for QR payment
  - **Expected:** QR code modal opens
  - **Expected:** QR code displays correctly
  - **Expected:** Payment amount shown
  - **Expected:** UPI payment instructions

- [ ] **QR Code Scanning**
  - Scan QR code with UPI app
  - **Expected:** Payment details pre-filled
  - **Expected:** Correct amount and merchant details

### 6.4 Payment Status Updates
**Test Cases:**
- [ ] **Payment Verification**
  - Complete payment via WhatsApp/QR
  - **Expected:** Payment status updates
  - **Expected:** Pack activated automatically
  - **Expected:** New limits reflected in app

- [ ] **Manual Pack Activation**
  - For QR payments, manual activation
  - **Expected:** Admin can activate pack
  - **Expected:** User receives confirmation

---

## 7. Profile Management

### 7.1 Edit Profile
**Test Cases:**
- [ ] **Profile Fields**
  - Navigate to Profile > Edit Profile
  - **Expected:** All editable fields shown
  - **Expected:** Current values pre-filled

- [ ] **Bio Validation**
  - Edit bio with < 25 words
  - Try to save
  - **Expected:** "Bio must be at least 25 words" error
  - Edit bio with ≥ 25 words
  - **Expected:** Validation passes

- [ ] **Partner Expectations Validation**
  - Edit partner expectations with < 25 words
  - Try to save
  - **Expected:** "Partner expectations must be at least 25 words" error
  - Edit with ≥ 25 words
  - **Expected:** Validation passes

- [ ] **Interest Selection**
  - Change interests
  - Select < 6 interests
  - **Expected:** "Please select exactly 6 interests" error
  - Select exactly 6 interests
  - **Expected:** Validation passes

- [ ] **Save Changes**
  - Make valid changes
  - Tap "Save"
  - **Expected:** Success message
  - **Expected:** Changes reflected in profile
  - **Expected:** Changes visible to other users

### 7.2 Interest Management
**Test Cases:**
- [ ] **Interest Selection**
  - Open interest selection modal
  - **Expected:** List of available interests
  - **Expected:** Current selections highlighted
  - Select interests
  - **Expected:** Selected interests marked
  - **Expected:** Counter shows selected count

- [ ] **Interest Validation**
  - Select < 6 interests
  - **Expected:** Cannot proceed
  - Select > 6 interests
  - **Expected:** Cannot select more
  - Select exactly 6
  - **Expected:** Can proceed

### 7.3 Location Management
**Test Cases:**
- [ ] **Location Selection**
  - Open location picker
  - **Expected:** List of available locations
  - Select location
  - **Expected:** Location updated
  - **Expected:** Changes saved

- [ ] **Custom Location**
  - Select "Others" location
  - **Expected:** Custom location input appears
  - Enter custom location
  - **Expected:** Custom location saved

---

## 8. Error Handling

### 8.1 API Error Handling
**Test Cases:**
- [ ] **401 Unauthorized**
  - Expire user session
  - Try to perform action
  - **Expected:** Automatic logout
  - **Expected:** Redirect to login screen
  - **Expected:** Storage cleared

- [ ] **500 Server Error**
  - Simulate server error
  - Try to perform action
  - **Expected:** User-friendly error message
  - **Expected:** Retry option available
  - **Expected:** App remains functional

- [ ] **Network Timeout**
  - Simulate slow network
  - Try to load data
  - **Expected:** Loading timeout
  - **Expected:** Retry mechanism
  - **Expected:** Offline mode activated

### 8.2 Offline Mode
**Test Cases:**
- [ ] **Offline Detection**
  - Disconnect internet
  - **Expected:** Offline banner appears
  - **Expected:** Cached data still accessible
  - **Expected:** New actions queued

- [ ] **Offline Actions**
  - Go offline
  - Try to send message
  - **Expected:** Message queued
  - Try to like profile
  - **Expected:** Action queued
  - Come back online
  - **Expected:** Queued actions executed

- [ ] **Data Persistence**
  - Go offline
  - Navigate between screens
  - **Expected:** Cached data displayed
  - **Expected:** No crashes or errors

### 8.3 Form Validation Errors
**Test Cases:**
- [ ] **Registration Errors**
  - Submit invalid registration data
  - **Expected:** Specific field errors
  - **Expected:** Form remains filled
  - **Expected:** User can correct errors

- [ ] **Login Errors**
  - Enter wrong credentials
  - **Expected:** "Invalid credentials" message
  - **Expected:** Login form remains accessible

---

## 9. Dark Mode & Visual Design

### 9.1 Theme Consistency
**Test Cases:**
- [ ] **Color Scheme**
  - Navigate through all screens
  - **Expected:** Consistent color palette
  - **Expected:** Proper contrast ratios
  - **Expected:** Brand colors used correctly

- [ ] **Typography**
  - Check all text elements
  - **Expected:** Consistent font families
  - **Expected:** Proper font sizes
  - **Expected:** Good readability

### 9.2 UI Components
**Test Cases:**
- [ ] **Buttons**
  - Test all button states
  - **Expected:** Proper hover/press states
  - **Expected:** Consistent styling
  - **Expected:** Clear visual feedback

- [ ] **Cards & Lists**
  - Check profile cards
  - **Expected:** Proper shadows and borders
  - **Expected:** Consistent spacing
  - **Expected:** Good visual hierarchy

- [ ] **Navigation**
  - Test tab navigation
  - **Expected:** Clear active states
  - **Expected:** Consistent icons
  - **Expected:** Proper spacing

### 9.3 Responsive Design
**Test Cases:**
- [ ] **Different Screen Sizes**
  - Test on various device sizes
  - **Expected:** Layout adapts properly
  - **Expected:** No content cut off
  - **Expected:** Touch targets appropriate size

---

## 10. Performance Testing

### 10.1 Large Lists Performance
**Test Cases:**
- [ ] **Discovery Feed Performance**
  - Load feed with 100+ profiles
  - **Expected:** Smooth scrolling
  - **Expected:** No memory leaks
  - **Expected:** Fast initial load

- [ ] **Chat List Performance**
  - Load chat list with 50+ conversations
  - **Expected:** Smooth scrolling
  - **Expected:** Fast message loading
  - **Expected:** Efficient memory usage

- [ ] **Matches List Performance**
  - Load matches list with 100+ matches
  - **Expected:** Smooth scrolling
  - **Expected:** Fast profile loading
  - **Expected:** Efficient rendering

### 10.2 Memory Management
**Test Cases:**
- [ ] **Memory Usage**
  - Use app for extended period
  - **Expected:** Memory usage remains stable
  - **Expected:** No memory leaks
  - **Expected:** Proper cleanup on navigation

- [ ] **Image Loading**
  - Load many profile images
  - **Expected:** Efficient image caching
  - **Expected:** Proper image cleanup
  - **Expected:** No memory spikes

### 10.3 Network Performance
**Test Cases:**
- [ ] **Slow Network**
  - Test on slow 3G connection
  - **Expected:** Graceful loading states
  - **Expected:** Proper timeouts
  - **Expected:** Retry mechanisms

- [ ] **Data Usage**
  - Monitor data consumption
  - **Expected:** Efficient API calls
  - **Expected:** Proper caching
  - **Expected:** Minimal unnecessary requests

---

## 11. Edge Cases & Stress Testing

### 11.1 Boundary Conditions
**Test Cases:**
- [ ] **Empty States**
  - No matches found
  - **Expected:** Appropriate empty state message
  - No incoming requests
  - **Expected:** Helpful empty state
  - No chat history
  - **Expected:** Welcome message

- [ ] **Maximum Limits**
  - Reach maximum matches limit
  - **Expected:** Clear limit reached message
  - **Expected:** Upgrade prompt
  - Reach maximum requests limit
  - **Expected:** Appropriate messaging

### 11.2 Concurrent Actions
**Test Cases:**
- [ ] **Multiple Rapid Actions**
  - Rapidly like/skip profiles
  - **Expected:** All actions processed
  - **Expected:** No duplicate requests
  - Rapidly send messages
  - **Expected:** Messages sent in order
  - **Expected:** No message loss

### 11.3 App State Management
**Test Cases:**
- [ ] **Background/Foreground**
  - Put app in background
  - **Expected:** Socket connection maintained
  - Bring app to foreground
  - **Expected:** Data refreshed
  - **Expected:** No connection issues

- [ ] **App Restart**
  - Force close app
  - Reopen app
  - **Expected:** Previous state restored
  - **Expected:** Login maintained
  - **Expected:** Data synchronized

---

## 12. Security Testing

### 12.1 Authentication Security
**Test Cases:**
- [ ] **Token Management**
  - Check token storage
  - **Expected:** Tokens stored securely
  - **Expected:** Automatic token refresh
  - **Expected:** Proper token cleanup on logout

- [ ] **Session Management**
  - Test session timeout
  - **Expected:** Automatic logout on expiry
  - **Expected:** Proper session cleanup

### 12.2 Data Security
**Test Cases:**
- [ ] **Sensitive Data**
  - Check data transmission
  - **Expected:** HTTPS used for all API calls
  - **Expected:** Sensitive data encrypted
  - **Expected:** No sensitive data in logs

---

## 13. Accessibility Testing

### 13.1 Screen Reader Support
**Test Cases:**
- [ ] **VoiceOver/TalkBack**
  - Enable screen reader
  - Navigate through app
  - **Expected:** All elements accessible
  - **Expected:** Proper labels and descriptions

### 13.2 Visual Accessibility
**Test Cases:**
- [ ] **High Contrast**
  - Enable high contrast mode
  - **Expected:** App remains usable
  - **Expected:** Good contrast ratios

- [ ] **Font Scaling**
  - Increase system font size
  - **Expected:** App adapts to larger fonts
  - **Expected:** No layout breaking

---

## 14. Cross-Platform Testing

### 14.1 iOS Specific
**Test Cases:**
- [ ] **iOS Navigation**
  - Test iOS-specific navigation patterns
  - **Expected:** Native iOS feel
  - **Expected:** Proper back button behavior

- [ ] **iOS Permissions**
  - Test notification permissions
  - **Expected:** Proper permission requests
  - **Expected:** Graceful handling of denied permissions

### 14.2 Android Specific
**Test Cases:**
- [ ] **Android Navigation**
  - Test Android back button
  - **Expected:** Proper back button handling
  - **Expected:** Native Android feel

- [ ] **Android Permissions**
  - Test Android permissions
  - **Expected:** Proper permission requests
  - **Expected:** Runtime permission handling

---

## 15. Integration Testing

### 15.1 API Integration
**Test Cases:**
- [ ] **API Endpoint Testing**
  - Test all API endpoints
  - **Expected:** Proper request/response handling
  - **Expected:** Error responses handled correctly
  - **Expected:** Data validation working

### 15.2 Third-Party Integration
**Test Cases:**
- [ ] **WhatsApp Integration**
  - Test WhatsApp payment links
  - **Expected:** Links open correctly
  - **Expected:** Proper deep linking

- [ ] **UPI Integration**
  - Test QR code payments
  - **Expected:** QR codes scan correctly
  - **Expected:** Payment details pre-filled

---

## Test Execution Guidelines

### Pre-Test Setup
1. Ensure test environment is properly configured
2. Have test user accounts ready (regular user, admin user)
3. Prepare test data (profiles, matches, messages)
4. Set up network simulation tools for offline testing

### Test Data Requirements
- Multiple user profiles with different characteristics
- Various match scenarios (mutual likes, one-way likes)
- Chat history with different message types
- Different pack configurations
- Edge case data (empty profiles, long messages, etc.)

### Reporting
- Document all test results with screenshots
- Note any bugs with detailed reproduction steps
- Track performance metrics (load times, memory usage)
- Verify all acceptance criteria are met

### Sign-off Criteria
- All critical and high-priority test cases pass
- No blocking bugs remain
- Performance meets requirements
- Security requirements satisfied
- Accessibility standards met

---

*This QA checklist should be executed thoroughly before any production release. Regular regression testing should be performed after each update to ensure existing functionality remains intact.*
