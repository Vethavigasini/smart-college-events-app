# Smart College Event Management System - Test ID Inventory

This document lists all stable test identifiers added to the React Native interactive elements. These identifiers are mapped to `testID` (for native tests) and `accessibilityLabel` where applicable.

## 🔑 Authentication Screen (`app/(auth)/login.tsx`)

| Identifier | Element Type | Description |
| :--- | :--- | :--- |
| `login_email` | `TextInput` | Email Address input field |
| `login_password` | `TextInput` | Password input field |
| `login_submit` | `TouchableOpacity` | Sign In button |
| `login_signup_link` | `TouchableOpacity` | "Create Account" navigation link |
| `demo_student` | `TouchableOpacity` | Fills form with student credentials |
| `demo_admin` | `TouchableOpacity` | Fills form with admin credentials |
| `demo_faculty` | `TouchableOpacity` | Fills form with faculty credentials |

## 📝 Registration Screen (`app/(auth)/register.tsx`)

| Identifier | Element Type | Description |
| :--- | :--- | :--- |
| `signup_back_btn` | `TouchableOpacity` | Navigate back to Login screen |
| `signup_role_student` | `TouchableOpacity` | Role selector chip: Student |
| `signup_role_admin` | `TouchableOpacity` | Role selector chip: Admin |
| `signup_role_faculty` | `TouchableOpacity` | Role selector chip: Faculty |
| `signup_name` | `TextInput` | Full name input field |
| `signup_email` | `TextInput` | Email address input field |
| `signup_password` | `TextInput` | Password input field |
| `signup_confirm_password` | `TextInput` | Password confirmation input field |
| `signup_dept_<dept_name>` | `TouchableOpacity` | Department selection chip (e.g. `signup_dept_computer_science`) |
| `signup_submit` | `TouchableOpacity` | Create Account submit button |
| `signup_login_link` | `TouchableOpacity` | "Sign In" redirect link |

## 📅 Events Listing Screen (`app/student/events.tsx`)

| Identifier | Element Type | Description |
| :--- | :--- | :--- |
| `dashboard_search` | `TextInput` | Query input for searching events |
| `event_sort_btn` | `TouchableOpacity` | Opens sorting modal bottom sheet |
| `sort_option_<option_name>`| `TouchableOpacity` | Sort options (e.g. `sort_option_date_soonest`, `sort_option_seats_available`) |
| `category_chip_<category>` | `TouchableOpacity` | Category chips (e.g. `category_chip_technology`, `category_chip_cultural`) |
| `status_filter_<status>` | `TouchableOpacity` | Status tab buttons (e.g. `status_filter_upcoming`, `status_filter_ongoing`) |
| `event_card_<event_id>` | `TouchableOpacity` | Card container navigating to detailed event view |

## ℹ️ Event Detail Screen (`app/event/[id].tsx`)

| Identifier | Element Type | Description |
| :--- | :--- | :--- |
| `event_register` | `TouchableOpacity` | Opens registration form modal sheet |
| `event_registration_phone` | `TextInput` | Phone input field in modal sheet |
| `event_registration_submit`| `TouchableOpacity` | Confirms and submits registration |
| `event_cancel` | `TouchableOpacity` | Cancels existing registration |

## 👤 Profile Screen (`app/student/profile.tsx`)

| Identifier | Element Type | Description |
| :--- | :--- | :--- |
| `profile_edit` | `TouchableOpacity` | Switches profile card to editing mode |
| `profile_save` | `TouchableOpacity` | Saves edited phone details |
| `profile_phone_input` | `TextInput` | Editable phone field during editing mode |
| `logout_button` | `TouchableOpacity` | Sign out button |

## 📊 Admin Dashboard Screen (`app/admin/dashboard.tsx`)

| Identifier | Element Type | Description |
| :--- | :--- | :--- |
| `admin_quick_create_event` | `TouchableOpacity` | Quick action card to create event |
| `admin_quick_attendance` | `TouchableOpacity` | Quick action card to track attendance |
| `admin_quick_analytics` | `TouchableOpacity` | Quick action card to view analytics |
| `admin_quick_users` | `TouchableOpacity` | Quick action card to list members |
| `admin_create_event` | `TouchableOpacity` | "New" event button |
| `admin_view_event_<id>` | `TouchableOpacity` | Opens event detailed screen |
| `admin_update_event_<id>` | `TouchableOpacity` | Edit event details form |
| `admin_delete_event_<id>` | `TouchableOpacity` | Deletes selected event |

## ✏️ Admin Create/Edit Event Screen (`app/admin/create-event.tsx`)

| Identifier | Element Type | Description |
| :--- | :--- | :--- |
| `admin_create_back` | `TouchableOpacity` | Go back to dashboard |
| `admin_create_cat_<category>`| `TouchableOpacity` | Event category chips |
| `admin_create_title` | `TextInput` | Title field |
| `admin_create_short_desc` | `TextInput` | Short description field |
| `admin_create_desc` | `TextInput` | Full description field |
| `admin_create_start_date` | `TextInput` | Start datetime field |
| `admin_create_end_date` | `TextInput` | End datetime field |
| `admin_create_venue` | `TextInput` | Venue title field |
| `admin_create_venue_address`| `TextInput` | Venue address details |
| `admin_create_organizer` | `TextInput` | Organizing committee name |
| `admin_create_org_email` | `TextInput` | Organizing email |
| `admin_create_org_phone` | `TextInput` | Organizing phone |
| `admin_create_capacity` | `TextInput` | Max seats count |
| `admin_create_price` | `TextInput` | Entry fee |
| `admin_create_tags` | `TextInput` | Comma separated tags |
| `admin_create_featured_switch`| `Switch` | Highlights event on home page |
| `admin_create_event` | `TouchableOpacity` | Submit form button (when creating event) |
| `admin_update_event` | `TouchableOpacity` | Submit form button (when editing event) |

## 📷 Admin Attendance Tracking Screen (`app/admin/attendance.tsx`)

| Identifier | Element Type | Description |
| :--- | :--- | :--- |
| `admin_attendance_back` | `TouchableOpacity` | Go back to dashboard |
| `admin_attendance_event_<id>`| `TouchableOpacity` | Horizontal event selection chips |
| `admin_attendance_simulate` | `TouchableOpacity` | Simulate QR code scan button |
| `admin_attendance_mark_<id>` | `TouchableOpacity` | Manually mark attendee as present |
