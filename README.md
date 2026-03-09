# Campus Forum - Q&A and Achievements Platform

A Django-based platform for college students and faculty to post questions/answers and share achievements.

## Features

### Q&A System
- Post questions with categories and tags
- Browse questions with search functionality
- Sort by newest, most voted, or most answered
- Filter by category or tag
- Post answers to questions
- Edit/delete own questions and answers
- Upvote/downvote questions and answers
- Mark best answer (question author only)
- Answer count display on question list
- Pagination for long lists

### User System
- User registration and authentication
- User profiles with reputation points
- View user's questions and answers
- Edit profile bio
- Reputation system:
  - +5 for posting a question
  - +3 for posting an answer
  - +1 for receiving an upvote
  - +10 for best answer

### Achievements
- Post student achievements (hackathons, competitions, awards)
- Edit/delete own achievements
- Image uploads for achievements
- Pagination for achievements list

### Media
- Image uploads for questions and achievements
- Image display on detail/list pages

### UI Features
- Relative timestamps ("2h ago", "3d ago")
- Vote counts and answer counts
- Best answer highlighting
- Success/error messages
- Responsive forms

## Setup Instructions

1. Install dependencies:
```
pip install -r requirements.txt
```

2. Run migrations (already done):
```
python manage.py migrate
```

3. Create a superuser for admin access:
```
python manage.py createsuperuser
```

4. Create some categories via admin panel:
```
python manage.py runserver
```
Visit http://127.0.0.1:8000/admin and add categories like "Programming", "Mathematics", "Science", etc.

5. Run the development server:
```
python manage.py runserver
```

## Usage

- **Home**: http://127.0.0.1:8000/ - Lists all questions with search and filters
- **Register**: http://127.0.0.1:8000/qa/register/ - Create new account
- **Login**: http://127.0.0.1:8000/accounts/login/ - Login with credentials
- **Achievements**: http://127.0.0.1:8000/achievements/ - Lists all achievements
- **User Profile**: Click on any username to view their profile
- **Admin Panel**: http://127.0.0.1:8000/admin/ - Manage content (admin/admin123)

## Project Structure

- `qa/` - Questions and Answers app
- `achievements/` - Student achievements app
- `templates/` - HTML templates
- `campus_forum/` - Main project settings

## Next Steps

- Add proper frontend styling (CSS framework like Bootstrap)
- Add email notifications for new answers
- Add rich text editor for formatting
- Add image compression/optimization
- Add more advanced search (full-text search)
- Add comment system for answers
- Add follow/subscribe to questions
