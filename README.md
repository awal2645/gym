# Gym Trainer Course Plan Website

A production-ready web application for a gym trainer course plan website built with React.js, Tailwind CSS, Laravel API, Pusher for real-time chat, and PayPal for payments.

## Tech Stack

- **Frontend**: React.js + Tailwind CSS + React Router
- **Backend**: Laravel 12 (API)
- **Real-time**: Pusher (Laravel Broadcasting)
- **Payments**: PayPal Checkout
- **Authentication**: Laravel Sanctum

## Features

### Public Features
- Landing page with hero section, benefits, testimonials, pricing, and FAQ
- Multi-step quiz/form checker to recommend plans
- Pricing cards with plan details

### Authentication
- User registration and login
- Password reset functionality
- Protected routes (requires authentication)

### Checkout & Payments
- PayPal integration for secure payments
- Server-side payment verification
- Purchase history tracking

### User Dashboard
- View current plan and purchase details
- Access to course modules
- Support chat entry point

### Real-time Chat
- One-to-one chat between users and admin
- Real-time messaging using Pusher
- Message delivery timestamps
- Unread message indicators

### Admin Panel
- Manage training plans (CRUD)
- View all purchases
- Chat with users
- Admin-only routes and middleware

## Installation & Setup

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+ and npm
- SQLite (or MySQL/PostgreSQL)
- Pusher account (free tier available)
- PayPal Developer account (for sandbox testing)

### Backend Setup (Laravel)

1. **Install PHP dependencies:**
   ```bash
   composer install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Update `.env` file with your configuration:**
   ```env
   APP_URL=http://localhost:8000
   FRONTEND_URL=http://localhost:5173
   
   DB_CONNECTION=sqlite
   # Or use MySQL/PostgreSQL
   
   # PayPal (Sandbox)
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   PAYPAL_MODE=sandbox
   
   # Pusher
   PUSHER_APP_ID=your_pusher_app_id
   PUSHER_APP_KEY=your_pusher_app_key
   PUSHER_APP_SECRET=your_pusher_app_secret
   PUSHER_APP_CLUSTER=mt1
   
   BROADCAST_DRIVER=pusher
   ```

4. **Create database (if using SQLite):**
   ```bash
   touch database/database.sqlite
   ```

5. **Run migrations:**
   ```bash
   php artisan migrate
   ```

6. **Seed database (creates admin user and sample plans):**
   ```bash
   php artisan db:seed
   ```

   Default admin credentials:
   - Email: `admin@gymtrainer.com`
   - Password: `password`

7. **Publish Sanctum configuration (if needed):**
   ```bash
   php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
   ```

8. **Configure CORS in `config/cors.php` (if file exists) or in `bootstrap/app.php`:**
   ```php
   ->withMiddleware(function (Middleware $middleware) {
       $middleware->api(prepend: [
           \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
       ]);
       
       $middleware->validateCsrfTokens(except: [
           'api/*',
       ]);
   })
   ```

### Frontend Setup (React)

1. **Install Node dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file in root (for Vite):**
   ```env
   VITE_API_URL=http://localhost:8000/api
   VITE_PUSHER_APP_KEY=your_pusher_app_key
   VITE_PUSHER_APP_CLUSTER=mt1
   VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
   ```

3. **Build assets (production):**
   ```bash
   npm run build
   ```

   Or run dev server:
   ```bash
   npm run dev
   ```

## Running the Application

### Development Mode

1. **Start Laravel server:**
   ```bash
   php artisan serve
   ```

2. **Start Vite dev server (in another terminal):**
   ```bash
   npm run dev
   ```

3. **Start queue worker (for broadcasting):**
   ```bash
   php artisan queue:work
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/api

### Using the Dev Script

The project includes a convenient dev script that runs everything:

```bash
composer run dev
```

This will start:
- Laravel server
- Queue worker
- Vite dev server
- Log viewer

## Pusher Setup

1. **Create a Pusher account** at https://pusher.com
2. **Create a new app** and get your credentials
3. **Update `.env`** with your Pusher credentials
4. **Enable broadcasting** in Laravel by setting `BROADCAST_DRIVER=pusher`

## PayPal Setup

1. **Create a PayPal Developer account** at https://developer.paypal.com
2. **Create a sandbox app** to get Client ID and Secret
3. **Update `.env`** with your PayPal credentials
4. **For production**, switch to `PAYPAL_MODE=live` and use live credentials

## API Endpoints

### Public Routes
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password
- `GET /api/plans` - Get all active plans
- `GET /api/plans/{id}` - Get specific plan

### Protected Routes (require authentication)
- `POST /api/logout` - Logout user
- `GET /api/me` - Get authenticated user
- `POST /api/checkout/create-order` - Create PayPal order
- `POST /api/checkout/capture-order` - Capture PayPal payment
- `GET /api/purchases/me` - Get user's purchases
- `GET /api/chat/conversations/me` - Get user conversations
- `GET /api/chat/messages/me` - Get messages
- `POST /api/chat/messages` - Send message

### Admin Routes (require admin role)
- `GET /api/admin/plans` - Get all plans
- `POST /api/admin/plans` - Create plan
- `PUT /api/admin/plans/{id}` - Update plan
- `DELETE /api/admin/plans/{id}` - Delete plan
- `GET /api/admin/purchases` - Get all purchases
- `GET /api/admin/chat/users` - Get all users for chat
- `GET /api/admin/chat/messages/{userId}` - Get messages with user
- `POST /api/admin/chat/messages/{userId}` - Send message to user

## Database Structure

- **users**: User accounts with role (user/admin)
- **plans**: Training plans with pricing and features
- **purchases**: Purchase records linked to users and plans
- **messages**: Chat messages between users and admin

## Security Features

- Laravel Sanctum for API authentication
- Password hashing
- CSRF protection
- Private channel authorization for Pusher
- Server-side PayPal payment verification
- Admin role middleware
- Route protection

## Testing

Run Laravel tests:
```bash
php artisan test
```

## Production Deployment

1. Set `APP_ENV=production` and `APP_DEBUG=false` in `.env`
2. Run `php artisan config:cache`
3. Run `php artisan route:cache`
4. Run `npm run build` to compile assets
5. Set up proper database (MySQL/PostgreSQL)
6. Configure web server (Nginx/Apache)
7. Set up SSL certificates
8. Use production PayPal and Pusher credentials

## Troubleshooting

### CORS Issues
- Ensure `FRONTEND_URL` in `.env` matches your frontend URL
- Check Sanctum stateful domains configuration

### Pusher Not Working
- Verify Pusher credentials in `.env`
- Ensure queue worker is running
- Check browser console for Pusher connection errors

### PayPal Issues
- Verify PayPal credentials
- Check PayPal sandbox mode is enabled for testing
- Review server logs for PayPal API errors

## License

This project is open-sourced software licensed under the MIT license.
