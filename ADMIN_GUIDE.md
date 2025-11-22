# Admin Guide - SecureVote Blockchain Voting System

## Admin Access

### Default Admin Credentials
- **Official ID**: ADMIN001
- **Email**: admin@securevote.com
- **Password**: admin123

### Admin Registration
New admins can register at `/admin-login` with:
- Official Government ID Number
- Full Name
- Email Address
- Phone Number
- Department (Election Commission, Government, Security, IT Admin)
- Official Designation
- Password

## Admin Features

### 1. Dashboard Overview
- View active elections count
- Monitor total candidates
- Track approved voters
- Check pending user approvals

### 2. Election Management
- **Create Elections**: Set title, description, start/end dates, and type
- **Election Types**: General, Local, Referendum, Special
- **Election Status**: Scheduled, Active, Completed
- **Edit Elections**: Modify election details
- **Start/Stop Elections**: Control election timing

### 3. Candidate Management
- **Add Candidates**: Enter candidate details for specific elections
- **Candidate Information**:
  - Name
  - Party/Affiliation
  - Age
  - Qualification
  - Manifesto/Platform
- **Edit/Remove Candidates**: Modify or remove candidate entries

### 4. User Registration Management
- **View All Registrations**: Filter by status (All, Pending, Approved, Rejected)
- **Approve/Reject Users**: Control voter eligibility
- **User Details**: View complete registration information

### 5. Election Results
- **View Results**: Monitor voting results by election
- **Real-time Updates**: Live vote counting
- **Result Analysis**: Comprehensive election statistics

## Admin Workflow

### Setting Up an Election

1. **Login** to admin dashboard
2. **Navigate** to Elections section
3. **Create Election**:
   - Enter election title and description
   - Set start and end dates/times
   - Select election type
4. **Add Candidates**:
   - Go to Candidates section
   - Select the election
   - Add candidate details
5. **Approve Voters**:
   - Review user registrations
   - Approve eligible voters
6. **Start Election**:
   - Activate election when ready
   - Monitor voting progress

### Managing Voter Registrations

1. **Review Applications**: Check pending registrations
2. **Verify Information**: Validate user details
3. **Approve/Reject**: Make approval decisions
4. **Monitor Status**: Track registration statistics

## Security Features

- **Official ID Authentication**: Admins must provide government-issued ID
- **Role-based Access**: Different admin roles and permissions
- **Session Management**: Secure login sessions
- **Audit Trail**: Track all admin actions

## API Endpoints

### Authentication
- `POST /api/admin/register` - Register new admin
- `POST /api/admin/login` - Admin login

### Elections
- `GET /api/admin/elections` - List all elections
- `POST /api/admin/elections` - Create new election

### Candidates
- `GET /api/admin/candidates` - List candidates
- `POST /api/admin/candidates` - Add new candidate

### User Management
- `GET /api/admin/registrations` - List user registrations
- `POST /api/admin/approve/:id` - Approve user
- `POST /api/admin/reject/:id` - Reject user
- `GET /api/admin/stats` - Get registration statistics

## Access URLs

- **Admin Login**: `http://localhost:3003/admin-login`
- **Admin Dashboard**: `http://localhost:3003/admin-dashboard`
- **Legacy Admin Panel**: `http://localhost:3003/admin`

## Notes

- All admin actions are logged for audit purposes
- Elections can only be modified before they start
- Voter approvals are final and cannot be reversed
- Results are available in real-time during active elections