## Installation

### 1. Clone the repository
git clone https://github.com/ielmsd/Cash-Plus.git

### 2. Backend setup
1- cd backend
2- composer install
3- copy .env.example .env
4- php artisan key:generate

### 3. Configure database in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cash_plus
DB_USERNAME=root
DB_PASSWORD=

### 4. Run migrations + seed data
php artisan migrate --seed

### 5. Start backend server
php artisan serve

Frontend Setup
### 6. Frontend setup
1- cd ../frontend
2- npm install
3- npm run dev
